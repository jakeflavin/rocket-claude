import { useCallback, useEffect, useState } from 'react';
import type { PageSize } from '../../shared/components/Pagination';
import { DEFAULT_FILTERS, DEFAULT_SORT, type TransactionFilters, type TransactionSort } from './types';

const PAGE_SIZES: PageSize[] = [10, 25, 50, 100];

function readParams(): {
  filters: TransactionFilters;
  sort: TransactionSort;
  page: number;
  pageSize: PageSize;
} {
  const p = new URLSearchParams(window.location.search);

  const type = p.get('type');
  const status = p.get('status');
  const dir = p.get('dir');
  const size = Number(p.get('size'));

  return {
    filters: {
      search: p.get('q') ?? DEFAULT_FILTERS.search,
      accountId: p.get('account') ?? DEFAULT_FILTERS.accountId,
      categoryId: p.get('category') ?? DEFAULT_FILTERS.categoryId,
      dateFrom: p.get('from') ?? DEFAULT_FILTERS.dateFrom,
      dateTo: p.get('to') ?? DEFAULT_FILTERS.dateTo,
      type: (type === 'income' || type === 'expense' ? type : DEFAULT_FILTERS.type),
      status: (status === 'cleared' || status === 'pending' ? status : DEFAULT_FILTERS.status),
    },
    sort: {
      key: p.get('sort') ?? DEFAULT_SORT.key,
      dir: (dir === 'asc' || dir === 'desc' ? dir : DEFAULT_SORT.dir),
    },
    page: Math.max(1, Number(p.get('page')) || 1),
    pageSize: (PAGE_SIZES.includes(size as PageSize) ? (size as PageSize) : 25),
  };
}

function writeParams(
  filters: TransactionFilters,
  sort: TransactionSort,
  page: number,
  pageSize: PageSize,
) {
  const p = new URLSearchParams();

  if (filters.search) p.set('q', filters.search);
  if (filters.accountId) p.set('account', filters.accountId);
  if (filters.categoryId) p.set('category', filters.categoryId);
  if (filters.dateFrom) p.set('from', filters.dateFrom);
  if (filters.dateTo) p.set('to', filters.dateTo);
  if (filters.type !== 'all') p.set('type', filters.type);
  if (filters.status !== 'all') p.set('status', filters.status);
  if (sort.key !== DEFAULT_SORT.key) p.set('sort', sort.key);
  if (sort.dir !== DEFAULT_SORT.dir) p.set('dir', sort.dir);
  if (page !== 1) p.set('page', String(page));
  if (pageSize !== 25) p.set('size', String(pageSize));

  const search = p.toString();
  const url = window.location.pathname + (search ? `?${search}` : '') + window.location.hash;
  history.replaceState(null, '', url);
}

export function useTransactionParams() {
  const [state, setState] = useState(readParams);

  useEffect(() => {
    function onPopState() {
      setState(readParams());
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setFilters = useCallback((next: TransactionFilters) => {
    setState((prev) => {
      const updated = { ...prev, filters: next, page: 1 };
      writeParams(updated.filters, updated.sort, updated.page, updated.pageSize);
      return updated;
    });
  }, []);

  const setFilter = useCallback(<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setState((prev) => {
      const updated = { ...prev, filters: { ...prev.filters, [key]: value }, page: 1 };
      writeParams(updated.filters, updated.sort, updated.page, updated.pageSize);
      return updated;
    });
  }, []);

  const setSort = useCallback((sort: TransactionSort) => {
    setState((prev) => {
      const updated = { ...prev, sort, page: 1 };
      writeParams(updated.filters, updated.sort, updated.page, updated.pageSize);
      return updated;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => {
      const updated = { ...prev, page };
      writeParams(updated.filters, updated.sort, updated.page, updated.pageSize);
      return updated;
    });
  }, []);

  const setPageSize = useCallback((pageSize: PageSize) => {
    setState((prev) => {
      const updated = { ...prev, pageSize, page: 1 };
      writeParams(updated.filters, updated.sort, updated.page, updated.pageSize);
      return updated;
    });
  }, []);

  return { ...state, setFilter, setFilters, setSort, setPage, setPageSize };
}
