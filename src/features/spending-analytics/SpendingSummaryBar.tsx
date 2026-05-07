import { MetricCard } from '../../shared/components/MetricCard';
import { useSpendingSummary } from './useSpendingSummary';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function SpendingSummaryBar() {
  const { summary, loading } = useSpendingSummary();

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-xl border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  const netPositive = summary.netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard label="Avg Monthly Spend" value={formatCurrency(summary.avgMonthlyExpense)} />
      <MetricCard label="Savings Rate" value={`${Math.round(summary.savingsRate)}%`} />
      <MetricCard
        label="Net Cash Flow"
        value={`${netPositive ? '+' : ''}${formatCurrency(summary.netCashFlow)}`}
      />
    </div>
  );
}
