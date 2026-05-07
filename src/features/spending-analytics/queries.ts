import { getConnection } from '../../shared/db/client';
import type { PeriodPoint, MerchantSpend, MerchantDetail, SpendingSummary, SpendingPeriod } from './types';

// Exclude transfers and user-excluded transactions from all analytics
const ANALYTICS_FILTER = `
  t.is_transfer = false
  AND (t.exclude_from_analytics = false OR t.exclude_from_analytics IS NULL)
  AND t.pending = false
`;

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

// Format label per period granularity
// Monthly → "Jan 2025", Yearly → "2025"
function periodSelect(period: SpendingPeriod): string {
  if (period === 'yearly') {
    return `CAST(YEAR(t.date) AS VARCHAR) AS period_label`;
  }
  return `STRFTIME(t.date, '%b %Y') AS period_label`;
}

function periodOrderBy(period: SpendingPeriod): string {
  if (period === 'yearly') {
    return `YEAR(t.date)`;
  }
  return `YEAR(t.date), MONTH(t.date)`;
}

export async function queryPeriodPoints(period: SpendingPeriod): Promise<PeriodPoint[]> {
  const conn = await getConnection();

  const sql = `
    SELECT
      ${periodSelect(period)},
      SUM(CASE WHEN CAST(t.amount AS DOUBLE) < 0 THEN ABS(CAST(t.amount AS DOUBLE)) ELSE 0 END) AS expenses,
      SUM(CASE WHEN CAST(t.amount AS DOUBLE) > 0 THEN CAST(t.amount AS DOUBLE)       ELSE 0 END) AS income
    FROM transactions t
    WHERE ${ANALYTICS_FILTER}
    GROUP BY ${periodOrderBy(period)}, period_label
    ORDER BY ${periodOrderBy(period)}
  `;

  const result = await conn.query(sql);
  return result.toArray().map((r) => {
    const row = r.toJSON();
    const expenses = Number(row.expenses ?? 0);
    const income = Number(row.income ?? 0);
    return {
      label: String(row.period_label),
      expenses,
      income,
      net: income - expenses,
    };
  });
}

export async function queryMerchantSpending(period: SpendingPeriod, limit = 15): Promise<MerchantSpend[]> {
  const conn = await getConnection();

  const periodFilter = period === 'yearly'
    ? `AND YEAR(t.date) = YEAR(CURRENT_DATE)`
    : `AND YEAR(t.date) = YEAR(CURRENT_DATE) AND MONTH(t.date) <= MONTH(CURRENT_DATE)`;

  const sql = `
    SELECT
      t.merchant,
      SUM(ABS(CAST(t.amount AS DOUBLE))) AS total,
      COUNT(*)                           AS count
    FROM transactions t
    WHERE ${ANALYTICS_FILTER}
      AND CAST(t.amount AS DOUBLE) < 0
      ${periodFilter}
    GROUP BY t.merchant
    ORDER BY total DESC
    LIMIT ${limit}
  `;

  const result = await conn.query(sql);
  return result.toArray().map((r) => {
    const row = r.toJSON();
    return {
      merchant: String(row.merchant),
      total: Number(row.total ?? 0),
      count: Number(row.count ?? 0),
    };
  });
}

export async function queryMerchantDetail(merchant: string): Promise<MerchantDetail> {
  const conn = await getConnection();
  const m = esc(merchant);

  const [summaryResult, trendResult] = await Promise.all([
    conn.query(`
      SELECT
        COUNT(*)                           AS count,
        SUM(ABS(CAST(t.amount AS DOUBLE))) AS total,
        AVG(ABS(CAST(t.amount AS DOUBLE))) AS average
      FROM transactions t
      WHERE ${ANALYTICS_FILTER}
        AND CAST(t.amount AS DOUBLE) < 0
        AND t.merchant = '${m}'
    `),
    conn.query(`
      SELECT
        STRFTIME(t.date, '%b %Y')            AS period_label,
        YEAR(t.date)                          AS yr,
        MONTH(t.date)                         AS mo,
        SUM(ABS(CAST(t.amount AS DOUBLE)))    AS total
      FROM transactions t
      WHERE ${ANALYTICS_FILTER}
        AND CAST(t.amount AS DOUBLE) < 0
        AND t.merchant = '${m}'
      GROUP BY yr, mo, period_label
      ORDER BY yr, mo
    `),
  ]);

  const summary = summaryResult.toArray()[0]?.toJSON() ?? {};
  const trend = trendResult.toArray().map((r) => {
    const row = r.toJSON();
    return { label: String(row.period_label), value: Number(row.total ?? 0) };
  });

  return {
    merchant,
    total: Number(summary.total ?? 0),
    count: Number(summary.count ?? 0),
    average: Number(summary.average ?? 0),
    trend,
  };
}

export async function querySpendingSummary(): Promise<SpendingSummary> {
  const conn = await getConnection();

  const sql = `
    SELECT
      -- Average monthly expense over all months with data
      AVG(monthly_expense) AS avg_monthly_expense,
      -- Total income and expense for savings rate
      SUM(monthly_expense) AS total_expense,
      SUM(monthly_income)  AS total_income
    FROM (
      SELECT
        YEAR(t.date)  AS yr,
        MONTH(t.date) AS mo,
        SUM(CASE WHEN CAST(t.amount AS DOUBLE) < 0 THEN ABS(CAST(t.amount AS DOUBLE)) ELSE 0 END) AS monthly_expense,
        SUM(CASE WHEN CAST(t.amount AS DOUBLE) > 0 THEN CAST(t.amount AS DOUBLE)       ELSE 0 END) AS monthly_income
      FROM transactions t
      WHERE ${ANALYTICS_FILTER}
      GROUP BY yr, mo
    ) monthly
  `;

  const result = await conn.query(sql);
  const row = result.toArray()[0]?.toJSON() ?? {};

  const totalIncome = Number(row.total_income ?? 0);
  const totalExpense = Number(row.total_expense ?? 0);
  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netCashFlow / totalIncome) * 100) : 0;

  return {
    avgMonthlyExpense: Number(row.avg_monthly_expense ?? 0),
    savingsRate,
    netCashFlow,
  };
}
