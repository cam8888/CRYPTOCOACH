/**
 * Portfolio figures computed from the holdings and the live prices.
 * Shared by the Home screen (closed wallet) and the "Mes finances" page.
 */
import { COINS, CoinId } from '@/lib/coingecko';
import { averageCost, STARTING_CASH, Transaction } from '@/lib/portfolio';

export type Position = {
  id: CoinId;
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  avgCost: number | null;
  pnl: number | null;
  pnlPct: number | null;
};

export type Summary = {
  total: number;       // cash + crypto value
  cash: number;
  cryptoValue: number;
  rewards: number;     // earned with lessons
  base: number;        // what the user was given: 10 000 $ + rewards
  pnl: number;         // trading result only
  pnlPct: number;
  positions: Position[];
};

export function summarize(
  portfolio: { cash: number; rewards: number; holdings: Partial<Record<CoinId, number>>; transactions: Transaction[] },
  priceOf: (id: CoinId) => number,
): Summary {
  const positions = COINS.filter((coin) => (portfolio.holdings[coin.id] ?? 0) > 0).map((coin) => {
    const quantity = portfolio.holdings[coin.id] ?? 0;
    const price = priceOf(coin.id);
    const avgCost = averageCost(portfolio.transactions, coin.id);
    return {
      ...coin,
      quantity,
      value: quantity * price,
      avgCost,
      pnl: avgCost && price ? (price - avgCost) * quantity : null,
      pnlPct: avgCost && price ? (price / avgCost - 1) * 100 : null,
    };
  });
  const cryptoValue = positions.reduce((sum, p) => sum + p.value, 0);
  const total = portfolio.cash + cryptoValue;
  const base = STARTING_CASH + portfolio.rewards;
  return {
    total,
    cash: portfolio.cash,
    cryptoValue,
    rewards: portfolio.rewards,
    base,
    pnl: total - base,
    pnlPct: (total / base - 1) * 100,
    positions,
  };
}

/** The fox's comment on the user's finances, in plain words. */
export function foxVerdict(s: Summary): { tone: 'neutral' | 'good' | 'bad'; text: string } {
  if (s.positions.length === 0) {
    return {
      tone: 'neutral',
      text: "Tout ton argent dort en cash pour l'instant. Aucun risque… mais aucun gain non plus. Commence petit : 5 à 10 % de ton cash sur une crypto, pour voir comment ça bouge.",
    };
  }
  const biggest = [...s.positions].sort((a, b) => b.value - a.value)[0];
  const share = s.cryptoValue > 0 ? biggest.value / s.total : 0;
  if (share > 0.6) {
    return {
      tone: 'bad',
      text: `${Math.round(share * 100)} % de ton argent est sur ${biggest.name}. Si elle chute, tout ton portefeuille chute avec. Répartir sur plusieurs cryptos (et garder du cash) limite la casse.`,
    };
  }
  if (s.pnl > 0) {
    return {
      tone: 'good',
      text: 'Tu es dans le vert, bien joué ! Tant que tu ne vends pas, ce gain reste « latent » : il peut encore bouger. Certains vendent une partie pour sécuriser.',
    };
  }
  if (s.pnl < 0) {
    return {
      tone: 'bad',
      text: "Tu es un peu dans le rouge, pas de panique : c'est normal en crypto. Une perte n'est réelle que si tu vends. L'important, c'est de ne pas investir plus que ce que tu es prêt·e à perdre.",
    };
  }
  return { tone: 'neutral', text: 'Ton portefeuille est stable. Bonne base pour tester une nouvelle crypto.' };
}
