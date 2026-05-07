import { useEffect, useState } from 'react';
import { queryAccountBalanceHistory } from './queries';

type HistoryPoint = { date: string; balance: number };

type Result = {
  history: HistoryPoint[];
  loading: boolean;
};

export function useAccountBalanceHistory(accountId: string | null): Result {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    queryAccountBalanceHistory(accountId)
      .then((data) => {
        if (!cancelled) {
          setHistory(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [accountId]);

  return { history, loading };
}
