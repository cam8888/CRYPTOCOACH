/**
 * Remembers where the user is in the app's flow:
 * 1. is the user signed in with Google? An account is required to use the app.
 * 2. has this account seen the 3 intro pages? (shown right after signing up)
 */
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import Storage from 'expo-sqlite/kv-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// The intro pages are shown once per account, right after the first sign-in
const onboardingKey = (userId: string) => `onboarding-done-${userId}`;

type AppStateValue = {
  ready: boolean; // false while the saved Google session is being restored
  onboardingDone: boolean;
  signedIn: boolean;
  session: Session | null;
  firstName: string | null;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
  replayFirstLaunch: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [seenVersion, setSeenVersion] = useState(0); // bumps when the intro flag changes
  const userId = session?.user.id ?? null;
  const onboardingDone = seenVersion >= 0 && userId !== null && Storage.getItemSync(onboardingKey(userId)) === 'true';

  // Restore the saved session, then follow sign-in / sign-out events
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => data.subscription.unsubscribe();
  }, []);

  function completeOnboarding() {
    if (userId) Storage.setItemSync(onboardingKey(userId), 'true');
    setSeenVersion((v) => v + 1);
  }

  function replayOnboarding() {
    if (userId) Storage.removeItemSync(onboardingKey(userId));
    setSeenVersion((v) => v + 1);
  }

  /**
   * Google sign-in: open Google in a browser sheet, then Supabase sends us back
   * to the app with a one-time code that we exchange for a session.
   */
  async function signInWithGoogle(): Promise<boolean> {
    const redirectTo = Linking.createURL('auth-callback');
    // Shown in the Expo terminal: this address must match the Redirect URLs allowed in Supabase
    console.log('[CryptoCoach] Google sign-in redirect:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new Error(error?.message ?? 'Connexion impossible');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log('[CryptoCoach] Google sign-in result:', result.type);
    if (result.type !== 'success') return false; // the user closed the window

    const { queryParams } = Linking.parse(result.url);
    const code = queryParams?.code;
    if (typeof code !== 'string') {
      throw new Error(String(queryParams?.error_description ?? 'Connexion refusée'));
    }
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw new Error(exchangeError.message);
    return true;
  }

  /** Back to square one, as if the app had never been opened: signs out and forgets the intros. */
  async function replayFirstLaunch() {
    Storage.removeItemSync('has-launched'); // the lamppost animation plays again at next launch
    if (userId) Storage.removeItemSync(onboardingKey(userId)); // the 3 intro pages show again after sign-in
    setSeenVersion((v) => v + 1);
    await supabase.auth.signOut();
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const meta = session?.user.user_metadata ?? {};
  const fullName: string | undefined = meta.full_name ?? meta.name;
  const firstName = fullName ? fullName.split(' ')[0] : null;

  return (
    <AppStateContext.Provider
      value={{
        ready,
        onboardingDone,
        signedIn: session !== null,
        session,
        firstName,
        completeOnboarding,
        replayOnboarding,
        replayFirstLaunch,
        signInWithGoogle,
        signOut,
      }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
