import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { PriceChart } from '@/components/price-chart';
import { Brand, Radius, Space } from '@/constants/brand';
import { usePrices } from '@/hooks/use-prices';
import { buyFeedback, Feedback, sellFeedback } from '@/lib/coach';
import { CoinId, COINS, fetchHistory, PricePoint } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';
import { averageCost, usePortfolio } from '@/lib/portfolio';

const PERIODS = [
  { label: '24 h', days: 1 },
  { label: '7 j', days: 7 },
  { label: '30 j', days: 30 },
];

/** Coin screen: chart, your position, and buy / sell. */
export default function CoinScreen() {
  const { id } = useLocalSearchParams<{ id: CoinId }>();
  const coin = COINS.find((c) => c.id === id) ?? COINS[0];
  const { prices } = usePrices();
  const price = prices.find((p) => p.id === coin.id)?.price;
  const portfolio = usePortfolio();

  const [days, setDays] = useState(7);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [chartError, setChartError] = useState(false);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setChartError(false);
    fetchHistory(coin.id, days).then(setHistory).catch(() => setChartError(true));
  }, [coin.id, days]);

  const owned = portfolio.holdings[coin.id] ?? 0;
  const avgCost = averageCost(portfolio.transactions, coin.id);
  const positionValue = price ? owned * price : 0;
  const positionPnl = price && avgCost ? (price - avgCost) * owned : null;
  const periodChange = history.length > 1
    ? (history[history.length - 1].price / history[0].price - 1) * 100
    : null;

  // Buy: the user types dollars. Sell: the user types a quantity of crypto.
  const value = parseFloat(input.replace(',', '.')) || 0;
  const max = side === 'buy' ? portfolio.cash : owned;
  const valid = price !== undefined && value > 0 && value <= max + 1e-9;

  function setShare(share: number) {
    const amount = max * share;
    setInput(side === 'buy' ? amount.toFixed(2) : amount.toFixed(6));
  }

  function confirm() {
    if (!valid || price === undefined) return;
    if (side === 'buy') {
      const cashBefore = portfolio.cash;
      const quantity = portfolio.buy(coin.id, value, price);
      setFeedback(buyFeedback(coin.symbol, quantity, price, value, cashBefore, avgCost));
    } else {
      const quantity = Math.min(value, owned);
      const received = portfolio.sell(coin.id, quantity, price);
      setFeedback(sellFeedback(coin.symbol, quantity, price, received, avgCost));
    }
    setInput('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: coin.name }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.price}>{price ? formatUsd(price) : '…'}</Text>
        {periodChange !== null && (
          <Text style={[styles.change, { color: periodChange >= 0 ? Brand.success : Brand.danger }]}>
            {formatPercent(periodChange)} sur {PERIODS.find((p) => p.days === days)?.label}
          </Text>
        )}

        {chartError ? (
          <Text style={styles.muted}>Le graphique fait une pause, réessaie dans une minute.</Text>
        ) : (
          <PriceChart points={history} />
        )}

        <View style={styles.segment}>
          {PERIODS.map((p) => (
            <Pressable key={p.days} onPress={() => setDays(p.days)} style={[styles.segmentItem, days === p.days && styles.segmentActive]}>
              <Text style={[styles.segmentText, days === p.days && styles.segmentTextActive]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ta position</Text>
          {owned > 0 ? (
            <>
              <Text style={styles.cardLine}>{owned.toFixed(6)} {coin.symbol} · {formatUsd(positionValue)}</Text>
              {avgCost && <Text style={styles.cardLine}>Prix moyen payé : {formatUsd(avgCost)}</Text>}
              {positionPnl !== null && (
                <Text style={[styles.cardLine, { color: positionPnl >= 0 ? Brand.success : Brand.danger, fontWeight: '700' }]}>
                  {positionPnl >= 0 ? '+' : '−'}{formatUsd(Math.abs(positionPnl))} ({formatPercent((price! / avgCost! - 1) * 100)})
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.muted}>Tu n'as pas encore de {coin.name}.</Text>
          )}
        </View>

        <View style={styles.segment}>
          {(['buy', 'sell'] as const).map((s) => (
            <Pressable key={s} onPress={() => { setSide(s); setInput(''); }} style={[styles.segmentItem, side === s && styles.segmentActive]}>
              <Text style={[styles.segmentText, side === s && styles.segmentTextActive]}>{s === 'buy' ? 'Acheter' : 'Vendre'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          {side === 'buy'
            ? `Montant en $ (dispo : ${formatUsd(portfolio.cash)})`
            : `Quantité de ${coin.symbol} (dispo : ${owned.toFixed(6)})`}
        </Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          keyboardType="decimal-pad"
          placeholder={side === 'buy' ? '100' : '0.001'}
          placeholderTextColor={Brand.textSecondary}
          style={styles.input}
        />
        <View style={styles.chips}>
          {[0.25, 0.5, 1].map((share) => (
            <Pressable key={share} onPress={() => setShare(share)} style={styles.chip}>
              <Text style={styles.chipText}>{share === 1 ? 'Max' : `${share * 100} %`}</Text>
            </Pressable>
          ))}
        </View>
        {side === 'sell' && value > 0 && price !== undefined && (
          <Text style={styles.muted}>Tu recevras environ {formatUsd(value * price)}</Text>
        )}

        <Pressable
          onPress={confirm}
          disabled={!valid}
          style={({ pressed }) => [styles.button, !valid && styles.buttonDisabled, pressed && { backgroundColor: Brand.primaryDark }]}>
          <Text style={styles.buttonText}>{side === 'buy' ? `Acheter du ${coin.name}` : `Vendre du ${coin.name}`}</Text>
        </Pressable>

        {feedback && (
          <View style={[styles.feedback, feedback.tone === 'good' && styles.feedbackGood, feedback.tone === 'bad' && styles.feedbackBad]}>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
            {feedback.tip ? <Text style={styles.tip}>💡 {feedback.tip}</Text> : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { padding: Space.lg, paddingBottom: 60, gap: Space.md },
  price: { fontSize: 36, fontWeight: '700', color: Brand.navy, fontVariant: ['tabular-nums'] },
  change: { fontSize: 15, fontWeight: '600', marginTop: -Space.sm },
  muted: { color: Brand.textSecondary, fontSize: 14 },
  segment: { flexDirection: 'row', backgroundColor: Brand.surface, borderRadius: Radius.full, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: Radius.full, alignItems: 'center' },
  segmentActive: { backgroundColor: Brand.background, boxShadow: '0 1px 4px rgba(10,22,51,0.12)' },
  segmentText: { color: Brand.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: Brand.primary },
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Space.md, gap: 4 },
  cardTitle: { color: Brand.navy, fontWeight: '700', fontSize: 16, marginBottom: 2 },
  cardLine: { color: Brand.navy, fontSize: 15, fontVariant: ['tabular-nums'] },
  label: { color: Brand.navy, fontWeight: '600', fontSize: 14 },
  input: {
    borderWidth: 2, borderColor: Brand.border, borderRadius: Radius.md, padding: Space.md,
    fontSize: 22, fontWeight: '600', color: Brand.navy, fontVariant: ['tabular-nums'],
  },
  chips: { flexDirection: 'row', gap: Space.sm },
  chip: { backgroundColor: Brand.primarySoft, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 16 },
  chipText: { color: Brand.primary, fontWeight: '700' },
  button: { backgroundColor: Brand.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  feedback: { backgroundColor: Brand.primarySoft, borderRadius: Radius.md, padding: Space.md, gap: Space.sm },
  feedbackGood: { backgroundColor: '#E7F8EF' },
  feedbackBad: { backgroundColor: '#FDECEA' },
  feedbackText: { color: Brand.navy, fontSize: 15, lineHeight: 21 },
  tip: { color: Brand.navy, fontSize: 14, lineHeight: 20 },
});
