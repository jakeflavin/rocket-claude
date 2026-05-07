import { BudgetCard } from './BudgetCard';
import type { BudgetWithStats } from './types';

type Props = {
  budgets: BudgetWithStats[];
  loading: boolean;
  onSelect: (budget: BudgetWithStats) => void;
};

export function BudgetListSection({ budgets, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[140px] rounded-xl border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text">No budgets yet</p>
        <p className="mt-1 text-xs text-muted">Click "New Budget" to create your first budget.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard key={budget.id} budget={budget} onClick={onSelect} />
      ))}
    </div>
  );
}
