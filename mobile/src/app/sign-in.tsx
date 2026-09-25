import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius, Space } from '@/constants/brand';
import { useAppState } from '@/lib/app-state';

/**
 * Sign-in screen. The Google button will be connected to Supabase Auth
 * in the next step; until then you can continue without an account.
 */
export default function SignInScreen() {
  const { continueAsGuest } = useAppState();

  function guest() {
    continueAsGuest();
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>CryptoCoach</Text>
        <Text style={styles.title}>Prêt·e à te lancer ?</Text>
        <Text style={styles.text}>Connecte-toi pour retrouver ton portefeuille et ta progression sur tous tes appareils.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => Alert.alert('Bientôt dispo', 'La connexion Google arrive dans la prochaine version 😉')}
          style={({ pressed }) => [styles.google, pressed && { opacity: 0.8 }]}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>Continuer avec Google</Text>
        </Pressable>
        <Pressable onPress={guest} style={styles.guest} hitSlop={8}>
          <Text style={styles.guestText}>Continuer sans compte</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background, padding: Space.lg, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', gap: Space.md },
  logo: { color: Brand.primary, fontSize: 18, fontWeight: '800' },
  title: { fontSize: 34, fontWeight: '700', color: Brand.navy, lineHeight: 40 },
  text: { fontSize: 17, color: Brand.textSecondary, lineHeight: 25 },
  actions: { gap: Space.md, paddingBottom: Space.md },
  google: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Space.sm,
    borderWidth: 2, borderColor: Brand.border, borderRadius: Radius.full, paddingVertical: 15,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: Brand.primary },
  googleText: { fontSize: 17, fontWeight: '700', color: Brand.navy },
  guest: { alignItems: 'center', padding: Space.sm },
  guestText: { color: Brand.textSecondary, fontSize: 15, fontWeight: '600' },
});
