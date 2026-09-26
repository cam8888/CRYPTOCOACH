import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FoxTip } from '@/components/fox';
import { Wallet } from '@/components/wallet';
import { Brand, Font, Radius, Space } from '@/constants/brand';
import { usePrices } from '@/hooks/use-prices';
import { COIN_COLORS, COINS } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';
import { STARTING_CASH, usePortfolio } from '@/lib/portfolio';
import { foxVerdict, summarize } from '@/lib/portfolio-summary';

/**
 * "Mes finances": opens when you tap the wallet on the Home screen.
 * Explains where your money is, how much you gained or lost, and what the fox thinks of it.
 */
export default function FinancesScreen() {
  const { prices, loading, refresh } = usePrices();
  const portfolio = usePortfolio();
  const priceOf = (id: string) => prices.find((p) => p.id === id)?.price ?? 0;
  const s = summarize(portfolio, priceOf);
  const ready = prices.length > 0;
  const verdict = foxVerdict(s);

  // Allocation: which share of the total is cash, and which share is each crypto
  const slices = [
    ...s.positions.map((p) => ({ key: p.id, label: p.name, value: p.value, color: COIN_COLORS[p.id] })),
    { key: 'cash', label: 'Cash', value: s.cash, color: '#9AA3B5' },
  ].filter((slice) => slice.value > 0);

  const lastTrades = portfolio.transactions.slice(0, 5);
  const up = s.pnl >= 0;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Text style={styles.title}>Mes finances</Text>
      <Text style={styles.subtitle}>Tout ce qu'il y a dans ton portefeuille, expliqué simplement.</Text>

      {/* 1. The big number */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Valeur totale</Text>
        <Text style={styles.heroValue}>{ready ? formatUsd(s.total) : '…'}</Text>
        {ready && (
          <Text style={[styles.heroPnl, { color: up ? '#7CF0B4' : '#FFB4AE' }]}>
            {up ? '▲' : '▼'} {formatUsd(Math.abs(s.pnl))} ({formatPercent(s.pnlPct)}) grâce à tes trades
          </Text>
        )}
      </View>

      {/* 2. Where the money comes from, and where it is now */}
      <Text style={styles.section}>D'où vient ton argent</Text>
      <View style={styles.card}>
        <Line label="Capital de départ" value={formatUsd(STARTING_CASH)} />
        <Line label="Gagné avec tes leçons" value={`+${formatUsd(s.rewards)}`} />
        <Line label="Résultat de tes trades" value={ready ? `${up ? '+' : '−'}${formatUsd(Math.abs(s.pnl))}` : '…'} color={up ? Brand.success : Brand.danger} />
        <View style={styles.divider} />
        <Line label="Total" value={ready ? formatUsd(s.total) : '…'} strong />
      </View>

      <Text style={styles.section}>Où il est maintenant</Text>
      <View style={styles.card}>
        <View style={styles.bar}>
          {ready &&
            slices.map((slice) => (
              <View key={slice.key} style={{ flex: slice.value, backgroundColor: slice.color }} />
            ))}
        </View>
        {slices.map((slice) => (
          <View key={slice.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel}>{slice.label}</Text>
            <Text style={styles.legendValue}>{formatUsd(slice.value)}</Text>
            <Text style={styles.legendPct}>{ready && s.total > 0 ? `${Math.round((slice.value / s.total) * 100)} %` : ''}</Text>
          </View>
        ))}
        <Text style={styles.explain}>
          Le cash ne bouge pas. Les cryptos, elles, montent et descendent avec le marché : plus leur part est grande, plus ton total varie.
        </Text>
      </View>

      {/* 3. The fox's opinion */}
      <View style={{ marginTop: Space.lg }}>
        <FoxTip title="L'avis du renard" text={verdict.text} tone={verdict.tone} />
      </View>

      {/* 4. The open wallet: one card per crypto */}
      <Text style={styles.section}>Tes cryptos</Text>
      <Wallet
        items={s.positions.map((p) => ({
          id: p.id, name: p.name, symbol: p.symbol, quantity: p.quantity, value: p.value, pnl: p.pnl, pnlPct: p.pnlPct,
        }))}
      />
      {s.positions.map((p) =>
        p.avgCost ? (
          <Text key={p.id} style={styles.avg}>
            {p.name} : acheté en moyenne {formatUsd(p.avgCost)}, vaut {formatUsd(priceOf(p.id))} aujourd'hui.
          </Text>
        ) : null,
      )}

      {/* 5. Recent activity */}
      <Text style={styles.section}>Tes derniers mouvements</Text>
      <View style={styles.card}>
        {lastTrades.length === 0 ? (
          <Text style={styles.explain}>Aucun trade pour l'instant.</Text>
        ) : (
          lastTrades.map((t, i) => {
            const coin = COINS.find((c) => c.id === t.coin);
            const buy = t.side === 'buy';
            return (
              <View key={`${t.date}-${i}`} style={styles.tradeRow}>
                <View style={[styles.tradeBadge, { backgroundColor: buy ? Brand.primarySoft : '#DDF3E7' }]}>
                  <Text style={[styles.tradeBadgeText, { color: buy ? Brand.primary : Brand.success }]}>{buy ? 'Achat' : 'Vente'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tradeName}>{coin?.name}</Text>
                  <Text style={styles.tradeDate}>{new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Text style={styles.tradeTotal}>{buy ? '−' : '+'}{formatUsd(t.total)}</Text>
              </View>
            );
          })
        )}
      </View>

      <Pressable onPress={() => router.push('/trade')} style={({ pressed }) => [styles.button, pressed && { backgroundColor: Brand.primaryDark }]}>
        <Text style={styles.buttonText}>Aller trader</Text>
      </Pressable>
    </ScrollView>
  );
}

function Line({ label, value, color, strong }: { label: string; value: string; color?: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.lineValue, strong && styles.strong, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingTop: Space.sm, paddingBottom: 80 },
  title: { fontSize: 30, fontFamily: Font.extrabold, color: Brand.navy, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: Font.regular, color: Brand.textSecondary, marginTop: 4, marginBottom: Space.md },
  hero: { backgroundColor: Brand.primary, borderRadius: Radius.lg, padding: Space.lg, gap: 4 },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: Font.semibold, textTransform: 'uppercase', letterSpacing: 1 },
  heroValue: { color: '#FFFFFF', fontSize: 38, fontFamily: Font.extrabold, fontVariant: ['tabular-nums'], letterSpacing: -1 },
  heroPnl: { fontSize: 14, fontFamily: Font.semibold, fontVariant: ['tabular-nums'] },
  section: { fontSize: 13, fontFamily: Font.bold, color: Brand.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: Space.lg, marginBottom: Space.sm },
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Space.md, gap: Space.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  lineLabel: { fontSize: 15, fontFamily: Font.regular, color: Brand.textSecondary },
  lineValue: { fontSize: 15, fontFamily: Font.semibold, color: Brand.navy, fontVariant: ['tabular-nums'] },
  strong: { fontFamily: Font.bold, color: Brand.navy, fontSize: 16 },
  divider: { height: 1, backgroundColor: Brand.border },
  bar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: Brand.border, marginBottom: Space.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 15, fontFamily: Font.medium, color: Brand.navy },
  legendValue: { fontSize: 15, fontFamily: Font.semibold, color: Brand.navy, fontVariant: ['tabular-nums'] },
  legendPct: { width: 46, textAlign: 'right', fontSize: 13, fontFamily: Font.medium, color: Brand.textSecondary },
  explain: { fontSize: 13, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 19, marginTop: Space.xs },
  avg: { fontSize: 13, fontFamily: Font.regular, color: Brand.textSecondary, marginTop: Space.sm, lineHeight: 18 },
  tradeRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: 4 },
  tradeBadge: { borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  tradeBadgeText: { fontSize: 12, fontFamily: Font.bold },
  tradeName: { fontSize: 15, fontFamily: Font.semibold, color: Brand.navy },
  tradeDate: { fontSize: 12, fontFamily: Font.regular, color: Brand.textSecondary },
  tradeTotal: { fontSize: 15, fontFamily: Font.semibold, color: Brand.navy, fontVariant: ['tabular-nums'] },
  button: { backgroundColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginTop: Space.xl },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontFamily: Font.bold },
});
