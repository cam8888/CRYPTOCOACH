import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CoinRow } from '@/components/coin-row';
import { Brand, Radius, Space } from '@/constants/brand';
import { usePrices } from '@/hooks/use-prices';
import { COINS } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';
import { useAppState } from '@/lib/app-state';
import { STARTING_CASH, usePortfolio } from '@/lib/portfolio';

/** Home screen: the screen you check to see how your portfolio is doing. */
export default function HomeScreen() {
  const { prices, loading, error, refresh } = usePrices();
  const portfolio = usePortfolio();
  const { replayOnboarding } = useAppState();

  const priceOf = (id: string) => prices.find((p) => p.id === id)?.price ?? 0;
  const cryptoValue = COINS.reduce((sum, coin) => sum + (portfolio.holdings[coin.id] ?? 0) * priceOf(coin.id), 0);
  const total = portfolio.cash + cryptoValue;
  const pnl = total - STARTING_CASH;
  const pnlPct = (total / STARTING_CASH - 1) * 100;
  const owned = COINS.filter((coin) => (portfolio.holdings[coin.id] ?? 0) > 0);
  const pricesReady = prices.length > 0;

  function confirmReset() {
    Alert.alert('Tout recommencer ?', 'Tu repars avec 10 000 $ et zéro crypto. Ton historique sera effacé.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Recommencer', style: 'destructive', onPress: portfolio.reset },
    ]);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Text style={styles.hello}>Salut 👋</Text>
      <Text style={styles.subtitle}>Voilà où en est ton portefeuille.</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Ton portefeuille virtuel</Text>
        <Text style={styles.balance}>{pricesReady ? formatUsd(total) : '…'}</Text>
        {pricesReady && (
          <View style={styles.pnlPill}>
            <Text style={styles.pnlText}>
              {pnl >= 0 ? '▲' : '▼'} {formatUsd(Math.abs(pnl))} ({formatPercent(pnlPct)}) depuis le début
            </Text>
          </View>
        )}
        <Text style={styles.balanceHint}>Cash dispo : {formatUsd(portfolio.cash)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Tes cryptos</Text>
      {owned.length === 0 ? (
        <Text style={styles.muted}>Rien pour l'instant. Va dans « Trader » pour ton premier achat, zéro risque 😉</Text>
      ) : (
        owned.map((coin) => {
          const quantity = portfolio.holdings[coin.id] ?? 0;
          return (
            <CoinRow
              key={coin.id}
              id={coin.id}
              name={coin.name}
              symbol={coin.symbol}
              subtitle={`${quantity.toFixed(5)} ${coin.symbol}`}
              price={quantity * priceOf(coin.id)}
            />
          );
        })
      )}

      <Text style={styles.sectionTitle}>Le marché en direct</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {COINS.map((coin) => {
        const live = prices.find((p) => p.id === coin.id);
        return (
          <CoinRow key={coin.id} id={coin.id} name={coin.name} symbol={coin.symbol} price={live?.price} change24h={live?.change24h} />
        );
      })}

      <Pressable onPress={confirmReset} style={styles.reset}>
        <Text style={styles.resetText}>Recommencer à zéro</Text>
      </Pressable>
      <Pressable onPress={replayOnboarding} style={styles.replay}>
        <Text style={styles.resetText}>Revoir l'introduction</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120, gap: Space.sm },
  hello: { fontSize: 32, fontWeight: '700', color: Brand.navy, marginTop: Space.md },
  subtitle: { fontSize: 16, color: Brand.textSecondary, marginBottom: Space.md },
  balanceCard: { backgroundColor: Brand.primary, borderRadius: Radius.lg, padding: Space.lg, gap: Space.sm },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balance: { color: '#FFFFFF', fontSize: 36, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pnlPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  pnlText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] },
  balanceHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Brand.navy, marginTop: Space.lg },
  muted: { color: Brand.textSecondary, fontSize: 14, lineHeight: 20 },
  error: { color: Brand.danger, fontSize: 14 },
  reset: { alignSelf: 'center', marginTop: Space.xl, padding: Space.sm },
  replay: { alignSelf: 'center', padding: Space.sm },
  resetText: { color: Brand.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
});
