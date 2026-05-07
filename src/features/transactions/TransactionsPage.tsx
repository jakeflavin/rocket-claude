import { useState } from 'react';
import { DataTable, type ColumnDef } from '../../shared/components/DataTable';
import { TransactionExpandedRow } from './TransactionExpandedRow';
import { Pagination, type PageSize } from '../../shared/components/Pagination';
import { useTransactions } from './useTransactions';
import { useFilterOptions } from './useFilterOptions';
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type Transaction,
  type TransactionFilters,
  type TransactionSort,
} from './types';

function formatAmount(amount: number, currency: string): string {
  const n = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    Math.abs(amount),
  );
  return amount >= 0 ? `+${n}` : n;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const COLUMNS: ColumnDef<Transaction>[] = [
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    cellClassName: 'text-muted',
    render: (row) => formatDate(row.date),
  },
  {
    key: 'merchant',
    header: 'Merchant',
    sortable: true,
    cellClassName: 'font-medium text-text',
    render: (row) => row.merchant,
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    cellClassName: 'text-muted',
    render: (row) => row.category,
  },
  {
    key: 'account',
    header: 'Account',
    sortable: true,
    cellClassName: 'text-muted',
    render: (row) => row.account,
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    headerClassName: 'text-right',
    cellClassName: 'text-right',
    render: (row) => (
      <span
        className={
          row.amount >= 0
            ? 'font-semibold text-success'
            : 'font-semibold text-text'
        }
      >
        {formatAmount(row.amount, row.currency)}
      </span>
    ),
  },
  {
    key: 'pending',
    header: 'Status',
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          row.pending
            ? 'border-warning-border bg-warning-bg text-warning'
            : 'border-success-border bg-success-bg text-success'
        }`}
      >
        {row.pending ? 'Pending' : 'Cleared'}
      </span>
    ),
  },
];

const INPUT_CLS =
  'h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-subtle focus:border-link focus:outline-none focus:ring-[3px] focus:ring-brand/[0.12]';

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TransactionSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const { transactions, total, loading, error } = useTransactions(filters, sort, page, pageSize);
  const { accounts, categories } = useFilterOptions();

  function setFilter<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleSort(key: string, dir: TransactionSort['dir']) {
    setSort({ key, dir });
    setPage(1);
  }

  function handlePageSizeChange(size: PageSize) {
    setPageSize(size);
    setPage(1);
  }

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <section className="grid gap-4" aria-label="Transactions">
      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          <input
            className={`${INPUT_CLS} min-w-48 flex-1`}
            type="search"
            placeholder="Search merchant or description…"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />

          <select
            className={INPUT_CLS}
            value={filters.accountId}
            onChange={(e) => setFilter('accountId', e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            className={INPUT_CLS}
            value={filters.categoryId}
            onChange={(e) => setFilter('categoryId', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className={`${INPUT_CLS} min-w-[136px]`}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
            aria-label="From date"
          />

          <input
            className={`${INPUT_CLS} min-w-[136px]`}
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
            aria-label="To date"
          />

          <select
            className={INPUT_CLS}
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value as TransactionFilters['type'])}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className={INPUT_CLS}
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as TransactionFilters['status'])}
          >
            <option value="all">All statuses</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
          </select>

          {hasActiveFilters && (
            <button
              className="h-9 rounded-lg border border-border bg-transparent px-3 text-sm text-muted transition-colors duration-[100ms] hover:bg-hover hover:text-text"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable<Transaction>
        columns={COLUMNS}
        rows={transactions}
        getRowKey={(row) => row.id}
        sortKey={sort.key}
        sortDir={sort.dir}
        onSort={handleSort}
        loading={loading}
        error={error?.message}
        emptyMessage="No transactions match your filters."
        renderExpanded={(row) => <TransactionExpandedRow row={row} />}
      />

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </section>
  );
}
