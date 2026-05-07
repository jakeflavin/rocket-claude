import { MetricCard } from '../../shared/components/MetricCard';
import { useRecurringSummary } from './useRecurringSummary';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function SubscriptionSummaryBar() {
  const { summary, loading } = useRecurringSummary();

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
      <MetricCard label="Monthly Bills" value={formatCurrency(summary.totalMonthlyExpense)} />
      <MetricCard label="Active" value={summary.activeCount} />
      <MetricCard label="Due This Week" value={summary.dueThisWeekCount} />
      <MetricCard label="Cancelled" value={summary.cancelledCount} />
    </div>
  );
}
