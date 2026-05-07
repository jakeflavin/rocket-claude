import { getConnection } from '../../shared/db/client';
import { persistBudgets } from '../../shared/db/persist';
import type {
  BudgetWithStats,
  BudgetHistoryPoint,
  AvailableCategory,
  BudgetSummary,
  BudgetPeriod,
} from './types';
import { computeStatus } from './types';

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

function periodStartExpr(period: BudgetPeriod): string {
  if (period === 'monthly') return `DATE_TRUNC('month', CURRENT_DATE)`;
  if (period === 'weekly') return `CURRENT_DATE - (DAYOFWEEK(CURRENT_DATE) - 1)`;
  return `DATE_TRUNC('year', CURRENT_DATE)`;
}

export async function queryBudgets(): Promise<BudgetWithStats[]> {
  const conn = await getConnection();

  const sql = `
    SELECT
      b.id,
      b.amount,
      b.period,
      b.rollover,
      CAST(b.start_date AS VARCHAR) AS start_date,
      CAST(b.end_date   AS VARCHAR) AS end_date,
      CAST(b.created_at AS VARCHAR) AS created_at,
      c.id   AS category_id,
      COALESCE(c.name, 'Uncategorized') AS category_name,
      COALESCE(c.color, '#9E9B96')      AS category_color,
      COALESCE((
        SELECT SUM(ABS(CAST(t.amount AS DOUBLE)))
        FROM transactions t
        WHERE t.category_id = b.category_id
          AND t.is_transfer = false
          AND (t.exclude_from_analytics = false OR t.exclude_from_analytics IS NULL)
          AND t.pending = false
          AND CAST(t.amount AS DOUBLE) < 0
          AND CAST(t.date AS DATE) >= CASE b.period
            WHEN 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE)
            WHEN 'weekly'  THEN CURRENT_DATE - (DAYOFWEEK(CURRENT_DATE) - 1)
            WHEN 'annual'  THEN DATE_TRUNC('year', CURRENT_DATE)
          END
          AND CAST(t.date AS DATE) <= CURRENT_DATE
      ), 0) AS spent
    FROM budgets b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE (b.end_date IS NULL OR TRIM(CAST(b.end_date AS VARCHAR)) = '' OR CAST(b.end_date AS DATE) >= CURRENT_DATE)
    ORDER BY c.name
  `;

  const result = await conn.query(sql);
  return result.toArray().map((row) => {
    const r = row.toJSON() as Record<string, unknown>;
    const amount = Number(r.amount ?? 0);
    const spent = Number(r.spent ?? 0);
    const remaining = amount - spent;
    const utilization = amount > 0 ? spent / amount : 0;
    return {
      id: String(r.id),
      category_id: String(r.category_id ?? ''),
      category_name: String(r.category_name),
      category_color: String(r.category_color),
      amount,
      period: r.period as BudgetPeriod,
      rollover: r.rollover === true || r.rollover === 'true',
      start_date: String(r.start_date ?? ''),
      end_date: r.end_date ? String(r.end_date) : null,
      created_at: String(r.created_at ?? ''),
      spent,
      remaining,
      utilization,
      status: computeStatus(utilization),
    };
  });
}

export async function queryBudgetSummary(): Promise<BudgetSummary> {
  const budgets = await queryBudgets();
  return {
    totalBudgeted: budgets.reduce((s, b) => s + b.amount, 0),
    totalSpent: budgets.reduce((s, b) => s + b.spent, 0),
    onTrackCount: budgets.filter((b) => b.status !== 'over_budget').length,
    overBudgetCount: budgets.filter((b) => b.status === 'over_budget').length,
  };
}

