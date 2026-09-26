/**
 * Live crypto prices from the free CoinGecko API.
 * Same API as the Streamlit version, called from JavaScript this time.
 */
export type CoinId = 'bitcoin' | 'ethereum' | 'solana';

export type CoinPrice = {
  id: CoinId;
  price: number;
  change24h: number; // % change over the last 24 hours
};

export const COINS: { id: CoinId; name: string; symbol: string }[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
];

export async function fetchPrices(): Promise<CoinPrice[]> {
  const ids = COINS.map((coin) => coin.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko error ${response.status}`);
  }
  const data = await response.json();
  return COINS.map((coin) => ({
    id: coin.id,
    price: data[coin.id].usd,
    change24h: data[coin.id].usd_24h_change,
  }));
}

export type PricePoint = { time: number; price: number };

/** Price history for the chart: `days` = 1, 7, 30… */
export async function fetchHistory(id: CoinId, days: number): Promise<PricePoint[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko error ${response.status}`);
  }
  const data = await response.json();
  return data.prices.map(([time, price]: [number, number]) => ({ time, price }));
}

/** Each coin's brand color (logos, wallet cards, allocation bar). */
export const COIN_COLORS: Record<CoinId, string> = { bitcoin: '#F7931A', ethereum: '#627EEA', solana: '#14B8A6' };

/** A coin's logo glyph, drawn as text inside a colored circle. */
export const COIN_GLYPHS: Record<CoinId, string> = { bitcoin: '₿', ethereum: 'Ξ', solana: 'S' };

export type CoinMarket = {
  id: CoinId;
  rank: number;
  price: number;
  change24h: number;
  change7d: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
  athChange: number; // % below its all-time high
  sparkline: number[]; // hourly prices over the last 7 days
};

/** Everything the Trade screen needs, for the 3 coins, in a single call. */
export async function fetchMarkets(): Promise<CoinMarket[]> {
  const ids = COINS.map((coin) => coin.id).join(',');
  const url =
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}` +
    '&sparkline=true&price_change_percentage=24h,7d';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko error ${response.status}`);
  }
  const data: any[] = await response.json();
  return COINS.flatMap((coin) => {
    const m = data.find((d) => d.id === coin.id);
    if (!m) return [];
    return [{
      id: coin.id,
      rank: m.market_cap_rank,
      price: m.current_price,
      change24h: m.price_change_percentage_24h_in_currency ?? m.price_change_percentage_24h ?? 0,
      change7d: m.price_change_percentage_7d_in_currency ?? 0,
      high24h: m.high_24h,
      low24h: m.low_24h,
      marketCap: m.market_cap,
      volume24h: m.total_volume,
      athChange: m.ath_change_percentage,
      sparkline: m.sparkline_in_7d?.price ?? [],
    }];
  });
}
