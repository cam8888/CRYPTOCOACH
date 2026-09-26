import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius, Space, Font } from '@/constants/brand';
import { useAppState } from '@/lib/app-state';

/**
 * Sign-in screen. An account is required to use the app:
 * the portfolio and progress are saved online, on every phone.
 */
export default function SignInScreen() {
  const { signInWithGoogle } = useAppState();
  const [loading, setLoading] = useState(false);

  async function google() {
    setLoading(true);
    try {
      if (await signInWithGoogle()) router.replace('/');
    } catch (error) {
      Alert.alert('Connexion impossible', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>CryptoCoach</Text>
        <Text style={styles.title}>Prêt·e à te lancer ?</Text>
        <Text style={styles.text}>Crée ton compte en un clic avec Google pour recevoir tes 10 000 $ fictifs et garder ta progression sur tous tes appareils.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={google}
          disabled={loading}
          style={({ pressed }) => [styles.google, pressed && { opacity: 0.8 }]}>
          {loading ? <ActivityIndicator color={Brand.primary} /> : <Text style={styles.googleG}>G</Text>}
          <Text style={styles.googleText}>Continuer avec Google</Text>
        </Pressable>
        <Text style={styles.legal}>Ton compte sert à sauvegarder ton portefeuille fictif et ta progression. Aucun vrai argent, promis.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background, padding: Space.lg, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', gap: Space.md },
  logo: { color: Brand.primary, fontSize: 18, fontFamily: Font.extrabold },
  title: { fontSize: 34, letterSpacing: -0.5, fontFamily: Font.bold, color: Brand.navy, lineHeight: 40 },
  text: { fontSize: 17, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 25 },
  actions: { gap: Space.md, paddingBottom: Space.md },
  google: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Space.sm,
    borderWidth: 2, borderColor: Brand.border, borderRadius: Radius.full, paddingVertical: 15, backgroundColor: Brand.card,
  },
  googleG: { fontSize: 18, fontFamily: Font.extrabold, color: Brand.primary },
  googleText: { fontSize: 17, fontFamily: Font.bold, color: Brand.navy },
  legal: { color: Brand.textSecondary, fontSize: 13, fontFamily: Font.regular, textAlign: 'center', lineHeight: 18 },
});
