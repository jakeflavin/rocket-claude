import { useEffect, useState } from 'react';
import { queryTransactions } from './queries';
import type { Transaction, TransactionFilters, TransactionSort, PageSize } from './types';

type Result = {
  transactions: Transaction[];
  total: number;
  loading: boolean;
  error: Error | null;
};

export function useTransactions(
  filters: TransactionFilters,
  sort: TransactionSort,
  page: number,
  pageSize: PageSize,
): Result {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Debounce free-text search to avoid per-keystroke queries
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { accountId, categoryId, dateFrom, dateTo, type, status } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryTransactions(
      { search: debouncedSearch, accountId, categoryId, dateFrom, dateTo, type, status },
      sort,
      page,
      pageSize,
    )
      .then(({ transactions, total }) => {
        if (!cancelled) {
          setTransactions(transactions);
          setTotal(total);
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

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, accountId, categoryId, dateFrom, dateTo, type, status, sort.key, sort.dir, page, pageSize]);

  return { transactions, total, loading, error };
}
