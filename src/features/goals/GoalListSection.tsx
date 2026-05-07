import { GoalCard } from './GoalCard';
import type { GoalWithStats } from './types';

type Props = {
  goals: GoalWithStats[];
  loading: boolean;
  onSelect: (goal: GoalWithStats) => void;
};

export function GoalListSection({ goals, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[160px] rounded-xl border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text">No goals yet</p>
        <p className="mt-1 text-xs text-muted">Click "New Goal" to create your first savings goal.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onClick={onSelect} />
      ))}
    </div>
  );
}
