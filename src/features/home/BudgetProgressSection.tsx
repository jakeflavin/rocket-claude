import { Card } from '../../shared/components/Card';
import { ProgressBar } from '../../shared/components/ProgressBar';
import type { DashboardBudgetRow } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

function progressColor(utilization: number): string {
  if (utilization >= 1) return 'var(--color-error)';
  if (utilization >= 0.8) return 'var(--color-warning)';
  return 'var(--color-success)';
}

type Props = {
  budgets: DashboardBudgetRow[];
  loading: boolean;
  onNavigate: (path: string) => void;
};

export function BudgetProgressSection({ budgets, loading, onNavigate }: Props) {
  if (loading) {
    return <div className="h-48 rounded-xl bg-surface animate-pulse" />;
  }

  return (
    <Card className="p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text">Budgets</h2>
        <button
          className="text-xs text-brand hover:underline"
          onClick={() => onNavigate('/budgets')}
        >
          View All
        </button>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">No budgets set up yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {budgets.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: b.category_color }}
                  />
                  <p className="text-sm font-medium text-text truncate">{b.category_name}</p>
                </div>
                <p className="text-xs text-muted tabular-nums shrink-0 ml-2">
                  {fmt(b.spent)} / {fmt(b.amount)}
                </p>
              </div>
              <ProgressBar value={b.spent} max={b.amount} color={progressColor(b.utilization)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
