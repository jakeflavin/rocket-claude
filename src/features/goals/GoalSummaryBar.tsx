import { MetricCard } from '../../shared/components/MetricCard';
import type { GoalWithStats } from './types';

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

type Props = { goals: GoalWithStats[]; loading: boolean };

export function GoalSummaryBar({ goals, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-xl border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const avgProgress = goals.length > 0
    ? Math.round((goals.reduce((s, g) => s + g.progress, 0) / goals.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard label="Total Goals" value={goals.length} />
      <MetricCard label="Total Saved" value={fmt(totalSaved)} />
      <MetricCard label="Total Target" value={fmt(totalTarget)} />
      <MetricCard label="Avg Progress" value={`${avgProgress}%`} />
    </div>
  );
}
