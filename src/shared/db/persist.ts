import { getConnection } from './client';

const TRANSACTIONS_COLS = [
  'id', 'account_id', 'external_id', 'amount', 'currency', 'date', 'authorized_date',
  'merchant', 'description', 'category_id', 'subcategory_id', 'transaction_type',
  'pending', 'is_transfer', 'transfer_group', 'notes', 'tags', 'location',
  'created_at', 'updated_at', 'is_recurring', 'exclude_from_analytics',
] as const;

const ACCOUNTS_COLS = [
  'id', 'name', 'institution', 'type', 'subtype', 'currency', 'balance',
  'available_balance', 'credit_limit', 'is_hidden', 'is_closed',
  'last_synced_at', 'created_at', 'updated_at',
] as const;

const ACCOUNT_BALANCE_HISTORY_COLS = ['id', 'account_id', 'date', 'balance'] as const;

const RECURRING_TRANSACTIONS_COLS = [
  'id', 'merchant', 'amount', 'frequency', 'next_due_date', 'category_id',
  'account_id', 'confidence', 'active', 'created_at',
] as const;

const CATEGORIES_COLS = ['id', 'name', 'parent_id', 'icon', 'color', 'system', 'created_at'] as const;
const TAGS_COLS = ['id', 'name', 'color'] as const;
const TRANSACTION_TAGS_COLS = ['transaction_id', 'tag_id'] as const;
const RULES_COLS = ['id', 'priority', 'field', 'operator', 'value', 'category_id', 'apply_tag', 'enabled', 'created_at'] as const;

function csvEscape(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function persistTransactions(): Promise<void> {
  const conn = await getConnection();
  const cols = TRANSACTIONS_COLS;
  const result = await conn.query(
    `SELECT ${cols.map((c) => `CAST(${c} AS VARCHAR) AS "${c}"`).join(', ')}
     FROM transactions ORDER BY date DESC, id`,
  );
  const rows = result.toArray().map((r) => r.toJSON() as Record<string, unknown>);
  const csv = [
    cols.join(','),
    ...rows.map((row) => cols.map((c) => csvEscape(row[c])).join(',')),
  ].join('\n') + '\n';

  await fetch('/api/csv/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csv,
  });
}

async function persistTable(
  table: string,
  cols: readonly string[],
  orderBy: string,
): Promise<void> {
  const conn = await getConnection();
  const result = await conn.query(
    `SELECT ${cols.map((c) => `CAST(${c} AS VARCHAR) AS "${c}"`).join(', ')}
     FROM ${table} ORDER BY ${orderBy}`,
  );
  const rows = result.toArray().map((r) => r.toJSON() as Record<string, unknown>);
  const csv = [
    cols.join(','),
    ...rows.map((row) => cols.map((c) => csvEscape(row[c])).join(',')),
  ].join('\n') + '\n';
  await fetch(`/api/csv/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csv,
  });
}

export async function persistAccounts(): Promise<void> {
  return persistTable('accounts', ACCOUNTS_COLS, 'institution, name');
}

export async function persistAccountBalanceHistory(): Promise<void> {
  return persistTable('account_balance_history', ACCOUNT_BALANCE_HISTORY_COLS, 'account_id, date DESC');
}

export async function persistRecurringTransactions(): Promise<void> {
  return persistTable('recurring_transactions', RECURRING_TRANSACTIONS_COLS, 'merchant');
}

export async function persistCategories(): Promise<void> {
  return persistTable('categories', CATEGORIES_COLS, 'created_at');
}

export async function persistTags(): Promise<void> {
  return persistTable('tags', TAGS_COLS, 'name');
}

export async function persistTransactionTags(): Promise<void> {
  return persistTable('transaction_tags', TRANSACTION_TAGS_COLS, 'transaction_id, tag_id');
}

export async function persistRules(): Promise<void> {
  return persistTable('rules', RULES_COLS, 'priority');
}

const BUDGETS_COLS = ['id', 'category_id', 'amount', 'period', 'rollover', 'start_date', 'end_date', 'created_at'] as const;

export async function persistBudgets(): Promise<void> {
  return persistTable('budgets', BUDGETS_COLS, 'created_at');
}

const GOALS_COLS = ['id', 'name', 'target_amount', 'current_amount', 'target_date', 'linked_account_id', 'created_at'] as const;

export async function persistGoals(): Promise<void> {
  return persistTable('goals', GOALS_COLS, 'target_date');
}
