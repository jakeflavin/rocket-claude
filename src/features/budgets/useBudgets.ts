import { useCallback, useEffect, useState } from 'react';
import { queryBudgets } from './queries';
import type { BudgetWithStats } from './types';

type Result = {
  budgets: BudgetWithStats[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

export function useBudgets(): Result {
  const [budgets, setBudgets] = useState<BudgetWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryBudgets()
      .then((data) => {
        if (!cancelled) {
          setBudgets(data);
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
  }, [tick]);

  return { budgets, loading, error, refresh };
}
