import { useEffect, useState } from 'react';
import { queryMerchantSpending } from './queries';
import type { MerchantSpend, SpendingPeriod } from './types';

type Result = {
  merchants: MerchantSpend[];
  loading: boolean;
  error: Error | null;
};

export function useMerchantSpending(period: SpendingPeriod): Result {
  const [merchants, setMerchants] = useState<MerchantSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryMerchantSpending(period)
      .then((data) => {
        if (!cancelled) {
          setMerchants(data);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [period]);

  return { merchants, loading, error };
}
