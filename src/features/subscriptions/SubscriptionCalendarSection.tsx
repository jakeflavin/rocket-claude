import { useState } from 'react';
import { CalendarGrid } from '../../shared/components/CalendarGrid';
import { RecurringDetailDrawer } from './RecurringDetailDrawer';
import type { RecurringTransaction, RecurringFilters, RecurringSort } from './types';
import { useRecurring } from './useRecurring';

type Props = {
  filters: RecurringFilters;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(value));
}

export function SubscriptionCalendarSection({ filters }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);

  // Fetch all active items for the calendar; sort doesn't matter here
  const sort: RecurringSort = { key: 'next_due_date', dir: 'asc' };
  const { items, loading } = useRecurring(filters, sort);

  if (loading) {
    return (
      <div className="h-[560px] rounded-xl border border-border bg-surface animate-pulse" />
    );
  }

  return (
    <>
      <CalendarGrid<RecurringTransaction>
        year={year}
        month={month}
        items={items}
        getItemDate={(item) => item.next_due_date}
        onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
        renderItem={(item) => (
          <button
            type="button"
            onClick={() => setSelected(item)}
            className={[
              'w-full text-left rounded px-1.5 py-0.5 text-[11px] leading-tight truncate',
              'transition-colors duration-[100ms] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40',
              item.amount > 0
                ? 'bg-success-bg text-success hover:bg-success-border'
                : 'bg-brand-light text-brand hover:bg-[#F0C8A0]',
            ].join(' ')}
          >
            <span className="font-medium">{item.merchant}</span>
            <span className="ml-1 opacity-70">{formatCurrency(item.amount)}</span>
          </button>
        )}
      />

      <RecurringDetailDrawer
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
