import { useEffect, useState } from 'react';
import { queryBudgetSummary } from './queries';
import type { BudgetSummary } from './types';

type Result = {
  summary: BudgetSummary | null;
  loading: boolean;
};

export function useBudgetSummary(tick: number): Result {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryBudgetSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  return { summary, loading };
}
