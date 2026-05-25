import { useState } from 'react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { DataTable, type ColumnDef } from '../../shared/components/DataTable';
import { Input } from '../../shared/components/Input';
import { Pagination } from '../../shared/components/Pagination';
import { Select } from '../../shared/components/Select';
import { TransactionExpandedRow } from './TransactionExpandedRow';
import { useFilterOptions } from './useFilterOptions';
import { useTransactionParams } from './useTransactionParams';
import { useTransactions } from './useTransactions';
import { DEFAULT_FILTERS, type Transaction, type TransactionFilters } from './types';

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
      <span className={row.amount >= 0 ? 'font-semibold text-success' : 'font-semibold text-text'}>
        {formatAmount(row.amount, row.currency)}
      </span>
    ),
  },
  {
    key: 'pending',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.pending ? 'warning' : 'success'}>
        {row.pending ? 'Pending' : 'Cleared'}
      </Badge>
    ),
  },
];

export function TransactionsPage() {
  const { filters, sort, page, pageSize, setFilter, setFilters, setSort, setPage, setPageSize } = useTransactionParams();
  const [version, setVersion] = useState(0);

  const { transactions, total, loading, error } = useTransactions(filters, sort, page, pageSize, version);
  const { accounts, categories } = useFilterOptions();

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <section className="grid gap-4" aria-label="Transactions">
      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-col gap-2">
          <Input
            type="search"
            placeholder="Search merchant or description…"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />

          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <Select
              value={filters.accountId}
              onChange={(e) => setFilter('accountId', e.target.value)}
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>

            <Select
              value={filters.categoryId}
              onChange={(e) => setFilter('categoryId', e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Input
              type="date"
              className="!w-auto shrink-0"
              value={filters.dateFrom}
              onChange={(e) => setFilter('dateFrom', e.target.value)}
              aria-label="From date"
            />

            <Input
              type="date"
              className="!w-auto shrink-0"
              value={filters.dateTo}
              onChange={(e) => setFilter('dateTo', e.target.value)}
              aria-label="To date"
            />

            <Select
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value as TransactionFilters['type'])}
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>

            <Select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value as TransactionFilters['status'])}
            >
              <option value="all">All statuses</option>
              <option value="cleared">Cleared</option>
              <option value="pending">Pending</option>
            </Select>

            <Button
              variant="secondary"
              disabled={!hasActiveFilters}
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable<Transaction>
        columns={COLUMNS}
        rows={transactions}
        getRowKey={(row) => row.id}
        sortKey={sort.key}
        sortDir={sort.dir}
        onSort={(key, dir) => setSort({ key, dir })}
        loading={loading}
        error={error?.message}
        emptyMessage="No transactions match your filters."
        renderExpanded={(row) => (
          <TransactionExpandedRow
            row={row}
            categories={categories}
            onMutated={() => setVersion((v) => v + 1)}
          />
        )}
      />

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </section>
  );
}
