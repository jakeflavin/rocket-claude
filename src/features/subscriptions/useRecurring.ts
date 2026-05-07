import { useEffect, useState } from 'react';
import { queryRecurring } from './queries';
import type { RecurringTransaction, RecurringFilters, RecurringSort } from './types';

type Result = {
  items: RecurringTransaction[];
  loading: boolean;
  error: Error | null;
};

export function useRecurring(filters: RecurringFilters, sort: RecurringSort): Result {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { type, status, frequency } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryRecurring({ type, status, frequency }, sort)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
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
  }, [type, status, frequency, sort.key, sort.dir]);

  return { items, loading, error };
}
