import { getConnection } from '../../shared/db/client';
import { persistTransactions } from '../../shared/db/persist';
import type { Transaction, TransactionFilters, TransactionSort, FilterOption, PageSize } from './types';

const SORT_COLUMNS: Record<string, string> = {
  date: 't.date',
  merchant: 't.merchant',
  category: 'c.name',
  account: 'a.name',
  amount: 'CAST(t.amount AS DOUBLE)',
};

const JOINS = `
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN accounts a ON t.account_id = a.id
`;

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

function buildWhere(f: TransactionFilters): string {
  const conds: string[] = [];

  if (f.search.trim()) {
    const s = esc(f.search.trim());
    conds.push(`(t.merchant ILIKE '%${s}%' OR t.description ILIKE '%${s}%')`);
  }
  if (f.accountId) conds.push(`t.account_id = '${esc(f.accountId)}'`);
  if (f.categoryId) conds.push(`t.category_id = '${esc(f.categoryId)}'`);
  if (f.dateFrom) conds.push(`t.date >= '${esc(f.dateFrom)}'`);
  if (f.dateTo) conds.push(`t.date <= '${esc(f.dateTo)}'`);
  if (f.type === 'income') conds.push(`CAST(t.amount AS DOUBLE) > 0`);
  if (f.type === 'expense') conds.push(`CAST(t.amount AS DOUBLE) < 0`);
  if (f.status === 'pending') conds.push(`t.pending = true`);
  if (f.status === 'cleared') conds.push(`t.pending = false`);

  return conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
}

export type TransactionsResult = {
  transactions: Transaction[];
  total: number;
};

export async function queryTransactions(
  filters: TransactionFilters,
  sort: TransactionSort,
  page: number,
  pageSize: PageSize,
): Promise<TransactionsResult> {
  const conn = await getConnection();
  const where = buildWhere(filters);
  const sortCol = SORT_COLUMNS[sort.key] ?? 't.date';
  const offset = (page - 1) * pageSize;

  const [dataResult, countResult] = await Promise.all([
    conn.query(`
      SELECT
        t.id,
        CAST(t.date AS VARCHAR)            AS date,
        t.merchant,
        COALESCE(c.name, 'Uncategorized')  AS category,
        t.category_id,
        COALESCE(a.name, 'Unknown')         AS account,
        CAST(t.amount AS DOUBLE)            AS amount,
        t.currency,
        t.pending,
        t.description,
        t.transaction_type,
        CAST(t.authorized_date AS VARCHAR)  AS authorized_date,
        t.is_transfer,
        t.transfer_group,
        t.notes,
        t.tags,
        t.location,
        t.external_id,
        t.created_at,
        t.is_recurring,
        t.exclude_from_analytics
      ${JOINS}
      ${where}
      ORDER BY ${sortCol} ${sort.dir.toUpperCase()}, t.id
      LIMIT ${pageSize} OFFSET ${offset}
    `),
    conn.query(`
      SELECT CAST(COUNT(*) AS INTEGER) AS total
      ${JOINS}
      ${where}
    `),
  ]);

  return {
    transactions: dataResult.toArray().map((r) => r.toJSON() as Transaction),
    total: Number(countResult.toArray()[0].toJSON().total),
  };
}

export type TransactionPatch = {
  merchant?: string;
  description?: string | null;
  category_id?: string | null;
  notes?: string | null;
  tags?: string | null;
  is_recurring?: boolean;
  exclude_from_analytics?: boolean;
};

function sqlVal(v: string | null | undefined): string {
  return v == null ? 'NULL' : `'${esc(v)}'`;
}

export async function updateTransaction(id: string, patch: TransactionPatch): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];

  if ('merchant' in patch) clauses.push(`merchant = '${esc(patch.merchant ?? '')}'`);
  if ('description' in patch) clauses.push(`description = ${sqlVal(patch.description)}`);
  if ('category_id' in patch) clauses.push(`category_id = ${sqlVal(patch.category_id)}`);
  if ('notes' in patch) clauses.push(`notes = ${sqlVal(patch.notes)}`);
  if ('tags' in patch) clauses.push(`tags = ${sqlVal(patch.tags)}`);
  if ('is_recurring' in patch) clauses.push(`is_recurring = ${patch.is_recurring}`);
  if ('exclude_from_analytics' in patch)
    clauses.push(`exclude_from_analytics = ${patch.exclude_from_analytics}`);

  if (clauses.length === 0) return;
  await conn.query(`UPDATE transactions SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistTransactions().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteTransaction(id: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`DELETE FROM transactions WHERE id = '${esc(id)}'`);
  persistTransactions().catch((e) => console.error('CSV persist failed:', e));
}

export type FilterOptionsResult = {
  accounts: FilterOption[];
  categories: FilterOption[];
};

export async function queryFilterOptions(): Promise<FilterOptionsResult> {
  const conn = await getConnection();
  const [accResult, catResult] = await Promise.all([
    conn.query(
      `SELECT id, name FROM accounts WHERE NOT is_hidden AND NOT is_closed ORDER BY name`,
    ),
    conn.query(`SELECT id, name FROM categories ORDER BY name`),
  ]);
  return {
    accounts: accResult.toArray().map((r) => r.toJSON() as FilterOption),
    categories: catResult.toArray().map((r) => r.toJSON() as FilterOption),
  };
}
