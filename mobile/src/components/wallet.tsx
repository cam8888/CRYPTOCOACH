import { Link, router } from 'expo-router';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Space, Font } from '@/constants/brand';
import { COIN_COLORS, CoinId } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';
import { vibrate } from '@/lib/haptics';

export type WalletItem = {
  id: CoinId;
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  pnl: number | null; // gain / loss in $ compared with the average buy price
  pnlPct: number | null;
};

const CARD_COLORS = COIN_COLORS;

type ClosedProps = { total: number | null; pnl: number | null; pnlPct: number | null; coins: CoinId[] };

/**
 * The Home screen's closed wallet: the total on the flap, the tops of the crypto
 * cards peeking out. Tap it to open "Mes finances".
 */
export function ClosedWallet({ total, pnl, pnlPct, coins }: ClosedProps) {
  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  function open() {
    vibrate.tap();
    router.push('/finances');
  }

  return (
    <Pressable
      onPress={open}
      onPressIn={() => Animated.spring(press, { toValue: 1, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, friction: 4, useNativeDriver: true }).start()}>
      <Animated.View style={[closed.wrap, { transform: [{ scale }] }]}>
        {/* Cards peeking out of the wallet */}
        <View style={closed.cards}>
          {(coins.length ? coins : (['bitcoin', 'ethereum'] as CoinId[])).map((id, i) => (
            <View
              key={id}
              style={[
                closed.cardTop,
                { backgroundColor: coins.length ? CARD_COLORS[id] : 'rgba(255,255,255,0.25)', marginLeft: i * 26, transform: [{ rotate: `${-6 + i * 5}deg` }] },
              ]}
            />
          ))}
        </View>

        <View style={closed.body}>
          <View style={closed.stitch}>
            <Text style={closed.label}>Mon portefeuille</Text>
            <Text style={closed.total}>{total !== null ? formatUsd(total) : '…'}</Text>
            {pnl !== null && pnlPct !== null && (
              <View style={closed.pill}>
                <Text style={closed.pillText}>
                  {pnl >= 0 ? '▲' : '▼'} {formatUsd(Math.abs(pnl))} ({formatPercent(pnlPct)}) en tradant
                </Text>
              </View>
            )}
            <Text style={closed.hint}>Touche pour ouvrir et voir tes finances →</Text>
          </View>
          {/* The flap and its clasp */}
          <View style={closed.flap}>
            <View style={closed.clasp}>
              <View style={closed.claspDot} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const closed = StyleSheet.create({
  wrap: { marginTop: Space.md },
  cards: { flexDirection: 'row', height: 30, paddingLeft: Space.lg, marginBottom: -14 },
  cardTop: { position: 'absolute', left: Space.lg, width: 120, height: 40, borderRadius: 10 },
  body: {
    backgroundColor: Brand.primaryDark,
    borderRadius: Radius.lg,
    padding: 6,
    flexDirection: 'row',
    boxShadow: '0 10px 24px rgba(11,16,51,0.35)',
  },
  stitch: {
    flex: 1,
    borderRadius: Radius.lg - 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
    padding: Space.md,
    paddingRight: 64,
    gap: 6,
  },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: Font.bold, textTransform: 'uppercase', letterSpacing: 1 },
  total: { color: '#FFFFFF', fontSize: 34, letterSpacing: -0.5, fontFamily: Font.extrabold, fontVariant: ['tabular-nums'] },
  pill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontFamily: Font.bold, fontVariant: ['tabular-nums'] },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: Font.regular, marginTop: 4 },
  flap: {
    position: 'absolute', right: 6, top: 6, bottom: 6, width: 56,
    backgroundColor: Brand.primary, borderTopRightRadius: Radius.lg - 4, borderBottomRightRadius: Radius.lg - 4,
    borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
  },
  clasp: {
    marginLeft: -14, width: 34, height: 26, borderRadius: 13, backgroundColor: '#C9CEDA',
    alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  claspDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8C93A6' },
});

/**
 * "Tes cryptos", drawn like a real wallet: indigo leather with stitching,
 * and each crypto slipped inside like a bank card. Tap a card to open the coin.
 */
export function Wallet({ items }: { items: WalletItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <View style={styles.wallet}>
      <View style={styles.stitch}>
        <View style={styles.header}>
          <Text style={styles.label}>Tes cryptos</Text>
          <Text style={styles.total}>{formatUsd(total)}</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Ton portefeuille est vide pour l'instant. Va dans « Trader » pour ton premier achat, zéro risque 😉</Text>
          </View>
        ) : (
          items.map((item, i) => (
            <Link key={item.id} href={{ pathname: '/coin/[id]', params: { id: item.id } }} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { marginTop: i === 0 ? 0 : -18, zIndex: i, borderLeftColor: CARD_COLORS[item.id] },
                  pressed && { transform: [{ translateY: -4 }] },
                ]}>
                <View style={[styles.chip, { backgroundColor: CARD_COLORS[item.id] }]}>
                  <Text style={styles.chipText}>{item.symbol}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardQty}>{item.quantity.toFixed(5)} {item.symbol}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardValue}>{formatUsd(item.value)}</Text>
                  {item.pnl !== null && item.pnlPct !== null && (
                    <Text style={[styles.cardPnl, { color: item.pnl >= 0 ? Brand.success : Brand.danger }]}>
                      {item.pnl >= 0 ? '+' : '−'}{formatUsd(Math.abs(item.pnl))} ({formatPercent(item.pnlPct)})
                    </Text>
                  )}
                </View>
              </Pressable>
            </Link>
          ))
        )}

        {/* The wallet's front pocket */}
        <View style={styles.pocket}>
          <View style={styles.clasp} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wallet: {
    backgroundColor: Brand.primaryDark,
    borderRadius: Radius.lg,
    padding: 6,
    marginTop: Space.sm,
    boxShadow: '0 8px 20px rgba(11,16,51,0.35)',
  },
  stitch: {
    borderRadius: Radius.lg - 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
    padding: Space.md,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Space.md },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontFamily: Font.extrabold, textTransform: 'uppercase', letterSpacing: 1 },
  total: { color: '#FFFFFF', fontSize: 20, fontFamily: Font.extrabold, fontVariant: ['tabular-nums'] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: Brand.card,
    borderRadius: 14,
    borderLeftWidth: 6,
    paddingVertical: 18,
    paddingHorizontal: Space.md,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.25)',
  },
  chip: { width: 44, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipText: { color: '#FFFFFF', fontFamily: Font.extrabold, fontSize: 12 },
  cardName: { color: Brand.navy, fontSize: 16, fontFamily: Font.bold },
  cardQty: { color: Brand.textSecondary, fontSize: 13, fontFamily: Font.regular, marginTop: 2, fontVariant: ['tabular-nums'] },
  cardValue: { color: Brand.navy, fontSize: 16, fontFamily: Font.bold, fontVariant: ['tabular-nums'] },
  cardPnl: { fontSize: 13, fontFamily: Font.bold, marginTop: 2, fontVariant: ['tabular-nums'] },
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: Space.md },
  emptyText: { color: '#FFFFFF', fontSize: 14, fontFamily: Font.regular, lineHeight: 20 },
  pocket: {
    height: 34,
    marginTop: -10,
    marginHorizontal: -Space.md,
    backgroundColor: Brand.primary,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clasp: { width: 42, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
});
