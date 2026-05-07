import { getConnection } from '../../shared/db/client';
import type { Account } from './types';

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

export async function queryAccounts(
  includeHidden = false,
  includeClosed = false,
): Promise<Account[]> {
  const conn = await getConnection();
  const conds: string[] = [];
  if (!includeHidden) conds.push('NOT is_hidden');
  if (!includeClosed) conds.push('NOT is_closed');
  const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
  const result = await conn.query(`
    SELECT
      id, name, institution, type, subtype, currency,
      CAST(balance AS DOUBLE) AS balance,
      CAST(available_balance AS DOUBLE) AS available_balance,
      CAST(credit_limit AS DOUBLE) AS credit_limit,
      is_hidden, is_closed, last_synced_at, created_at, updated_at
    FROM accounts
    ${where}
    ORDER BY institution, name
  `);
  return result.toArray().map((r) => r.toJSON() as Account);
}

export async function queryAccountById(id: string): Promise<Account | null> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT
      id, name, institution, type, subtype, currency,
      CAST(balance AS DOUBLE) AS balance,
      CAST(available_balance AS DOUBLE) AS available_balance,
      CAST(credit_limit AS DOUBLE) AS credit_limit,
      is_hidden, is_closed, last_synced_at, created_at, updated_at
    FROM accounts
    WHERE id = '${esc(id)}'
    LIMIT 1
  `);
  const rows = result.toArray();
  return rows.length > 0 ? (rows[0].toJSON() as Account) : null;
}

export async function queryAccountBalanceHistory(
  accountId: string,
  days = 30,
): Promise<{ date: string; balance: number }[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT
      CAST(date AS VARCHAR) AS date,
      CAST(balance AS DOUBLE) AS balance
    FROM account_balance_history
    WHERE account_id = '${esc(accountId)}'
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date ASC
  `);
  return result.toArray().map((r) => r.toJSON() as { date: string; balance: number });
}
