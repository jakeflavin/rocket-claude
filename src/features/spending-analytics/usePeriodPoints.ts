import { useEffect, useState } from 'react';
import { queryPeriodPoints } from './queries';
import type { PeriodPoint, SpendingPeriod } from './types';

type Result = {
  points: PeriodPoint[];
  loading: boolean;
  error: Error | null;
};

export function usePeriodPoints(period: SpendingPeriod): Result {
  const [points, setPoints] = useState<PeriodPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryPeriodPoints(period)
      .then((data) => {
        if (!cancelled) {
          setPoints(data);
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

  return { points, loading, error };
}
