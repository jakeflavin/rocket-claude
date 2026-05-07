import { useEffect, useState } from 'react';
import { queryAccounts } from './queries';
import type { Account } from './types';

type Result = {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
};

export function useAccounts(
  includeHidden = false,
  includeClosed = false,
  version = 0,
): Result {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryAccounts(includeHidden, includeClosed)
      .then((data) => {
        if (!cancelled) {
          setAccounts(data);
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
  }, [includeHidden, includeClosed, version]);

  return { accounts, loading, error };
}
