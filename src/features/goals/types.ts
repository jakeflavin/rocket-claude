export type GoalStatus = 'completed' | 'on_track' | 'at_risk' | 'behind';

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  linked_account_id: string | null;
  linked_account_name: string | null;
  created_at: string;
};

export type GoalWithStats = Goal & {
  progress: number;
  remaining: number;
  days_remaining: number;
  monthly_needed: number;
  status: GoalStatus;
};

export type GoalProjectionData = {
  historicalData: { label: string; value: number }[];
  projectionData: { label: string; value: number }[];
};

export type AvailableAccount = {
  id: string;
  name: string;
  institution: string;
};

export const STATUS_LABEL: Record<GoalStatus, string> = {
  completed: 'Completed',
  on_track: 'On Track',
  at_risk: 'At Risk',
  behind: 'Behind',
};

export const STATUS_BADGE: Record<GoalStatus, 'success' | 'brand' | 'warning' | 'error'> = {
  completed: 'success',
  on_track: 'brand',
  at_risk: 'warning',
  behind: 'error',
};

export function computeGoalStatus(
  progress: number,
  created_at: string,
  target_date: string,
): GoalStatus {
  if (progress >= 1.0) return 'completed';
  const now = Date.now();
  const start = new Date(created_at).getTime();
  const end = new Date(target_date + 'T00:00:00').getTime();
  const totalMs = end - start;
  const elapsedMs = now - start;
  const expected = totalMs > 0 ? elapsedMs / totalMs : 0;
  const gap = expected - progress;
  if (gap <= 0) return 'on_track';
  if (gap <= 0.15) return 'at_risk';
  return 'behind';
}

export function computeMonthlyNeeded(remaining: number, days_remaining: number): number {
  const months = Math.max(days_remaining / 30.44, 0.5);
  return remaining / months;
}
