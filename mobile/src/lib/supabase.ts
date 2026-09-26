/**
 * Supabase client for the app: sign-in (Google) and the user's data.
 * The session is saved on the phone, so the user stays signed in.
 */
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import Storage from 'expo-sqlite/kv-store';

const storage = {
  getItem: (key: string) => Storage.getItemAsync(key),
  setItem: (key: string, value: string) => Storage.setItemAsync(key, value),
  removeItem: async (key: string) => {
    await Storage.removeItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);
