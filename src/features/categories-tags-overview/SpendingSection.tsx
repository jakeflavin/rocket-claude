import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { DonutChart, type DonutChartItem } from '../../shared/components/DonutChart';
import { HorizontalBarChart, type HorizontalBarChartItem } from '../../shared/components/HorizontalBarChart';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { useCategorySpending } from './useCategorySpending';
import type { SpendingPeriod } from './types';

type Props = {
  period: SpendingPeriod;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onPeriodChange: (p: SpendingPeriod) => void;
};

const PERIOD_SEGMENTS = [
  { value: 'month' as const, label: 'This Month' },
  { value: 'quarter' as const, label: 'This Quarter' },
  { value: 'year' as const, label: 'This Year' },
];

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export function SpendingSection({ period, selectedCategoryId, onSelectCategory, onPeriodChange }: Props) {
  const { categorySpending, subcategorySpending, loading, error } = useCategorySpending(period, selectedCategoryId);

  const categoryItems = useMemo<DonutChartItem[]>(
    () => categorySpending.map((c) => ({ id: c.category_id, label: c.category_name, value: c.total, color: c.color })),
    [categorySpending],
  );

  const subcategoryItems = useMemo<HorizontalBarChartItem[]>(
    () => subcategorySpending.map((s) => ({ id: s.subcategory_id, label: s.subcategory_name, value: s.total, color: s.color })),
    [subcategorySpending],
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">Spending by Category</h2>
          <SegmentedControl segments={PERIOD_SEGMENTS} value={period} onChange={onPeriodChange} />
        </div>
        <div className="px-5 py-4">
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((n) => <div key={n} className="h-8 animate-pulse rounded bg-hover" />)}
            </div>
          )}
          {error && <p className="text-sm text-error">{error.message}</p>}
          {!loading && !error && (
            <DonutChart
              data={categoryItems}
              valueFormatter={formatCurrency}
              selectedId={selectedCategoryId}
              onItemClick={(id) => onSelectCategory(selectedCategoryId === id ? null : id)}
              emptyMessage="No spending data for this period."
            />
          )}
        </div>
      </Card>

      {selectedCategoryId && subcategoryItems.length > 0 && (
        <Card>
          <div className="flex items-center border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-text">Spending by Subcategory</h2>
          </div>
          <div className="px-5 py-4">
            <HorizontalBarChart
              data={subcategoryItems}
              height={Math.max(subcategoryItems.length * 44, 80)}
              valueFormatter={formatCurrency}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