export async function queryBudgetHistory(budgetId: string): Promise<BudgetHistoryPoint[]> {
  const conn = await getConnection();

  const budgetResult = await conn.query(`
    SELECT b.category_id, CAST(b.amount AS DOUBLE) AS amount
    FROM budgets b
    WHERE b.id = '${esc(budgetId)}'
    LIMIT 1
  `);
  const budgetRow = budgetResult.toArray()[0]?.toJSON() as { category_id: string; amount: number } | undefined;
  if (!budgetRow) return [];

  const { category_id, amount } = budgetRow;

  const sql = `
    SELECT
      STRFTIME(month_start, '%b %Y') AS label,
      ABS(COALESCE(SUM(CASE
        WHEN CAST(t.amount AS DOUBLE) < 0
          AND t.is_transfer = false
          AND (t.exclude_from_analytics = false OR t.exclude_from_analytics IS NULL)
          AND t.pending = false
          AND t.category_id = '${esc(category_id)}'
        THEN CAST(t.amount AS DOUBLE) ELSE 0
      END), 0)) AS spent
    FROM (
      SELECT DATE_TRUNC('month', CURRENT_DATE) - INTERVAL (n) MONTH AS month_start
      FROM (VALUES (0),(1),(2),(3),(4),(5)) AS t(n)
    ) months
    LEFT JOIN transactions t
      ON CAST(t.date AS DATE) >= months.month_start
     AND CAST(t.date AS DATE) < months.month_start + INTERVAL 1 MONTH
    GROUP BY month_start, label
    ORDER BY month_start
  `;

  const result = await conn.query(sql);
  return result.toArray().map((row) => {
    const r = row.toJSON() as { label: string; spent: number };
    return { label: r.label, budget: Number(amount), spent: Number(r.spent ?? 0) };
  });
}

export async function queryAvailableCategories(excludeBudgetId?: string): Promise<AvailableCategory[]> {
  const conn = await getConnection();
  const excludeClause = excludeBudgetId
    ? `AND c.id NOT IN (
         SELECT b.category_id FROM budgets b
         WHERE b.id != '${esc(excludeBudgetId)}'
           AND (b.end_date IS NULL OR TRIM(CAST(b.end_date AS VARCHAR)) = '' OR CAST(b.end_date AS DATE) >= CURRENT_DATE)
       )`
    : `AND c.id NOT IN (
         SELECT b.category_id FROM budgets b
         WHERE (b.end_date IS NULL OR TRIM(CAST(b.end_date AS VARCHAR)) = '' OR CAST(b.end_date AS DATE) >= CURRENT_DATE)
       )`;

  const result = await conn.query(`
    SELECT c.id, c.name, COALESCE(c.color, '#9E9B96') AS color
    FROM categories c
    WHERE 1=1 ${excludeClause}
    ORDER BY c.name
  `);
  return result.toArray().map((r) => r.toJSON() as AvailableCategory);
}

export async function insertBudget(data: {
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  rollover: boolean;
  start_date: string;
  end_date: string | null;
}): Promise<string> {
  const conn = await getConnection();
  const id = `bud_${Date.now().toString(36)}`;
  const endDate = data.end_date ? `'${esc(data.end_date)}'` : 'NULL';
  await conn.query(`
    INSERT INTO budgets (id, category_id, amount, period, rollover, start_date, end_date, created_at)
    VALUES (
      '${esc(id)}',
      '${esc(data.category_id)}',
      ${data.amount},
      '${esc(data.period)}',
      ${data.rollover},
      '${esc(data.start_date)}',
      ${endDate},
      NOW()
    )
  `);
  persistBudgets().catch((e) => console.error('CSV persist failed:', e));
  return id;
}

export async function updateBudget(
  id: string,
  patch: Partial<{
    amount: number;
    period: BudgetPeriod;
    rollover: boolean;
    start_date: string;
    end_date: string | null;
  }>,
): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];
  if (patch.amount != null) clauses.push(`amount = ${patch.amount}`);
  if (patch.period != null) clauses.push(`period = '${esc(patch.period)}'`);
  if (patch.rollover != null) clauses.push(`rollover = ${patch.rollover}`);
  if (patch.start_date != null) clauses.push(`start_date = '${esc(patch.start_date)}'`);
  if ('end_date' in patch) {
    clauses.push(patch.end_date ? `end_date = '${esc(patch.end_date)}'` : `end_date = NULL`);
  }
  if (clauses.length === 0) return;
  await conn.query(`UPDATE budgets SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistBudgets().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteBudget(id: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`DELETE FROM budgets WHERE id = '${esc(id)}'`);
  persistBudgets().catch((e) => console.error('CSV persist failed:', e));
}
