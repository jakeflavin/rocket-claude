import { Drawer } from '../../shared/components/Drawer';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { GroupedBarChart } from '../../shared/components/GroupedBarChart';
import { useBudgetHistory } from './useBudgetHistory';
import type { BudgetWithStats } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

type Props = {
  budget: BudgetWithStats | null;
  onClose: () => void;
  onEdit: (budget: BudgetWithStats) => void;
};

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

const PERIOD_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  annual: 'Annual',
};

type FieldRowProps = { label: string; children: React.ReactNode };

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</span>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

function HistoryChart({ budgetId, amount }: { budgetId: string; amount: number }) {
  const { history, loading } = useBudgetHistory(budgetId);

  const series = [
    {
      key: 'budget',
      label: 'Budget',
      color: 'var(--color-brand)',
      data: history.map((p) => ({ label: p.label, value: p.budget })),
    },
    {
      key: 'spent',
      label: 'Spent',
      color: 'var(--color-error)',
      data: history.map((p) => ({ label: p.label, value: p.spent })),
    },
  ];

  if (loading) {
    return <div className="h-[180px] rounded-lg bg-hover animate-pulse" />;
  }

  return (
    <GroupedBarChart
      series={series}
      height={180}
      valueFormatter={fmt}
      emptyMessage="No transaction history found."
    />
  );
}

export function BudgetDetailDrawer({ budget, onClose, onEdit }: Props) {
  const isOver = budget?.status === 'over_budget';

  return (
    <Drawer
      open={budget !== null}
      onClose={onClose}
      title={budget?.category_name ?? ''}
      width={420}
    >
      {budget && (
        <div className="px-4 pb-6 flex flex-col gap-0">
          {/* Hero */}
          <div className="py-5 border-b border-border flex items-center gap-3">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: budget.category_color }}
            />
            <div>
              <p className="text-2xl font-semibold text-text">{fmt(budget.spent)}</p>
              <p className="text-xs text-muted mt-0.5">of {fmt(budget.amount)} {PERIOD_LABEL[budget.period]?.toLowerCase() ?? budget.period} budget</p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <FieldRow label="Status">
              <Badge variant={STATUS_BADGE[budget.status]}>{STATUS_LABEL[budget.status]}</Badge>
            </FieldRow>
            <FieldRow label="Spent">{fmt(budget.spent)}</FieldRow>
            <FieldRow label={isOver ? 'Overspent' : 'Remaining'}>
              <span className={isOver ? 'text-error' : undefined}>
                {fmt(Math.abs(budget.remaining))}
              </span>
            </FieldRow>
            <FieldRow label="Budget Limit">{fmt(budget.amount)}</FieldRow>
            <FieldRow label="Period">{PERIOD_LABEL[budget.period] ?? budget.period}</FieldRow>
            <FieldRow label="Rollover">{budget.rollover ? 'Enabled' : 'Disabled'}</FieldRow>
          </div>

          {/* 6-month history */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-3">6-Month History</p>
            <HistoryChart budgetId={budget.id} amount={budget.amount} />
          </div>

          {/* Edit */}
          <div className="mt-6">
            <Button variant="primary" className="w-full" onClick={() => onEdit(budget)}>
              Edit Budget
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
