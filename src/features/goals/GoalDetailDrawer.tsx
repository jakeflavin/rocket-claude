import { useEffect, useState } from 'react';
import { Drawer } from '../../shared/components/Drawer';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { RadialProgressChart } from '../../shared/components/RadialProgressChart';
import { ProjectionChart } from '../../shared/components/ProjectionChart';
import { queryGoalProjectionData } from './queries';
import type { GoalWithStats, GoalProjectionData } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

type Props = {
  goal: GoalWithStats | null;
  onClose: () => void;
  onEdit: (goal: GoalWithStats) => void;
};

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

type FieldRowProps = { label: string; children: React.ReactNode };

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</span>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

export function GoalDetailDrawer({ goal, onClose, onEdit }: Props) {
  const [projData, setProjData] = useState<GoalProjectionData | null>(null);
  const [projLoading, setProjLoading] = useState(false);

  useEffect(() => {
    if (!goal) { setProjData(null); return; }
    let cancelled = false;
    setProjLoading(true);
    queryGoalProjectionData(goal)
      .then((data) => { if (!cancelled) { setProjData(data); setProjLoading(false); } })
      .catch(() => { if (!cancelled) setProjLoading(false); });
    return () => { cancelled = true; };
  }, [goal?.id]);

  const isCompleted = goal?.status === 'completed';
  const pct = goal ? Math.round(goal.progress * 100) : 0;

  return (
    <Drawer open={goal !== null} onClose={onClose} title={goal?.name ?? ''} width={420}>
      {goal && (
        <div className="px-4 pb-6 flex flex-col gap-0">
          {/* Hero */}
          <div className="py-5 border-b border-border flex items-center gap-4">
            <RadialProgressChart
              value={goal.progress}
              size={64}
              strokeWidth={6}
              color={isCompleted ? 'var(--color-success)' : undefined}
              label={`${pct}%`}
            />
            <div>
              <p className="text-2xl font-semibold text-text">{pct}% Saved</p>
              <p className="text-xs text-muted mt-0.5">
                {fmt(goal.current_amount)} of {fmt(goal.target_amount)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <FieldRow label="Status">
              <Badge variant={STATUS_BADGE[goal.status]}>{STATUS_LABEL[goal.status]}</Badge>
            </FieldRow>
            <FieldRow label="Current Amount">{fmt(goal.current_amount)}</FieldRow>
            <FieldRow label="Target Amount">{fmt(goal.target_amount)}</FieldRow>
            <FieldRow label="Remaining">
              {isCompleted ? '—' : fmt(goal.remaining)}
            </FieldRow>
            <FieldRow label="Target Date">{formatDate(goal.target_date)}</FieldRow>
            <FieldRow label="Days Remaining">
              {isCompleted ? 'Completed' : `${goal.days_remaining} days`}
            </FieldRow>
            <FieldRow label="Monthly Needed">
              {isCompleted ? '—' : `${fmt(goal.monthly_needed)}/mo`}
            </FieldRow>
            <FieldRow label="Linked Account">
              {goal.linked_account_name ?? 'Not linked'}
            </FieldRow>
          </div>

          {/* Projection chart */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-3">
              Progress Projection
            </p>
            {projLoading ? (
              <div className="h-[200px] rounded-lg bg-hover animate-pulse" />
            ) : projData ? (
              <ProjectionChart
                historicalData={projData.historicalData}
                projectionData={projData.projectionData}
                targetValue={goal.target_amount}
                height={200}
                valueFormatter={fmt}
                emptyMessage="No projection data available."
              />
            ) : null}
          </div>

          {/* Edit */}
          <div className="mt-6">
            <Button variant="primary" className="w-full" onClick={() => onEdit(goal)}>
              Edit Goal
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
