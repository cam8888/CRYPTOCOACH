import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAppState } from '@/lib/app-state';

/** Sign in first, then the 3 intro pages (once per account), then the tabs. */
export default function TabsLayout() {
  const { ready, onboardingDone, signedIn } = useAppState();
  if (!ready) return null; // wait until the saved Google session is restored
  if (!signedIn) return <Redirect href="/sign-in" />;
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <AppTabs />;
}
