import { RadialProgressChart } from '../../shared/components/RadialProgressChart';
import { ProgressBar } from '../../shared/components/ProgressBar';
import { Badge } from '../../shared/components/Badge';
import { Card } from '../../shared/components/Card';
import type { BudgetWithStats } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function progressColor(utilization: number): string {
  if (utilization >= 1.0) return 'var(--color-error)';
  if (utilization >= 0.75) return 'var(--color-warning)';
  return 'var(--color-success)';
}

const PERIOD_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  annual: 'Annual',
};

type Props = {
  budget: BudgetWithStats;
  onClick: (budget: BudgetWithStats) => void;
};

export function BudgetCard({ budget, onClick }: Props) {
  const pct = Math.round(budget.utilization * 100);
  const color = progressColor(budget.utilization);

  return (
    <Card
      className="p-5 shadow-xs cursor-pointer hover:border-border-hover transition-colors"
      onClick={() => onClick(budget)}
    >
      <div className="flex items-start gap-4">
        {/* Radial gauge */}
        <div className="shrink-0">
          <RadialProgressChart
            value={budget.utilization}
            size={72}
            strokeWidth={7}
            label={`${pct}%`}
            subLabel="used"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: budget.category_color }}
            />
            <span className="text-sm font-semibold text-text truncate">{budget.category_name}</span>
            <Badge variant="default" className="shrink-0">{PERIOD_LABEL[budget.period] ?? budget.period}</Badge>
          </div>

          <p className="text-xs text-muted mb-3">
            {fmt(budget.spent)} <span className="text-text-subtle">of</span> {fmt(budget.amount)}
          </p>

          <ProgressBar
            value={budget.spent}
            max={budget.amount}
            color={color}
          />

          <div className="mt-3">
            <Badge variant={STATUS_BADGE[budget.status]}>{STATUS_LABEL[budget.status]}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
