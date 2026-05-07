import { getConnection } from '../../shared/db/client';
import { persistGoals } from '../../shared/db/persist';
import type { GoalWithStats, GoalProjectionData, AvailableAccount } from './types';
import { computeGoalStatus, computeMonthlyNeeded } from './types';

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

function monthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export async function queryGoals(): Promise<GoalWithStats[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT
      g.id, g.name,
      CAST(g.target_amount AS DOUBLE) AS target_amount,
      COALESCE(CAST(a.balance AS DOUBLE), CAST(g.current_amount AS DOUBLE)) AS current_amount,
      CAST(g.target_date AS VARCHAR) AS target_date,
      g.linked_account_id,
      a.name AS linked_account_name,
      CAST(g.created_at AS VARCHAR) AS created_at
    FROM goals g
    LEFT JOIN accounts a ON a.id = g.linked_account_id
    ORDER BY g.target_date
  `);

  return result.toArray().map((row) => {
    const r = row.toJSON() as Record<string, unknown>;
    const target_amount = Number(r.target_amount ?? 0);
    const current_amount = Number(r.current_amount ?? 0);
    const target_date = String(r.target_date ?? '');
    const created_at = String(r.created_at ?? '');
    const progress = target_amount > 0 ? Math.min(current_amount / target_amount, 1) : 0;
    const remaining = Math.max(target_amount - current_amount, 0);
    const days_remaining = Math.max(
      Math.ceil((new Date(target_date + 'T00:00:00').getTime() - Date.now()) / 86400000),
      0,
    );
    return {
      id: String(r.id),
      name: String(r.name),
      target_amount,
      current_amount,
      target_date,
      linked_account_id: r.linked_account_id ? String(r.linked_account_id) : null,
      linked_account_name: r.linked_account_name ? String(r.linked_account_name) : null,
      created_at,
      progress,
      remaining,
      days_remaining,
      monthly_needed: computeMonthlyNeeded(remaining, days_remaining),
      status: computeGoalStatus(progress, created_at, target_date),
    };
  });
}

export async function queryGoalProjectionData(goal: GoalWithStats): Promise<GoalProjectionData> {
  const conn = await getConnection();
  let historicalData: { label: string; value: number }[] = [];

  if (goal.linked_account_id) {
    const result = await conn.query(`
      SELECT
        STRFTIME(DATE_TRUNC('month', CAST(date AS DATE)), '%b %Y') AS label,
        LAST(CAST(balance AS DOUBLE) ORDER BY CAST(date AS DATE)) AS value
      FROM account_balance_history
      WHERE account_id = '${esc(goal.linked_account_id)}'
      GROUP BY DATE_TRUNC('month', CAST(date AS DATE))
      ORDER BY DATE_TRUNC('month', CAST(date AS DATE))
    `);
    historicalData = result.toArray().map((r) => {
      const row = r.toJSON() as { label: string; value: number };
      return { label: row.label, value: Number(row.value ?? 0) };
    });
  }

  const todayLabel = monthLabel(new Date());
  if (historicalData.length === 0) {
    historicalData = [{ label: todayLabel, value: goal.current_amount }];
  }

  // Build projection: monthly steps from today to target_date
  const projectionData: { label: string; value: number }[] = [];
  const targetDate = new Date(goal.target_date + 'T00:00:00');
  const now = new Date();
  const totalMonths = Math.ceil(
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth()),
  );

  // First point shares today's label with last historical point for visual continuity
  const sharedLabel = historicalData[historicalData.length - 1].label;
  projectionData.push({ label: sharedLabel, value: goal.current_amount });

  for (let i = 1; i <= Math.max(totalMonths, 1); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = monthLabel(d);
    const value = Math.min(goal.current_amount + goal.monthly_needed * i, goal.target_amount);
    projectionData.push({ label, value });
    if (value >= goal.target_amount) break;
  }

  return { historicalData, projectionData };
}

export async function queryAvailableAccounts(): Promise<AvailableAccount[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT id, name, institution
    FROM accounts
    WHERE type = 'depository'
      AND is_hidden = false
      AND is_closed = false
    ORDER BY name
  `);
  return result.toArray().map((r) => r.toJSON() as AvailableAccount);
}

export async function insertGoal(data: {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  linked_account_id: string | null;
}): Promise<string> {
  const conn = await getConnection();
  const id = `goal_${Date.now().toString(36)}`;
  const linkedId = data.linked_account_id ? `'${esc(data.linked_account_id)}'` : 'NULL';
  await conn.query(`
    INSERT INTO goals (id, name, target_amount, current_amount, target_date, linked_account_id, created_at)
    VALUES (
      '${esc(id)}',
      '${esc(data.name)}',
      ${data.target_amount},
      ${data.current_amount},
      '${esc(data.target_date)}',
      ${linkedId},
      NOW()
    )
  `);
  persistGoals().catch((e) => console.error('CSV persist failed:', e));
  return id;
}

export async function updateGoal(
  id: string,
  patch: Partial<{
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
    linked_account_id: string | null;
  }>,
): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];
  if (patch.name != null) clauses.push(`name = '${esc(patch.name)}'`);
  if (patch.target_amount != null) clauses.push(`target_amount = ${patch.target_amount}`);
  if (patch.current_amount != null) clauses.push(`current_amount = ${patch.current_amount}`);
  if (patch.target_date != null) clauses.push(`target_date = '${esc(patch.target_date)}'`);
  if ('linked_account_id' in patch) {
    clauses.push(
      patch.linked_account_id
        ? `linked_account_id = '${esc(patch.linked_account_id)}'`
        : `linked_account_id = NULL`,
    );
  }
  if (clauses.length === 0) return;
  await conn.query(`UPDATE goals SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistGoals().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteGoal(id: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`DELETE FROM goals WHERE id = '${esc(id)}'`);
  persistGoals().catch((e) => console.error('CSV persist failed:', e));
}
