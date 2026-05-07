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

export function CashFlowSection({ period }: Props) {
  const { points, loading, error } = usePeriodPoints(period);

  // Use green when overall trend is positive, brand orange when negative
  const avgNet = points.length > 0
    ? points.reduce((sum, p) => sum + p.net, 0) / points.length
    : 0;
  const lineColor = avgNet >= 0 ? 'var(--color-success)' : 'var(--color-brand)';

  const series = [
    {
      key: 'net',
      label: 'Net Cash Flow',
      color: lineColor,
      data: points.map((p) => ({ label: p.label, value: p.net })),
    },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <p className="text-sm font-semibold text-text mb-4">Cash Flow</p>
      {loading ? (
        <div className="h-[240px] rounded-lg bg-hover animate-pulse" />
      ) : error ? (
        <p className="py-8 text-center text-sm text-error">{error.message}</p>
      ) : (
        <LineAreaChart
          series={series}
          height={240}
          valueFormatter={formatCurrency}
          emptyMessage="No cash flow data available."
        />
      )}
    </Card>
  );
}
