import { useState } from 'react';
import { DataTable, type ColumnDef } from '../../shared/components/DataTable';
import { Badge } from '../../shared/components/Badge';
import { RecurringDetailDrawer } from './RecurringDetailDrawer';
import type { RecurringTransaction, RecurringFilters, RecurringSort } from './types';
import { useRecurring } from './useRecurring';

type Props = {
  filters: RecurringFilters;
  sort: RecurringSort;
  onSort: (sort: RecurringSort) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(value));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  annual: 'Annual',
};

const COLUMNS: ColumnDef<RecurringTransaction>[] = [
  {
    key: 'merchant',
    header: 'Merchant',
    sortable: true,
    render: (row) => (
      <span className="font-medium text-text">{row.merchant}</span>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    cellClassName: 'tabular-nums',
    render: (row) => (
      <span className={row.amount > 0 ? 'text-success' : 'text-text'}>
        {row.amount > 0 ? '+' : '-'}{formatCurrency(row.amount)}
      </span>
    ),
  },
  {
    key: 'frequency',
    header: 'Frequency',
    sortable: true,
    render: (row) => (
      <Badge variant="default">{FREQUENCY_LABEL[row.frequency] ?? row.frequency}</Badge>
    ),
  },
  {
    key: 'next_due_date',
    header: 'Next Due',
    sortable: true,
    cellClassName: 'text-muted tabular-nums',
    render: (row) => formatDate(row.next_due_date),
  },
  {
    key: 'category_name',
    header: 'Category',
    sortable: true,
    render: (row) => (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: row.category_color }}
        />
        <span className="text-muted">{row.category_name}</span>
      </span>
    ),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    sortable: true,
    render: (row) => {
      const pct = Math.round(row.confidence * 100);
      const variant = pct >= 95 ? 'success' : pct >= 80 ? 'warning' : 'error';
      return <Badge variant={variant}>{pct}%</Badge>;
    },
  },
];

export function SubscriptionListSection({ filters, sort, onSort }: Props) {
  const { items, loading, error } = useRecurring(filters, sort);
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);

  function handleSort(key: string, dir: 'asc' | 'desc') {
    onSort({ key: key as RecurringSort['key'], dir });
  }

  return (
    <>
      <DataTable<RecurringTransaction>
        columns={COLUMNS}
        rows={items}
        getRowKey={(row) => row.id}
        sortKey={sort.key}
        sortDir={sort.dir}
        onSort={handleSort}
        loading={loading}
        error={error?.message ?? null}
        emptyMessage="No recurring transactions found"
        onRowClick={setSelected}
      />

      <RecurringDetailDrawer
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
