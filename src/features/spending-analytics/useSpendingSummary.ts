import { useEffect, useState } from 'react';
import { querySpendingSummary } from './queries';
import type { SpendingSummary } from './types';

type Result = {
  summary: SpendingSummary | null;
  loading: boolean;
};

export function useSpendingSummary(): Result {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    querySpendingSummary()
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { summary, loading };
}
