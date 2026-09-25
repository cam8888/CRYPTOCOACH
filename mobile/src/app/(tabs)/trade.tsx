import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CoinRow } from '@/components/coin-row';
import { Brand, Radius, Space } from '@/constants/brand';
import { usePrices } from '@/hooks/use-prices';
import { COINS } from '@/lib/coingecko';

/** Trade screen: the list of coins. Tapping one opens its chart and the buy / sell form. */
export default function TradeScreen() {
  const { prices, loading, refresh } = usePrices();

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Text style={styles.title}>Trader</Text>
      <Text style={styles.subtitle}>Choisis une crypto pour l'acheter ou la vendre.</Text>

      {COINS.map((coin) => {
        const live = prices.find((p) => p.id === coin.id);
        return (
          <CoinRow key={coin.id} id={coin.id} name={coin.name} symbol={coin.symbol} price={live?.price} change24h={live?.change24h} />
        );
      })}

      <View style={styles.soon}>
        <Text style={styles.soonText}>Touche une crypto pour voir son graphique, l'acheter ou la vendre.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '700', color: Brand.navy, marginTop: Space.md },
  subtitle: { fontSize: 16, color: Brand.textSecondary, marginBottom: Space.md },
  soon: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Space.md, marginTop: Space.lg },
  soonText: { color: Brand.textSecondary, fontSize: 14, textAlign: 'center' },
});
