import { Card } from '../../shared/components/Card';
import { GroupedBarChart } from '../../shared/components/GroupedBarChart';
import { usePeriodPoints } from './usePeriodPoints';
import type { SpendingPeriod } from './types';

type Props = { period: SpendingPeriod };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function IncomeExpensesSection({ period }: Props) {
  const { points, loading, error } = usePeriodPoints(period);

  const series = [
    {
      key: 'income',
      label: 'Income',
      color: 'var(--color-success)',
      data: points.map((p) => ({ label: p.label, value: p.income })),
    },
    {
      key: 'expenses',
      label: 'Expenses',
      color: 'var(--color-brand)',
      data: points.map((p) => ({ label: p.label, value: p.expenses })),
    },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <p className="text-sm font-semibold text-text mb-4">Income vs Expenses</p>
      {loading ? (
        <div className="h-[260px] rounded-lg bg-hover animate-pulse" />
      ) : error ? (
        <p className="py-8 text-center text-sm text-error">{error.message}</p>
      ) : (
        <GroupedBarChart
          series={series}
          height={260}
          valueFormatter={formatCurrency}
          emptyMessage="No income or expense data available."
        />
      )}
    </Card>
  );
}
