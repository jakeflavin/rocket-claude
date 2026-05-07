import { useEffect, useState } from 'react';
import { queryUncategorizedTransactions, queryUncategorizedCount } from './queries';
import type { UncategorizedTransaction } from './types';

type Result = {
  transactions: UncategorizedTransaction[];
  total: number;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

export function useUncategorizedTransactions(): Result {
  const [transactions, setTransactions] = useState<UncategorizedTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rev, setRev] = useState(0);

  function refresh() {
    setRev((r) => r + 1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([queryUncategorizedTransactions(), queryUncategorizedCount()])
      .then(([txns, count]) => {
        if (!cancelled) {
          setTransactions(txns);
          setTotal(count);
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
  }, [rev]);

  return { transactions, total, loading, error, refresh };
}
