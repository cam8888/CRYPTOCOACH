import { useCallback, useEffect, useState } from 'react';

import { CoinMarket, fetchMarkets } from '@/lib/coingecko';

/** Market data (price, 24h / 7d change, 7-day curve…), reloaded with `refresh`. */
export function useMarkets() {
  const [markets, setMarkets] = useState<CoinMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setMarkets(await fetchMarkets());
      setUpdatedAt(new Date());
      setError(null);
    } catch {
      setError('Impossible de charger le marché. Tire vers le bas pour réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { markets, loading, error, updatedAt, refresh };
}
