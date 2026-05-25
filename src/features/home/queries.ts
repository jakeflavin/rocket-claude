import { getConnection } from '../../shared/db/client';
import type {
  DashboardSummary,
  DashboardCashFlowPoint,
  DashboardAccountRow,
  DashboardBudgetRow,
  DashboardTransaction,
  DashboardBill,
} from './types';

const ANALYTICS_FILTER = `
  t.is_transfer = false
  AND (t.exclude_from_analytics = false OR t.exclude_from_analytics IS NULL)
  AND t.pending = false
`;

export async function queryDashboardSummary(): Promise<DashboardSummary> {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT
      acct.total_assets,
      acct.total_liabilities,
      COALESCE(cash.income, 0) AS month_income,
      COALESCE(cash.expenses, 0) AS month_expenses
    FROM (
      SELECT
        SUM(CASE WHEN CAST(a.balance AS DOUBLE) > 0 THEN CAST(a.balance AS DOUBLE) ELSE 0 END) AS total_assets,
        SUM(CASE WHEN CAST(a.balance AS DOUBLE) < 0 THEN ABS(CAST(a.balance AS DOUBLE)) ELSE 0 END) AS total_liabilities
      FROM accounts a
      WHERE a.is_hidden = false AND a.is_closed = false
    ) acct,
    (
      SELECT
        SUM(CASE WHEN CAST(t.amount AS DOUBLE) > 0 THEN CAST(t.amount AS DOUBLE) ELSE 0 END) AS income,
        SUM(CASE WHEN CAST(t.amount AS DOUBLE) < 0 THEN ABS(CAST(t.amount AS DOUBLE)) ELSE 0 END) AS expenses
      FROM transactions t
      WHERE ${ANALYTICS_FILTER}
        AND CAST(t.date AS DATE) >= DATE_TRUNC('month', CURRENT_DATE)
        AND CAST(t.date AS DATE) <= CURRENT_DATE
    ) cash
  `);

  const row = result.toArray()[0]?.toJSON() as Record<string, unknown>;
  const totalAssets = Number(row?.total_assets ?? 0);
  const totalLiabilities = Number(row?.total_liabilities ?? 0);
  const monthIncome = Number(row?.month_income ?? 0);
  const monthExpenses = Number(row?.month_expenses ?? 0);

  return {
    netWorth: totalAssets - totalLiabilities,
    totalAssets,
    totalLiabilities,
    monthIncome,
    monthExpenses,
    monthNet: monthIncome - monthExpenses,
  };
}

export async function queryDashboardCashFlow(): Promise<DashboardCashFlowPoint[]> {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT
      STRFTIME(t.date, '%b %Y') AS label,
      YEAR(CAST(t.date AS DATE)) AS yr,
      MONTH(CAST(t.date AS DATE)) AS mo,
      SUM(CASE WHEN CAST(t.amount AS DOUBLE) > 0 THEN CAST(t.amount AS DOUBLE) ELSE 0 END) AS income,
      SUM(CASE WHEN CAST(t.amount AS DOUBLE) < 0 THEN ABS(CAST(t.amount AS DOUBLE)) ELSE 0 END) AS expenses
    FROM transactions t
    WHERE ${ANALYTICS_FILTER}
      AND CAST(t.date AS DATE) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL 5 MONTH
    GROUP BY YEAR(CAST(t.date AS DATE)), MONTH(CAST(t.date AS DATE)), label
    ORDER BY yr, mo
  `);

  return result.toArray().map((r) => {
    const row = r.toJSON() as Record<string, unknown>;
    const income = Number(row.income ?? 0);
    const expenses = Number(row.expenses ?? 0);
    return {
      label: String(row.label),
      income,
      expenses,
      net: income - expenses,
    };
  });
}

