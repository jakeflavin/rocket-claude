import { MetricCard } from '../../shared/components/MetricCard';
import type { DashboardSummary } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

type Props = { summary: DashboardSummary | null; loading: boolean };

export function DashboardSummaryBar({ summary, loading }: Props) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  const monthNetColor = summary.monthNet >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Net Worth" value={fmt(summary.netWorth)} />
      <MetricCard label="Total Assets" value={fmt(summary.totalAssets)} />
      <MetricCard label="Total Liabilities" value={fmt(summary.totalLiabilities)} />
      <div className="rounded-xl bg-surface border border-border p-5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">This Month</p>
        <p className={`mt-1 text-[28px] font-semibold leading-tight ${monthNetColor}`}>
          {fmt(summary.monthNet)}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {fmt(summary.monthIncome)} in · {fmt(summary.monthExpenses)} out
        </p>
      </div>
    </div>
  );
}
