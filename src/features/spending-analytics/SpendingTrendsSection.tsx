import { Card } from '../../shared/components/Card';
import { LineAreaChart } from '../../shared/components/LineAreaChart';
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

export function SpendingTrendsSection({ period }: Props) {
  const { points, loading, error } = usePeriodPoints(period);

  const series = [
    {
      key: 'expenses',
      label: 'Expenses',
      color: 'var(--color-brand)',
      data: points.map((p) => ({ label: p.label, value: p.expenses })),
    },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <p className="text-sm font-semibold text-text mb-4">Spending Trends</p>
      {loading ? (
        <div className="h-[240px] rounded-lg bg-hover animate-pulse" />
      ) : error ? (
        <p className="py-8 text-center text-sm text-error">{error.message}</p>
      ) : (
        <LineAreaChart
          series={series}
          height={240}
          valueFormatter={formatCurrency}
          emptyMessage="No spending data available."
        />
      )}
    </Card>
  );
}
