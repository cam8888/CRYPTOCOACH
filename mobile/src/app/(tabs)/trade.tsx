import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FoxTip } from '@/components/fox';
import { Sparkline } from '@/components/price-chart';
import { Brand, Font, Radius, Space } from '@/constants/brand';
import { useMarkets } from '@/hooks/use-markets';
import { COIN_COLORS, COIN_GLYPHS, COINS } from '@/lib/coingecko';
import { formatCompactUsd, formatPercent, formatUsd } from '@/lib/format';
import { vibrate } from '@/lib/haptics';
import { usePortfolio } from '@/lib/portfolio';

/** Words from the market cards, explained. Tap one to read it. */
const GLOSSARY = [
  { word: 'Capitalisation', text: "Prix × nombre de jetons en circulation. C'est la « taille » d'une crypto : plus elle est grosse, moins elle bouge en général." },
  { word: 'Volume 24 h', text: "L'argent échangé sur cette crypto en 24 h. Un gros volume veut dire que beaucoup de monde achète et vend : c'est facile d'entrer ou de sortir." },
  { word: 'Volatilité', text: "À quel point le prix bouge. Une crypto qui fait ±10 % en une journée est très volatile : tu peux gagner vite… ou perdre vite." },
  { word: 'Record (ATH)', text: "All-Time High : le prix le plus haut jamais atteint. « −30 % du record » veut dire qu'elle vaut 30 % de moins qu'à son sommet." },
  { word: 'Plus haut / bas', text: "La fourchette de prix des dernières 24 h. Ça te montre si tu achètes plutôt en haut ou en bas de la journée." },
];

