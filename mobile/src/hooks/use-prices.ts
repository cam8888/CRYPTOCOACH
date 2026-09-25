import { useCallback, useEffect, useState } from 'react';

import { CoinPrice, fetchPrices } from '@/lib/coingecko';

/** Loads live prices once, and again whenever `refresh` is called (pull to refresh). */
export function usePrices() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPrices(await fetchPrices());
      setError(null);
    } catch {
      setError('Impossible de charger les prix pour le moment. Tire vers le bas pour réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { prices, loading, error, refresh };
}
