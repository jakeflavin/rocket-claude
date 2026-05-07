import { getConnection } from '../../shared/db/client';
import {
  persistAccounts,
  persistTransactions,
  persistAccountBalanceHistory,
  persistRecurringTransactions,
} from '../../shared/db/persist';
import { queryAccounts, queryAccountById } from '../account-overview/queries';
import type { AccountPatch, MergePreview } from './types';

export { queryAccounts };

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

function sqlVal(v: string | null | undefined): string {
  return v == null ? 'NULL' : `'${esc(v)}'`;
}

export async function queryTransactionCountsByAccount(): Promise<Record<string, number>> {
  const conn = await getConnection();
  const result = await conn.query(
    `SELECT account_id, CAST(COUNT(*) AS INTEGER) AS cnt FROM transactions GROUP BY account_id`,
  );
  const map: Record<string, number> = {};
  for (const row of result.toArray()) {
    const r = row.toJSON() as { account_id: string; cnt: number };
    map[r.account_id] = r.cnt;
  }
  return map;
}

export async function updateAccount(id: string, patch: AccountPatch): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];

  if ('name' in patch) clauses.push(`name = '${esc(patch.name ?? '')}'`);
  if ('institution' in patch) clauses.push(`institution = '${esc(patch.institution ?? '')}'`);
  if ('type' in patch) clauses.push(`type = ${sqlVal(patch.type)}`);
  if ('subtype' in patch) clauses.push(`subtype = ${sqlVal(patch.subtype)}`);
  if ('currency' in patch) clauses.push(`currency = '${esc(patch.currency ?? '')}'`);
  if ('balance' in patch) clauses.push(`balance = ${patch.balance ?? 0}`);
  if ('available_balance' in patch) {
    clauses.push(
      patch.available_balance == null
        ? `available_balance = NULL`
        : `available_balance = ${patch.available_balance}`,
    );
  }
  if ('credit_limit' in patch) {
    clauses.push(
      patch.credit_limit == null
        ? `credit_limit = NULL`
        : `credit_limit = ${patch.credit_limit}`,
    );
  }
  if ('is_hidden' in patch) clauses.push(`is_hidden = ${patch.is_hidden}`);
  clauses.push(`updated_at = NOW()`);

  await conn.query(`UPDATE accounts SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistAccounts().catch((e) => console.error('CSV persist failed:', e));
}

export async function queryMergePreview(
  primaryId: string,
  mergeIds: string[],
): Promise<MergePreview> {
  const conn = await getConnection();
  const allIds = [primaryId, ...mergeIds];
  const idList = allIds.map((id) => `'${esc(id)}'`).join(',');
  const mergeList = mergeIds.map((id) => `'${esc(id)}'`).join(',');

  const [primary, merging, txnResult, recResult, balResult] = await Promise.all([
    queryAccountById(primaryId),
    Promise.all(mergeIds.map((id) => queryAccountById(id))),
    conn.query(
      `SELECT CAST(COUNT(*) AS INTEGER) AS cnt FROM transactions WHERE account_id IN (${mergeList})`,
    ),
    conn.query(
      `SELECT CAST(COUNT(*) AS INTEGER) AS cnt FROM recurring_transactions WHERE account_id IN (${mergeList})`,
    ),
    conn.query(
      `SELECT SUM(CAST(balance AS DOUBLE)) AS total FROM accounts WHERE id IN (${idList})`,
    ),
  ]);

  if (!primary) throw new Error(`Primary account ${primaryId} not found`);

  return {
    primary,
    merging: merging.filter(Boolean) as Awaited<typeof merging>,
    transactionCount: Number(txnResult.toArray()[0].toJSON().cnt),
    recurringCount: Number(recResult.toArray()[0].toJSON().cnt),
    combinedBalance: Number(balResult.toArray()[0].toJSON().total),
  };
}

export async function executeMerge(primaryId: string, mergeIds: string[]): Promise<void> {
  const conn = await getConnection();
  const idList = mergeIds.map((id) => `'${esc(id)}'`).join(',');

  await conn.query(
    `UPDATE transactions SET account_id = '${esc(primaryId)}' WHERE account_id IN (${idList})`,
  );
  await conn.query(
    `UPDATE account_balance_history SET account_id = '${esc(primaryId)}' WHERE account_id IN (${idList})`,
  );
  await conn.query(
    `UPDATE recurring_transactions SET account_id = '${esc(primaryId)}' WHERE account_id IN (${idList})`,
  );

  const balResult = await conn.query(
    `SELECT SUM(CAST(balance AS DOUBLE)) AS total FROM accounts WHERE id IN ('${esc(primaryId)}', ${idList})`,
  );
  const combined = Number(balResult.toArray()[0].toJSON().total);
  await conn.query(
    `UPDATE accounts SET balance = ${combined}, updated_at = NOW() WHERE id = '${esc(primaryId)}'`,
  );
  await conn.query(
    `UPDATE accounts SET is_closed = true, updated_at = NOW() WHERE id IN (${idList})`,
  );

  await Promise.all([
    persistAccounts(),
    persistTransactions(),
    persistAccountBalanceHistory(),
    persistRecurringTransactions(),
  ]);
}