/** Trade screen: a real market view, with a card per coin, then buy / sell. */
export default function TradeScreen() {
  const { width } = useWindowDimensions();
  const portfolio = usePortfolio();
  const { markets, loading, error, updatedAt, refresh } = useMarkets();
  const [openWord, setOpenWord] = useState<string | null>(null);

  const investedValue = markets.reduce((sum, m) => sum + (portfolio.holdings[m.id] ?? 0) * m.price, 0);
  const mover = [...markets].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0];
  const moverName = mover ? COINS.find((c) => c.id === mover.id)?.name : null;
  const glossary = GLOSSARY.find((g) => g.word === openWord);

  function open(id: string, side: 'buy' | 'sell') {
    vibrate.tap();
    router.push({ pathname: '/coin/[id]', params: { id, side } });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Text style={styles.title}>Trader</Text>
      <Text style={styles.subtitle}>
        Marché en direct{updatedAt ? ` · mis à jour à ${updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
      </Text>

      {/* Buying power */}
      <View style={styles.power}>
        <View style={{ flex: 1 }}>
          <Text style={styles.powerLabel}>Cash disponible</Text>
          <Text style={styles.powerValue}>{formatUsd(portfolio.cash)}</Text>
        </View>
        <View style={styles.powerSplit} />
        <View style={{ flex: 1 }}>
          <Text style={styles.powerLabel}>Investi en crypto</Text>
          <Text style={styles.powerValue}>{markets.length ? formatUsd(investedValue) : '…'}</Text>
        </View>
      </View>

      {/* Move of the day */}
      {mover && moverName && (
        <View style={{ marginTop: Space.md }}>
          <FoxTip
            title="Le mouvement du jour"
            tone={mover.change24h >= 0 ? 'good' : 'bad'}
            text={`${moverName} a bougé de ${formatPercent(mover.change24h)} en 24 h, c'est la plus agitée des trois. Plus ça bouge, plus c'est risqué : n'y mets pas tout ton cash.`}
          />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.section}>Les cryptos</Text>
      {markets.map((m) => {
        const coin = COINS.find((c) => c.id === m.id)!;
        const owned = portfolio.holdings[m.id] ?? 0;
        const up = m.change24h >= 0;
        // Where the price sits today between its lowest and highest point
        const rangePos = m.high24h > m.low24h ? (m.price - m.low24h) / (m.high24h - m.low24h) : 0.5;
        return (
          <View key={m.id} style={styles.card}>
            <Pressable onPress={() => open(m.id, 'buy')} style={styles.cardTop}>
              <View style={[styles.logo, { backgroundColor: COIN_COLORS[m.id] }]}>
                <Text style={styles.logoText}>{COIN_GLYPHS[m.id]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{coin.name}</Text>
                <Text style={styles.meta}>{coin.symbol} · n°{m.rank} mondial</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{formatUsd(m.price)}</Text>
                <View style={[styles.pill, { backgroundColor: up ? '#DDF3E7' : '#F9DEDC' }]}>
                  <Text style={[styles.pillText, { color: up ? Brand.success : Brand.danger }]}>{formatPercent(m.change24h)}</Text>
                </View>
              </View>
            </Pressable>

            <View style={styles.sparkRow}>
              <Sparkline prices={m.sparkline} width={width - Space.lg * 2 - Space.md * 2} height={52} />
              <Text style={styles.sparkLabel}>7 derniers jours · {formatPercent(m.change7d)}</Text>
            </View>

            <View style={styles.range}>
              <Text style={styles.rangeText}>{formatUsd(m.low24h)}</Text>
              <View style={styles.rangeTrack}>
                <View style={[styles.rangeDot, { left: `${Math.min(Math.max(rangePos, 0), 1) * 100}%` }]} />
              </View>
              <Text style={styles.rangeText}>{formatUsd(m.high24h)}</Text>
            </View>

            <View style={styles.stats}>
              <Stat label="Capitalisation" value={formatCompactUsd(m.marketCap)} />
              <Stat label="Volume 24 h" value={formatCompactUsd(m.volume24h)} />
              <Stat label="Du record" value={formatPercent(m.athChange)} />
            </View>

            {owned > 0 && (
              <Text style={styles.owned}>
                Tu en as {owned.toFixed(5)} {coin.symbol} · {formatUsd(owned * m.price)}
              </Text>
            )}

            <View style={styles.actions}>
              <Pressable onPress={() => open(m.id, 'buy')} style={({ pressed }) => [styles.buy, pressed && { backgroundColor: Brand.primaryDark }]}>
                <Text style={styles.buyText}>Acheter</Text>
              </Pressable>
              {owned > 0 && (
                <Pressable onPress={() => open(m.id, 'sell')} style={({ pressed }) => [styles.sell, pressed && { opacity: 0.7 }]}>
                  <Text style={styles.sellText}>Vendre</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}

      {/* Mini glossary */}
      <Text style={styles.section}>Les mots du marché</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.sm }}>
        {GLOSSARY.map((g) => (
          <Pressable
            key={g.word}
            onPress={() => { vibrate.tap(); setOpenWord(openWord === g.word ? null : g.word); }}
            style={[styles.chip, openWord === g.word && styles.chipActive]}>
            <Text style={[styles.chipText, openWord === g.word && { color: '#FFFFFF' }]}>{g.word}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {glossary && (
        <View style={styles.definition}>
          <Text style={styles.defWord}>{glossary.word}</Text>
          <Text style={styles.defText}>{glossary.text}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 120 },
  title: { fontSize: 32, fontFamily: Font.extrabold, color: Brand.navy, marginTop: Space.md, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: Font.medium, color: Brand.textSecondary, marginBottom: Space.md },
  power: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.primary, borderRadius: Radius.lg,
    padding: Space.md, paddingVertical: Space.lg,
  },
  powerSplit: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: Space.md },
  powerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: Font.semibold, textTransform: 'uppercase', letterSpacing: 0.8 },
  powerValue: { color: '#FFFFFF', fontSize: 20, fontFamily: Font.bold, marginTop: 4, fontVariant: ['tabular-nums'] },
  error: { color: Brand.danger, fontSize: 14, fontFamily: Font.medium, marginTop: Space.md },
  section: {
    fontSize: 13, fontFamily: Font.bold, color: Brand.textSecondary, textTransform: 'uppercase',
    letterSpacing: 1, marginTop: Space.lg, marginBottom: Space.sm,
  },
  card: { backgroundColor: Brand.surface, borderRadius: Radius.lg, padding: Space.md, marginBottom: Space.md, gap: Space.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  logo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 22, fontFamily: Font.extrabold },
  name: { fontSize: 17, fontFamily: Font.bold, color: Brand.navy },
  meta: { fontSize: 13, fontFamily: Font.regular, color: Brand.textSecondary, marginTop: 2 },
  price: { fontSize: 17, fontFamily: Font.bold, color: Brand.navy, fontVariant: ['tabular-nums'] },
  pill: { borderRadius: Radius.full, paddingVertical: 2, paddingHorizontal: 8, marginTop: 4 },
  pillText: { fontSize: 12, fontFamily: Font.bold, fontVariant: ['tabular-nums'] },
  sparkRow: { gap: 4 },
  sparkLabel: { fontSize: 12, fontFamily: Font.medium, color: Brand.textSecondary },
  range: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  rangeText: { fontSize: 11, fontFamily: Font.medium, color: Brand.textSecondary, fontVariant: ['tabular-nums'] },
  rangeTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Brand.border },
  rangeDot: {
    position: 'absolute', top: -4, width: 12, height: 12, borderRadius: 6, marginLeft: -6,
    backgroundColor: Brand.primary, borderWidth: 2, borderColor: Brand.surface,
  },
  stats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Brand.border, paddingTop: Space.md },
  statLabel: { fontSize: 11, fontFamily: Font.medium, color: Brand.textSecondary },
  statValue: { fontSize: 14, fontFamily: Font.semibold, color: Brand.navy, marginTop: 2, fontVariant: ['tabular-nums'] },
  owned: {
    fontSize: 13, fontFamily: Font.semibold, color: Brand.primary, backgroundColor: Brand.primarySoft,
    borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: Space.sm, overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: Space.sm },
  buy: { flex: 1, backgroundColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center' },
  buyText: { color: '#FFFFFF', fontSize: 15, fontFamily: Font.bold },
  sell: { flex: 1, borderWidth: 1.5, borderColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center' },
  sellText: { color: Brand.primary, fontSize: 15, fontFamily: Font.bold },
  chip: { backgroundColor: Brand.surface, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: Brand.border },
  chipActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  chipText: { fontSize: 13, fontFamily: Font.semibold, color: Brand.navy },
  definition: { backgroundColor: Brand.card, borderRadius: Radius.md, padding: Space.md, marginTop: Space.md, gap: 4 },
  defWord: { fontSize: 15, fontFamily: Font.bold, color: Brand.navy },
  defText: { fontSize: 14, fontFamily: Font.regular, color: Brand.textSecondary, lineHeight: 20 },
});
