import { useEffect, useState } from 'react';
import { queryRecurringSummary } from './queries';
import type { RecurringSummary } from './types';

type Result = {
  summary: RecurringSummary | null;
  loading: boolean;
};

export function useRecurringSummary(): Result {
  const [summary, setSummary] = useState<RecurringSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queryRecurringSummary()
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
