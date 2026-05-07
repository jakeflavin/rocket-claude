import { MetricCard } from '../../shared/components/MetricCard';
import { useBudgetSummary } from './useBudgetSummary';

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

type Props = { tick: number };

export function BudgetSummaryBar({ tick }: Props) {
  const { summary, loading } = useBudgetSummary(tick);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-xl border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard label="Total Budgeted" value={fmt(summary.totalBudgeted)} />
      <MetricCard label="Total Spent" value={fmt(summary.totalSpent)} />
      <MetricCard label="On Track" value={summary.onTrackCount} />
      <MetricCard label="Over Budget" value={summary.overBudgetCount} />
    </div>
  );
}
