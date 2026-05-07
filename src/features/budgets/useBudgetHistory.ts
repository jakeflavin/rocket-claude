import { useEffect, useState } from 'react';
import { queryBudgetHistory } from './queries';
import type { BudgetHistoryPoint } from './types';

type Result = {
  history: BudgetHistoryPoint[];
  loading: boolean;
};

export function useBudgetHistory(budgetId: string | null): Result {
  const [history, setHistory] = useState<BudgetHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!budgetId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    queryBudgetHistory(budgetId)
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
  }, [budgetId]);

  return { history, loading };
}
