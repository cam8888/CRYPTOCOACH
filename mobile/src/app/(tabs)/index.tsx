import { router } from 'expo-router';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MarketOverview } from '@/components/market-overview';
import { ClosedWallet } from '@/components/wallet';
import { Brand, Radius, Space, Font } from '@/constants/brand';
import { useMarkets } from '@/hooks/use-markets';
import { ALL_LESSONS } from '@/data/lessons';
import { useAppState } from '@/lib/app-state';
import { usePortfolio } from '@/lib/portfolio';
import { summarize } from '@/lib/portfolio-summary';
import { useProgress } from '@/lib/progress';

/** Home screen: the screen you check to see how your portfolio is doing. */
export default function HomeScreen() {
  const { markets, loading, error, updatedAt, refresh } = useMarkets();
  const portfolio = usePortfolio();
  const { replayOnboarding, replayFirstLaunch, firstName, session, signOut } = useAppState();
  const { nextLessonId } = useProgress();
  const nextLesson = ALL_LESSONS.find((l) => l.id === nextLessonId);

  const priceOf = (id: string) => markets.find((m) => m.id === id)?.price ?? 0;
  const summary = summarize(portfolio, priceOf);
  const pricesReady = markets.length > 0;

  function confirmReset() {
    Alert.alert('Tout recommencer ?', 'Tu repars avec 10 000 $ et zéro crypto. Ton historique sera effacé.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Recommencer', style: 'destructive', onPress: () => { portfolio.reset().catch((e) => Alert.alert('Oups', e.message)); } },
    ]);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Text style={styles.hello}>Coucou{firstName ? ` ${firstName}` : ''},</Text>
      <Text style={styles.helloSub}>comment ça va aujourd'hui ?</Text>

      <ClosedWallet
        total={pricesReady ? summary.total : null}
        pnl={pricesReady ? summary.pnl : null}
        pnlPct={pricesReady ? summary.pnlPct : null}
        coins={summary.positions.map((p) => p.id)}
      />

      {nextLesson && (
        <Pressable
          onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: nextLesson.id } })}
          style={({ pressed }) => [styles.lessonCard, pressed && { opacity: 0.8 }]}>
          <Text style={styles.lessonKicker}>Ta leçon du jour</Text>
          <Text style={styles.lessonTitle}>{nextLesson.title}</Text>
          <Text style={styles.lessonMeta}>{nextLesson.minutes} min · +{nextLesson.xp} XP →</Text>
        </Pressable>
      )}

      <MarketOverview markets={markets} updatedAt={updatedAt} />
      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={confirmReset} style={styles.reset}>
        <Text style={styles.resetText}>Recommencer à zéro</Text>
      </Pressable>
      <Pressable onPress={replayOnboarding} style={styles.replay}>
        <Text style={styles.resetText}>Revoir l'introduction</Text>
      </Pressable>
      <Pressable onPress={replayFirstLaunch} style={styles.replay}>
        <Text style={styles.resetText}>Revivre le premier lancement</Text>
      </Pressable>
      {session && <Text style={styles.account}>Connecté·e avec {session.user.email}</Text>}
      <Pressable onPress={signOut} style={styles.replay}>
        <Text style={styles.resetText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120, gap: Space.sm },
  hello: { fontSize: 32, letterSpacing: -0.5, fontFamily: Font.bold, color: Brand.navy, marginTop: Space.md },
  helloSub: { fontSize: 22, fontFamily: Font.semibold, color: Brand.textSecondary, marginBottom: Space.sm },
  subtitle: { fontSize: 16, fontFamily: Font.regular, color: Brand.textSecondary, marginBottom: Space.md },
  lessonCard: { backgroundColor: Brand.primarySoft, borderRadius: Radius.md, padding: Space.md, marginTop: Space.sm },
  lessonKicker: { color: Brand.primary, fontSize: 13, fontFamily: Font.bold, textTransform: 'uppercase' },
  lessonTitle: { color: Brand.navy, fontSize: 18, fontFamily: Font.bold, marginTop: Space.xs },
  lessonMeta: { color: Brand.textSecondary, fontSize: 13, fontFamily: Font.regular, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontFamily: Font.bold, color: Brand.navy, marginTop: Space.lg },
  muted: { color: Brand.textSecondary, fontSize: 14, fontFamily: Font.regular, lineHeight: 20 },
  error: { color: Brand.danger, fontSize: 14 , fontFamily: Font.regular},
  reset: { alignSelf: 'center', marginTop: Space.xl, padding: Space.sm },
  replay: { alignSelf: 'center', padding: Space.sm },
  account: { alignSelf: 'center', color: Brand.textSecondary, fontSize: 12, fontFamily: Font.regular, marginTop: Space.md, textAlign: 'center' },
  resetText: { color: Brand.textSecondary, fontSize: 14, fontFamily: Font.regular, textDecorationLine: 'underline' },
});
