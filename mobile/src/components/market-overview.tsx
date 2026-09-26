import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sparkline } from '@/components/price-chart';
import { Brand, Font, Radius, Space } from '@/constants/brand';
import { COIN_COLORS, COIN_GLYPHS, CoinMarket, COINS } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';

/** How the market feels today, from the average 24h change of the 3 coins. */
function marketMood(avg: number): { label: string; text: string } {
  if (avg > 3) return { label: 'Très en forme', text: 'Tout monte fort. Attention à l\'euphorie : acheter quand tout le monde s\'emballe, c\'est souvent acheter cher.' };
  if (avg > 0.5) return { label: 'En hausse', text: 'Le marché monte doucement aujourd\'hui. Une bonne journée pour observer sans te précipiter.' };
  if (avg > -0.5) return { label: 'Calme', text: 'Pas grand-chose ne bouge. Les journées calmes sont parfaites pour apprendre à lire un graphique.' };
  if (avg > -3) return { label: 'Un peu dans le rouge', text: 'Légère baisse. C\'est normal : en crypto, des journées comme ça il y en a plein.' };
  return { label: 'Journée agitée', text: 'Grosse baisse aujourd\'hui. Le réflexe à éviter : vendre dans la panique.' };
}

/**
 * Home screen market block: the market's mood of the day on a gauge,
 * then one mini card per coin with its 7-day curve. Tap a card to open the coin.
 */
export function MarketOverview({ markets, updatedAt }: { markets: CoinMarket[]; updatedAt: Date | null }) {
  const avg = markets.length ? markets.reduce((sum, m) => sum + m.change24h, 0) / markets.length : 0;
  const mood = marketMood(avg);
  // Gauge from -5 % (left) to +5 % (right)
  const gauge = Math.min(Math.max((avg + 5) / 10, 0), 1);

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Le marché en direct</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {updatedAt ? `Mis à jour à ${updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Chargement…'}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/trade')} hitSlop={10}>
          <Text style={styles.seeAll}>Tout voir →</Text>
        </Pressable>
      </View>

      {markets.length > 0 && (
        <View style={styles.mood}>
          <View style={styles.moodTop}>
            <Text style={styles.moodKicker}>Humeur du jour</Text>
            <Text style={[styles.moodAvg, { color: avg >= 0 ? Brand.success : Brand.danger }]}>{formatPercent(avg)} en moyenne</Text>
          </View>
          <Text style={styles.moodLabel}>{mood.label}</Text>
          <View style={styles.gauge}>
            <View style={[styles.gaugePart, { backgroundColor: '#F2B8B3' }]} />
            <View style={[styles.gaugePart, { backgroundColor: Brand.border }]} />
            <View style={[styles.gaugePart, { backgroundColor: '#A9DEC3' }]} />
            <View style={[styles.gaugeDot, { left: `${gauge * 100}%` }]} />
          </View>
          <Text style={styles.moodText}>{mood.text}</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards} style={styles.cardsScroll}>
        {markets.map((m) => {
          const coin = COINS.find((c) => c.id === m.id)!;
          const up = m.change24h >= 0;
          return (
            <Link key={m.id} href={{ pathname: '/coin/[id]', params: { id: m.id } }} asChild>
              <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.logo, { backgroundColor: COIN_COLORS[m.id] }]}>
                    <Text style={styles.logoText}>{COIN_GLYPHS[m.id]}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{coin.name}</Text>
                    <Text style={styles.symbol}>{coin.symbol}</Text>
                  </View>
                </View>
                <Text style={styles.price}>{formatUsd(m.price)}</Text>
                <View style={[styles.pill, { backgroundColor: up ? '#DDF3E7' : '#F9DEDC' }]}>
                  <Text style={[styles.pillText, { color: up ? Brand.success : Brand.danger }]}>{formatPercent(m.change24h)} · 24 h</Text>
                </View>
                <Sparkline prices={m.sparkline} width={132} height={40} />
                <Text style={styles.week}>7 jours : {formatPercent(m.change7d)}</Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Space.lg, marginBottom: Space.sm },
  title: { fontSize: 20, fontFamily: Font.bold, color: Brand.navy, letterSpacing: -0.3 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.success },
  liveText: { fontSize: 12, fontFamily: Font.medium, color: Brand.textSecondary },
  seeAll: { fontSize: 14, fontFamily: Font.semibold, color: Brand.primary },
  mood: { backgroundColor: Brand.surface, borderRadius: Radius.lg, padding: Space.md, gap: 6 },
  moodTop: { flexDirection: 'row', justifyContent: 'space-between' },
  moodKicker: { fontSize: 12, fontFamily: Font.bold, color: Brand.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  moodAvg: { fontSize: 12, fontFamily: Font.semibold, fontVariant: ['tabular-nums'] },
  moodLabel: { fontSize: 18, fontFamily: Font.bold, color: Brand.navy },
  gauge: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'visible', marginVertical: 6 },
  gaugePart: { flex: 1, height: 8 },
  gaugeDot: {
    position: 'absolute', top: -5, width: 18, height: 18, borderRadius: 9, marginLeft: -9,
    backgroundColor: Brand.primary, borderWidth: 3, borderColor: Brand.surface,
  },
  moodText: { fontSize: 13, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 19 },
  cardsScroll: { marginHorizontal: -Space.lg, marginTop: Space.md },
  cards: { paddingHorizontal: Space.lg, gap: Space.sm },
  card: { width: 164, backgroundColor: Brand.surface, borderRadius: Radius.lg, padding: Space.md, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  logo: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 16, fontFamily: Font.extrabold },
  name: { fontSize: 14, fontFamily: Font.semibold, color: Brand.navy },
  symbol: { fontSize: 12, fontFamily: Font.regular, color: Brand.textSecondary },
  price: { fontSize: 18, fontFamily: Font.bold, color: Brand.navy, fontVariant: ['tabular-nums'], letterSpacing: -0.3 },
  pill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingVertical: 2, paddingHorizontal: 8 },
  pillText: { fontSize: 12, fontFamily: Font.bold, fontVariant: ['tabular-nums'] },
  week: { fontSize: 11, fontFamily: Font.medium, color: Brand.textSecondary },
});
