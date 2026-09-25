import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Space } from '@/constants/brand';
import { CoinId } from '@/lib/coingecko';
import { formatPercent, formatUsd } from '@/lib/format';

type Props = { id: CoinId; name: string; symbol: string; price?: number; change24h?: number; subtitle?: string };

/** One line of the market list: name, price and 24h change. Tap it to open the coin screen. */
export function CoinRow({ id, name, symbol, price, change24h, subtitle }: Props) {
  const isUp = (change24h ?? 0) >= 0;
  return (
    <Link href={{ pathname: '/coin/[id]', params: { id } }} asChild>
    <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{symbol.slice(0, 1)}</Text>
      </View>
      <View style={styles.names}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.symbol}>{subtitle ?? symbol}</Text>
      </View>
      <View style={styles.values}>
        <Text style={styles.price}>{price !== undefined ? formatUsd(price) : '…'}</Text>
        {change24h !== undefined && (
          <Text style={[styles.change, { color: isUp ? Brand.success : Brand.danger }]}>
            {formatPercent(change24h)}
          </Text>
        )}
      </View>
    </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Brand.primary, fontWeight: '700', fontSize: 16 },
  names: { flex: 1 },
  name: { color: Brand.navy, fontSize: 16, fontWeight: '600' },
  symbol: { color: Brand.textSecondary, fontSize: 13, marginTop: 2 },
  values: { alignItems: 'flex-end' },
  price: { color: Brand.navy, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  change: { fontSize: 13, marginTop: 2, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
