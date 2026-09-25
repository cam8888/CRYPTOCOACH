import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAppState } from '@/lib/app-state';

/** The tabs are only shown once the intro is done and the user is signed in. */
export default function TabsLayout() {
  const { onboardingDone, signedIn } = useAppState();
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (!signedIn) return <Redirect href="/sign-in" />;
  return <AppTabs />;
}