export async function queryDashboardAccounts(): Promise<DashboardAccountRow[]> {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT
      a.id AS account_id,
      a.name,
      a.institution,
      a.type,
      CAST(a.balance AS DOUBLE) AS balance,
      CAST(h.date AS VARCHAR) AS hist_date,
      CAST(h.balance AS DOUBLE) AS hist_balance
    FROM accounts a
    LEFT JOIN account_balance_history h ON h.account_id = a.id
    WHERE a.is_hidden = false AND a.is_closed = false
    ORDER BY a.institution, a.name, CAST(h.date AS DATE) ASC
  `);

  const rowsRaw = result.toArray().map((r) => r.toJSON() as Record<string, unknown>);

  // Group by account_id, collect last 7 balance history points
  const map = new Map<string, DashboardAccountRow>();
  const histMap = new Map<string, { date: string; balance: number }[]>();

  for (const r of rowsRaw) {
    const id = String(r.account_id);
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: String(r.name),
        institution: String(r.institution),
        type: String(r.type),
        balance: Number(r.balance ?? 0),
        sparklineData: [],
      });
      histMap.set(id, []);
    }
    if (r.hist_date != null && r.hist_balance != null) {
      histMap.get(id)!.push({ date: String(r.hist_date), balance: Number(r.hist_balance) });
    }
  }

  for (const [id, acc] of map) {
    const hist = histMap.get(id) ?? [];
    acc.sparklineData = hist.slice(-7).map((h) => h.balance);
  }

  return Array.from(map.values());
}

export async function queryDashboardBudgets(): Promise<DashboardBudgetRow[]> {
  const conn = await getConnection();

  const result = await conn.query(`
    WITH budget_stats AS (
      SELECT
        b.id,
        COALESCE(c.name, 'Uncategorized') AS category_name,
        COALESCE(c.color, '#9E9B96') AS category_color,
        CAST(b.amount AS DOUBLE) AS amount,
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
              WHEN 'weekly'  THEN CURRENT_DATE - CAST((DAYOFWEEK(CURRENT_DATE) - 1) AS INTEGER)
              WHEN 'annual'  THEN DATE_TRUNC('year', CURRENT_DATE)
            END
            AND CAST(t.date AS DATE) <= CURRENT_DATE
        ), 0) AS spent
      FROM budgets b
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE (b.end_date IS NULL OR TRIM(CAST(b.end_date AS VARCHAR)) = '' OR CAST(b.end_date AS DATE) >= CURRENT_DATE)
    )
    SELECT * FROM budget_stats
    ORDER BY CASE WHEN amount > 0 THEN spent / amount ELSE 0 END DESC
    LIMIT 5
  `);

  return result.toArray().map((r) => {
    const row = r.toJSON() as Record<string, unknown>;
    const amount = Number(row.amount ?? 0);
    const spent = Number(row.spent ?? 0);
    return {
      id: String(row.id),
      category_name: String(row.category_name),
      category_color: String(row.category_color),
      amount,
      spent,
      utilization: amount > 0 ? spent / amount : 0,
    };
  });
}

export async function queryDashboardRecentTransactions(): Promise<DashboardTransaction[]> {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT
      t.id,
      CAST(t.date AS VARCHAR) AS date,
      t.merchant,
      CAST(t.amount AS DOUBLE) AS amount,
      COALESCE(c.name, 'Uncategorized') AS category_name
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE ${ANALYTICS_FILTER}
    ORDER BY CAST(t.date AS DATE) DESC, t.id
    LIMIT 10
  `);

  return result.toArray().map((r) => {
    const row = r.toJSON() as Record<string, unknown>;
    return {
      id: String(row.id),
      date: String(row.date),
      merchant: String(row.merchant),
      amount: Number(row.amount ?? 0),
      category_name: String(row.category_name),
    };
  });
}

export async function queryDashboardUpcomingBills(): Promise<DashboardBill[]> {
  const conn = await getConnection();

  const result = await conn.query(`
    SELECT
      r.id,
      r.merchant,
      CAST(r.amount AS DOUBLE) AS amount,
      r.frequency,
      CAST(r.next_due_date AS VARCHAR) AS next_due_date,
      COALESCE(c.name, 'Uncategorized') AS category_name
    FROM recurring_transactions r
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.amount < 0
      AND r.active = true
      AND CAST(r.next_due_date AS DATE) >= CURRENT_DATE
      AND CAST(r.next_due_date AS DATE) <= CURRENT_DATE + INTERVAL 30 DAY
    ORDER BY CAST(r.next_due_date AS DATE)
  `);

  return result.toArray().map((r) => {
    const row = r.toJSON() as Record<string, unknown>;
    return {
      id: String(row.id),
      merchant: String(row.merchant),
      amount: Number(row.amount ?? 0),
      frequency: String(row.frequency),
      next_due_date: String(row.next_due_date),
      category_name: String(row.category_name),
    };
  });
}
