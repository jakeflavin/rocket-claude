import { useCallback, useEffect, useState } from 'react';
import { queryGoals } from './queries';
import type { GoalWithStats } from './types';

type Result = {
  goals: GoalWithStats[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

export function useGoals(): Result {
  const [goals, setGoals] = useState<GoalWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryGoals()
      .then((data) => {
        if (!cancelled) {
          setGoals(data);
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

  return { goals, loading, error, refresh };
}
