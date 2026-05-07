import { RadialProgressChart } from '../../shared/components/RadialProgressChart';
import { ProgressBar } from '../../shared/components/ProgressBar';
import { Badge } from '../../shared/components/Badge';
import { Card } from '../../shared/components/Card';
import type { GoalWithStats } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

type Props = {
  goal: GoalWithStats;
  onClick: (goal: GoalWithStats) => void;
};

export function GoalCard({ goal, onClick }: Props) {
  const pct = Math.round(goal.progress * 100);
  const isCompleted = goal.status === 'completed';

  return (
    <Card
      className="p-5 shadow-xs cursor-pointer hover:border-border-hover transition-colors"
      onClick={() => onClick(goal)}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <RadialProgressChart
            value={goal.progress}
            size={72}
            strokeWidth={7}
            color={isCompleted ? 'var(--color-success)' : undefined}
            label={`${pct}%`}
            subLabel="saved"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text truncate">{goal.name}</span>
            <Badge variant={STATUS_BADGE[goal.status]} className="shrink-0">
              {STATUS_LABEL[goal.status]}
            </Badge>
          </div>

          <p className="text-xs text-muted mb-3">
            {fmt(goal.current_amount)} <span className="text-text-subtle">of</span> {fmt(goal.target_amount)}
          </p>

          <ProgressBar value={goal.current_amount} max={goal.target_amount} />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">
              {isCompleted ? 'Completed' : `${goal.days_remaining} days left`}
            </span>
            {!isCompleted && (
              <span className="text-xs font-medium text-brand">
                Save {fmt(goal.monthly_needed)}/mo
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
