import type { SortDir } from '../../shared/components/DataTable';
import type { PageSize } from '../../shared/components/Pagination';

export type { PageSize, SortDir };

export type FilterOption = { id: string; name: string };

export type Transaction = {
  // Shown in the table
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  amount: number;
  currency: string;
  pending: boolean;
  // Shown in the expanded panel
  description: string | null;
  transaction_type: string | null;
  authorized_date: string | null;
  is_transfer: boolean;
  transfer_group: string | null;
  notes: string | null;
  tags: string | null;
  location: string | null;
  external_id: string | null;
  created_at: string | null;
};

export type TransactionFilters = {
  search: string;
  accountId: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  type: 'all' | 'income' | 'expense';
  status: 'all' | 'cleared' | 'pending';
};

export const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  accountId: '',
  categoryId: '',
  dateFrom: '',
  dateTo: '',
  type: 'all',
  status: 'all',
};

export type TransactionSort = {
  key: string;
  dir: SortDir;
};

export const DEFAULT_SORT: TransactionSort = {
  key: 'date',
  dir: 'desc',
};
