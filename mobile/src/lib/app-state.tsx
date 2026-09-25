/**
 * Remembers where the user is in the app's flow:
 * 1. has the intro been seen? 2. is the user signed in?
 * Saved on the phone so the intro only shows once.
 * For now "signed in" means "continued as a guest"; Google sign-in comes next.
 */
import Storage from 'expo-sqlite/kv-store';
import { createContext, ReactNode, useContext, useState } from 'react';

const ONBOARDING_KEY = 'onboarding-done';
const SESSION_KEY = 'session';

type AppStateValue = {
  onboardingDone: boolean;
  signedIn: boolean;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
  continueAsGuest: () => void;
  signOut: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [onboardingDone, setOnboardingDone] = useState(() => Storage.getItemSync(ONBOARDING_KEY) === 'true');
  const [signedIn, setSignedIn] = useState(() => Storage.getItemSync(SESSION_KEY) === 'guest');

  function completeOnboarding() {
    Storage.setItemSync(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
  }

  function replayOnboarding() {
    Storage.removeItemSync(ONBOARDING_KEY);
    setOnboardingDone(false);
  }

  function continueAsGuest() {
    Storage.setItemSync(SESSION_KEY, 'guest');
    setSignedIn(true);
  }

  function signOut() {
    Storage.removeItemSync(SESSION_KEY);
    setSignedIn(false);
  }

  return (
    <AppStateContext.Provider
      value={{ onboardingDone, signedIn, completeOnboarding, replayOnboarding, continueAsGuest, signOut }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
