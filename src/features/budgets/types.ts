export type BudgetPeriod = 'monthly' | 'weekly' | 'annual';

export type BudgetStatus = 'on_track' | 'getting_close' | 'over_budget';

export type Budget = {
  id: string;
  category_id: string;
  category_name: string;
  category_color: string;
  amount: number;
  period: BudgetPeriod;
  rollover: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type BudgetWithStats = Budget & {
  spent: number;
  remaining: number;
  utilization: number;
  status: BudgetStatus;
};

export type BudgetHistoryPoint = {
  label: string;
  budget: number;
  spent: number;
};

export type AvailableCategory = {
  id: string;
  name: string;
  color: string;
};

export type BudgetSummary = {
  totalBudgeted: number;
  totalSpent: number;
  onTrackCount: number;
  overBudgetCount: number;
};

export function computeStatus(utilization: number): BudgetStatus {
  if (utilization >= 1.0) return 'over_budget';
  if (utilization >= 0.75) return 'getting_close';
  return 'on_track';
}

export const STATUS_LABEL: Record<BudgetStatus, string> = {
  on_track: 'On Track',
  getting_close: 'Getting Close',
  over_budget: 'Over Budget',
};

export const STATUS_BADGE: Record<BudgetStatus, 'success' | 'warning' | 'error'> = {
  on_track: 'success',
  getting_close: 'warning',
  over_budget: 'error',
};
