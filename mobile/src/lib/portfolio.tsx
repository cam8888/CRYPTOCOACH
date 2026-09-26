/**
 * The virtual portfolio: cash, crypto holdings and transaction history.
 *
 * Two modes:
 * - Guest: everything is saved on the phone (expo-sqlite key-value store).
 * - Signed in with Google: everything lives in Supabase (tables users, holdings,
 *   transactions), so the user finds it again on any phone, and in the Streamlit app.
 *   Buy / sell / reset call SQL functions that run as one transaction on the server.
 */
import Storage from 'expo-sqlite/kv-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { CoinId } from '@/lib/coingecko';
import { supabase } from '@/lib/supabase';

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
  rewards: number; // virtual dollars earned by passing lessons (not a trading gain)
  holdings: Partial<Record<CoinId, number>>;
  transactions: Transaction[];
};

const EMPTY: PortfolioState = { cash: STARTING_CASH, rewards: 0, holdings: {}, transactions: [] };

function loadLocal(): PortfolioState {
  const saved = Storage.getItemSync(STORAGE_KEY);
  return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY;
}

/** Read the signed-in user's portfolio from Supabase (Row Level Security only returns their rows). */
async function loadRemote(name: string | null): Promise<PortfolioState> {
  await supabase.rpc('ensure_user', { p_name: name });
  const [user, holdings, transactions] = await Promise.all([
    supabase.from('users').select('cash, rewards').single(),
    supabase.from('holdings').select('coin, amount'),
    supabase.from('transactions').select('created_at, coin, side, quantity, price, total').order('created_at', { ascending: false }),
  ]);
  if (user.error) throw new Error(user.error.message);
  return {
    cash: Number(user.data.cash),
    rewards: Number(user.data.rewards ?? 0),
    holdings: Object.fromEntries((holdings.data ?? []).map((h) => [h.coin, Number(h.amount)])),
    transactions: (transactions.data ?? []).map((t) => ({
      date: t.created_at,
      coin: t.coin,
      side: t.side,
      quantity: Number(t.quantity),
      price: Number(t.price),
      total: Number(t.total),
    })),
  };
}

/** Average price paid for a coin = total spent ÷ quantity bought. */
export function averageCost(transactions: Transaction[], coin: CoinId): number | null {
  const buys = transactions.filter((t) => t.coin === coin && t.side === 'buy');
  const spent = buys.reduce((sum, t) => sum + t.total, 0);
  const quantity = buys.reduce((sum, t) => sum + t.quantity, 0);
  return quantity > 0 ? spent / quantity : null;
}

type PortfolioContextValue = PortfolioState & {
  isRemote: boolean;
  buy: (coin: CoinId, amountUsd: number, price: number) => Promise<number>;
  sell: (coin: CoinId, quantity: number, price: number) => Promise<number>;
  addReward: (amount: number) => void;
  reset: () => Promise<void>;
  reload: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { session, firstName } = useAppState();
  const isRemote = session !== null;
  const [state, setState] = useState<PortfolioState>(loadLocal);

  const reload = useCallback(async () => {
    if (isRemote) setState(await loadRemote(firstName));
    else setState(loadLocal());
  }, [isRemote, firstName]);

  // Switch data source when the user signs in or out
  useEffect(() => {
    reload().catch((e) => console.warn('Portfolio load failed', e));
  }, [reload]);

  function saveLocal(next: PortfolioState) {
    setState(next);
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
  }

  async function buy(coin: CoinId, amountUsd: number, price: number) {
    const quantity = amountUsd / price;
    if (isRemote) {
      const { error } = await supabase.rpc('buy_crypto', { p_coin: coin, p_amount: amountUsd, p_price: price });
      if (error) throw new Error(error.message);
      await reload();
    } else {
      saveLocal({
        ...state,
        cash: state.cash - amountUsd,
        holdings: { ...state.holdings, [coin]: (state.holdings[coin] ?? 0) + quantity },
        transactions: [
          { date: new Date().toISOString(), coin, side: 'buy', quantity, price, total: amountUsd },
          ...state.transactions,
        ],
      });
    }
    return quantity;
  }

  async function sell(coin: CoinId, quantity: number, price: number) {
    const amountUsd = quantity * price;
    if (isRemote) {
      const { error } = await supabase.rpc('sell_crypto', { p_coin: coin, p_quantity: quantity, p_price: price });
      if (error) throw new Error(error.message);
      await reload();
    } else {
      saveLocal({
        ...state,
        cash: state.cash + amountUsd,
        holdings: { ...state.holdings, [coin]: Math.max(0, (state.holdings[coin] ?? 0) - quantity) },
        transactions: [
          { date: new Date().toISOString(), coin, side: 'sell', quantity, price, total: amountUsd },
          ...state.transactions,
        ],
      });
    }
    return amountUsd;
  }

  /** Guest mode only: when signed in, the server adds the reward in complete_lesson(). */
  function addReward(amount: number) {
    saveLocal({ ...state, cash: state.cash + amount, rewards: state.rewards + amount });
  }

  async function reset() {
    if (isRemote) {
      const { error } = await supabase.rpc('reset_portfolio');
      if (error) throw new Error(error.message);
      await reload();
    } else {
      saveLocal(EMPTY);
    }
  }

  return (
    <PortfolioContext.Provider value={{ ...state, isRemote, buy, sell, addReward, reset, reload }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return value;
}
