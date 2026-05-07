import { getConnection } from '../../shared/db/client';
import type {
  RecurringTransaction,
  RecurringFilters,
  RecurringSort,
  RecurringSummary,
} from './types';

function buildWhere(f: RecurringFilters): string {
  const conds: string[] = [];

  if (f.type === 'bill') conds.push('r.amount < 0');
  else if (f.type === 'income') conds.push('r.amount > 0');

  if (f.status === 'active') conds.push('r.active = true');
  else if (f.status === 'cancelled') conds.push('r.active = false');

  if (f.frequency !== 'all') conds.push(`r.frequency = '${f.frequency}'`);

  return conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
}

export async function queryRecurring(
  filters: RecurringFilters,
  sort: RecurringSort,
): Promise<RecurringTransaction[]> {
  const conn = await getConnection();
  const where = buildWhere(filters);

  const validSortKeys: Record<string, string> = {
    merchant: 'r.merchant',
    amount: 'r.amount',
    frequency: 'r.frequency',
    next_due_date: 'r.next_due_date',
    confidence: 'r.confidence',
    category_name: 'c.name',
    account_name: 'a.name',
  };
  const orderCol = validSortKeys[sort.key] ?? 'r.next_due_date';
  const orderDir = sort.dir === 'desc' ? 'DESC' : 'ASC';

  const sql = `
    SELECT
      r.id,
      r.merchant,
      r.amount,
      r.frequency,
      CAST(r.next_due_date AS VARCHAR) AS next_due_date,
      r.category_id,
      COALESCE(c.name, 'Uncategorized') AS category_name,
      COALESCE(c.color, '#9E9B96')      AS category_color,
      r.account_id,
      COALESCE(a.name, 'Unknown')       AS account_name,
      r.confidence,
      r.active,
      CAST(r.created_at AS VARCHAR)     AS created_at
    FROM recurring_transactions r
    LEFT JOIN categories c ON c.id = r.category_id
    LEFT JOIN accounts   a ON a.id = r.account_id
    ${where}
    ORDER BY ${orderCol} ${orderDir}
  `;

  const result = await conn.query(sql);
  return result.toArray().map((row) => row.toJSON() as RecurringTransaction);
}

export async function queryRecurringSummary(): Promise<RecurringSummary> {
  const conn = await getConnection();

  const sql = `
    SELECT
      -- Monthly-equivalent expense total (bills only, active)
      SUM(CASE
        WHEN r.amount < 0 AND r.active = true THEN
          CASE r.frequency
            WHEN 'monthly'   THEN ABS(r.amount)
            WHEN 'weekly'    THEN ABS(r.amount) * 52.0 / 12.0
            WHEN 'biweekly'  THEN ABS(r.amount) * 26.0 / 12.0
            WHEN 'annual'    THEN ABS(r.amount) / 12.0
            ELSE ABS(r.amount)
          END
        ELSE 0
      END) AS total_monthly_expense,

      -- Monthly-equivalent income total (active)
      SUM(CASE
        WHEN r.amount > 0 AND r.active = true THEN
          CASE r.frequency
            WHEN 'monthly'   THEN r.amount
            WHEN 'weekly'    THEN r.amount * 52.0 / 12.0
            WHEN 'biweekly'  THEN r.amount * 26.0 / 12.0
            WHEN 'annual'    THEN r.amount / 12.0
            ELSE r.amount
          END
        ELSE 0
      END) AS total_monthly_income,

      COUNT(CASE WHEN r.active = true  THEN 1 END) AS active_count,
      COUNT(CASE WHEN r.active = false THEN 1 END) AS cancelled_count,

      -- Due within the next 7 days (active only)
      COUNT(CASE
        WHEN r.active = true
         AND r.next_due_date >= CURRENT_DATE
         AND r.next_due_date <= CURRENT_DATE + INTERVAL 7 DAYS
        THEN 1
      END) AS due_this_week_count

    FROM recurring_transactions r
  `;

  const result = await conn.query(sql);
  const row = result.toArray()[0]?.toJSON() ?? {};

  return {
    totalMonthlyExpense: Number(row.total_monthly_expense ?? 0),
    totalMonthlyIncome: Number(row.total_monthly_income ?? 0),
    activeCount: Number(row.active_count ?? 0),
    cancelledCount: Number(row.cancelled_count ?? 0),
    dueThisWeekCount: Number(row.due_this_week_count ?? 0),
  };
}
