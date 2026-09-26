import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black, useFonts,
} from '@expo-google-fonts/inter';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Storage from 'expo-sqlite/kv-store';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { IntroAnimation } from '@/components/intro-animation';
import { WelcomeBack } from '@/components/welcome-back';
import { Brand } from '@/constants/brand';
import { AppStateProvider } from '@/lib/app-state';
import { PortfolioProvider } from '@/lib/portfolio';
import { ProgressProvider } from '@/lib/progress';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: Brand.primary, background: Brand.background, card: Brand.background },
};

/**
 * Root navigator: the tab bar, plus the coin detail screen that opens on top of it.
 * PortfolioProvider shares the user's portfolio with every screen.
 */
const LAUNCHED_KEY = 'has-launched';
const AWAY_MS = 2 * 60 * 1000; // back after 2 min in the background = "welcome back"

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
  });
  // Very first launch: the lamppost animation. Every launch after that: the "Coucou toi" one.
  const [opening, setOpening] = useState<'first' | 'back' | null>(() =>
    Storage.getItemSync(LAUNCHED_KEY) === 'true' ? 'back' : 'first',
  );
  const leftAt = useRef<number | null>(null);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Also say hi when the user comes back to the app after a while
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt.current = Date.now();
      if (state === 'active' && leftAt.current && Date.now() - leftAt.current > AWAY_MS) setOpening('back');
      if (state === 'active') leftAt.current = null;
    });
    return () => sub.remove();
  }, []);

  function openingDone() {
    Storage.setItemSync(LAUNCHED_KEY, 'true');
    setOpening(null);
  }

  if (!fontsLoaded) return null; // the splash screen stays up meanwhile

  return (
    <ThemeProvider value={theme}>
      <AppStateProvider>
      <PortfolioProvider>
      <ProgressProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerTintColor: Brand.primary, headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
          <Stack.Screen name="coin/[id]" options={{ title: '', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="finances" options={{ title: '', headerBackTitle: 'Accueil' }} />
          <Stack.Screen name="lesson/[id]" options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }} />
        </Stack>
        {opening === 'first' && <IntroAnimation onDone={openingDone} />}
        {opening === 'back' && <WelcomeBack onDone={openingDone} />}
      </ProgressProvider>
      </PortfolioProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
