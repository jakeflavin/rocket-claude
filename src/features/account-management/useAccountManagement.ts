import { useCallback, useEffect, useState } from 'react';
import { queryAccounts, queryTransactionCountsByAccount } from './queries';
import type { Account } from './types';

type Result = {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  txnCounts: Record<string, number>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  multiSelected: Set<string>;
  toggleMultiSelect: (id: string) => void;
  clearMultiSelect: () => void;
  refresh: () => void;
};

export function useAccountManagement(): Result {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [txnCounts, setTxnCounts] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryAccounts(true, true)
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
  }, [version]);

  useEffect(() => {
    queryTransactionCountsByAccount()
      .then(setTxnCounts)
      .catch(() => {});
  }, [version]);

  const toggleMultiSelect = useCallback((id: string) => {
    setMultiSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setSelectedId(null);
      }
      return next;
    });
  }, []);

  const clearMultiSelect = useCallback(() => {
    setMultiSelected(new Set());
  }, []);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    accounts,
    loading,
    error,
    txnCounts,
    selectedId,
    setSelectedId,
    multiSelected,
    toggleMultiSelect,
    clearMultiSelect,
    refresh,
  };
}
