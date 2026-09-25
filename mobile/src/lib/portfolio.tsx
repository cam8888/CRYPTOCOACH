/**
 * The virtual portfolio: cash, crypto holdings and transaction history.
 *
 * Same logic as buy() / sell() / get_average_cost() in the Streamlit app.
 * For now it is saved on the phone (expo-sqlite key-value store).
 * When Google sign-in is added, only the save/load part will switch to Supabase.
 */
import Storage from 'expo-sqlite/kv-store';
import { createContext, ReactNode, useContext, useState } from 'react';

import { CoinId } from '@/lib/coingecko';

export const STARTING_CASH = 10000;
const STORAGE_KEY = 'portfolio-v1';

export type Transaction = {
  date: string; // ISO date
  coin: CoinId;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
};

type PortfolioState = {
  cash: number;
  holdings: Partial<Record<CoinId, number>>;
  transactions: Transaction[];
};

const EMPTY: PortfolioState = { cash: STARTING_CASH, holdings: {}, transactions: [] };

function load(): PortfolioState {
  const saved = Storage.getItemSync(STORAGE_KEY);
  return saved ? JSON.parse(saved) : EMPTY;
}

/** Average price paid for a coin = total spent ÷ quantity bought. */
export function averageCost(transactions: Transaction[], coin: CoinId): number | null {
  const buys = transactions.filter((t) => t.coin === coin && t.side === 'buy');
  const spent = buys.reduce((sum, t) => sum + t.total, 0);
  const quantity = buys.reduce((sum, t) => sum + t.quantity, 0);
  return quantity > 0 ? spent / quantity : null;
}

type PortfolioContextValue = PortfolioState & {
  buy: (coin: CoinId, amountUsd: number, price: number) => number;
  sell: (coin: CoinId, quantity: number, price: number) => number;
  reset: () => void;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(load);

  function save(next: PortfolioState) {
    setState(next);
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
  }

  function buy(coin: CoinId, amountUsd: number, price: number) {
    const quantity = amountUsd / price;
    save({
      cash: state.cash - amountUsd,
      holdings: { ...state.holdings, [coin]: (state.holdings[coin] ?? 0) + quantity },
      transactions: [
        { date: new Date().toISOString(), coin, side: 'buy', quantity, price, total: amountUsd },
        ...state.transactions,
      ],
    });
    return quantity;
  }

  function sell(coin: CoinId, quantity: number, price: number) {
    const amountUsd = quantity * price;
    save({
      cash: state.cash + amountUsd,
      holdings: { ...state.holdings, [coin]: Math.max(0, (state.holdings[coin] ?? 0) - quantity) },
      transactions: [
        { date: new Date().toISOString(), coin, side: 'sell', quantity, price, total: amountUsd },
        ...state.transactions,
      ],
    });
    return amountUsd;
  }

  function reset() {
    save(EMPTY);
  }

  return (
    <PortfolioContext.Provider value={{ ...state, buy, sell, reset }}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return value;
}
