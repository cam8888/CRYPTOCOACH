import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Brand } from '@/constants/brand';
import { AppStateProvider } from '@/lib/app-state';
import { PortfolioProvider } from '@/lib/portfolio';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: Brand.primary, background: Brand.background },
};

/**
 * Root navigator: the tab bar, plus the coin detail screen that opens on top of it.
 * PortfolioProvider shares the user's portfolio with every screen.
 */
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={theme}>
      <AppStateProvider>
      <PortfolioProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerTintColor: Brand.primary, headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="coin/[id]" options={{ title: '', headerBackTitle: 'Retour' }} />
        </Stack>
      </PortfolioProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
