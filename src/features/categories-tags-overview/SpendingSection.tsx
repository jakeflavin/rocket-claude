import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { useCategorySpending } from './useCategorySpending';
import type { CategorySpending, SpendingPeriod, SubcategorySpending } from './types';

type Props = {
  period: SpendingPeriod;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onPeriodChange: (p: SpendingPeriod) => void;
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function SpendingBar({ item, maxTotal, isSelected, onClick }: {
  item: CategorySpending | SubcategorySpending;
  maxTotal: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
  const name = 'category_name' in item ? item.category_name : item.subcategory_name;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-[100ms] hover:bg-hover ${isSelected ? 'bg-hover ring-1 ring-inset ring-brand/20' : ''}`}
    >
      <span className="w-3 h-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      <span className="w-36 shrink-0 truncate text-sm text-text">{name}</span>
      <div className="flex-1 h-2 bg-hover rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[250ms]"
          style={{ width: `${pct}%`, backgroundColor: item.color }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm font-medium text-text">{formatCurrency(item.total)}</span>
      <span className="w-12 shrink-0 text-right text-xs text-muted">{item.transaction_count} txn</span>
    </button>
  );
}

const PERIOD_LABELS: Record<SpendingPeriod, string> = {
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
};

export function SpendingSection({ period, selectedCategoryId, onSelectCategory, onPeriodChange }: Props) {
  const { categorySpending, subcategorySpending, loading, error } = useCategorySpending(period, selectedCategoryId);

  const maxCategoryTotal = useMemo(
    () => Math.max(...categorySpending.map((c) => c.total), 1),
    [categorySpending],
  );
  const maxSubcategoryTotal = useMemo(
    () => Math.max(...subcategorySpending.map((s) => s.total), 1),
    [subcategorySpending],
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Spending by Category</h2>
          <div className="flex gap-1">
            {(Object.keys(PERIOD_LABELS) as SpendingPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors duration-[100ms] ${
                  period === p ? 'bg-brand text-white' : 'text-muted hover:bg-hover hover:text-text'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-10 animate-pulse rounded-lg bg-hover" />
            ))}
          </div>
        )}
        {error && <p className="text-sm text-error">{error.message}</p>}
        {!loading && !error && categorySpending.length === 0 && (
          <p className="text-sm text-muted py-4 text-center">No spending data for this period.</p>
        )}
        {!loading && !error && categorySpending.length > 0 && (
          <div className="space-y-1">
            {categorySpending.map((item) => (
              <SpendingBar
                key={item.category_id}
                item={item}
                maxTotal={maxCategoryTotal}
                isSelected={selectedCategoryId === item.category_id}
                onClick={() => onSelectCategory(selectedCategoryId === item.category_id ? null : item.category_id)}
              />
            ))}
          </div>
        )}
      </Card>

      {selectedCategoryId && subcategorySpending.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-text mb-4">Spending by Subcategory</h2>
          <div className="space-y-1">
            {subcategorySpending.map((item) => (
              <SpendingBar
                key={item.subcategory_id}
                item={item}
                maxTotal={maxSubcategoryTotal}
                isSelected={false}
                onClick={() => {}}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
