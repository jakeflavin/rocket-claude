import { Card } from '../../shared/components/Card';
import { LineAreaChart } from '../../shared/components/LineAreaChart';
import type { DashboardCashFlowPoint } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

type Props = { data: DashboardCashFlowPoint[]; loading: boolean };

export function CashFlowSection({ data, loading }: Props) {
  if (loading) {
    return <div className="h-64 rounded-xl bg-surface animate-pulse" />;
  }

  const series = [
    {
      key: 'income',
      label: 'Income',
      color: 'var(--color-success)',
      data: data.map((d) => ({ label: d.label, value: d.income })),
    },
    {
      key: 'expenses',
      label: 'Expenses',
      color: 'var(--color-error)',
      data: data.map((d) => ({ label: d.label, value: d.expenses })),
    },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-text mb-4">Cash Flow</h2>
      <LineAreaChart series={series} height={200} valueFormatter={fmt} emptyMessage="No cash flow data available." />
    </Card>
  );
}
