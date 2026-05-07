import { useMemo } from 'react';
import { Card } from '../../shared/components/Card';
import { DonutChart } from '../../shared/components/DonutChart';
import type { BudgetWithStats } from './types';

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

type Props = {
  budgets: BudgetWithStats[];
  loading: boolean;
};

export function BudgetAllocationSection({ budgets, loading }: Props) {
  const data = useMemo(
    () =>
      budgets.map((b) => ({
        id: b.id,
        label: b.category_name,
        value: b.amount,
        color: b.category_color,
      })),
    [budgets],
  );

  return (
    <Card className="p-5 shadow-xs">
      <p className="text-sm font-semibold text-text mb-4">Budget Allocation</p>
      {loading ? (
        <div className="h-[220px] rounded-lg bg-hover animate-pulse" />
      ) : (
        <div className="flex justify-center">
          <DonutChart
            data={data}
            size={220}
            valueFormatter={fmt}
            emptyMessage="No budgets yet. Create one to see allocation."
          />
        </div>
      )}
    </Card>
  );
}
