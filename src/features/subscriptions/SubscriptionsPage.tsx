import { useState } from 'react';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { Select } from '../../shared/components/Select';
import { SubscriptionSummaryBar } from './SubscriptionSummaryBar';
import { SubscriptionListSection } from './SubscriptionListSection';
import { SubscriptionCalendarSection } from './SubscriptionCalendarSection';
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type RecurringFilters,
  type RecurringSort,
  type RecurringType,
  type RecurringStatus,
  type RecurringFrequency,
} from './types';

type View = 'list' | 'calendar';

const VIEW_SEGMENTS = [
  { value: 'list' as View, label: 'List' },
  { value: 'calendar' as View, label: 'Calendar' },
];

const TYPE_SEGMENTS = [
  { value: 'all' as RecurringType, label: 'All' },
  { value: 'bill' as RecurringType, label: 'Bills' },
  { value: 'income' as RecurringType, label: 'Income' },
];

const STATUS_SEGMENTS = [
  { value: 'active' as RecurringStatus, label: 'Active' },
  { value: 'cancelled' as RecurringStatus, label: 'Cancelled' },
  { value: 'all' as RecurringStatus, label: 'All' },
];

export function SubscriptionsPage() {
  const [view, setView] = useState<View>('list');
  const [filters, setFilters] = useState<RecurringFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<RecurringSort>(DEFAULT_SORT);

  function setFrequency(value: string) {
    setFilters((f) => ({ ...f, frequency: value as RecurringFrequency | 'all' }));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Subscriptions & Bills</h1>
        <SegmentedControl<View>
          segments={VIEW_SEGMENTS}
          value={view}
          onChange={setView}
        />
      </div>

      {/* Summary stat bar */}
      <SubscriptionSummaryBar />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <SegmentedControl<RecurringType>
          segments={TYPE_SEGMENTS}
          value={filters.type}
          onChange={(type) => setFilters((f) => ({ ...f, type }))}
        />
        <SegmentedControl<RecurringStatus>
          segments={STATUS_SEGMENTS}
          value={filters.status}
          onChange={(status) => setFilters((f) => ({ ...f, status }))}
        />
        <Select value={filters.frequency} onChange={(e) => setFrequency(e.target.value)}>
          <option value="all">All frequencies</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </Select>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <SubscriptionListSection
          filters={filters}
          sort={sort}
          onSort={setSort}
        />
      ) : (
        <SubscriptionCalendarSection filters={filters} />
      )}
    </div>
  );
}
