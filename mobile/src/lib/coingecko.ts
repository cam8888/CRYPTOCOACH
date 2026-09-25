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
