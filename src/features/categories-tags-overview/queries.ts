import { getConnection } from '../../shared/db/client';
import {
  persistCategories,
  persistTags,
  persistTransactions,
  persistTransactionTags,
} from '../../shared/db/persist';
import type { Category, CategorySpending, SubcategorySpending, Tag, UncategorizedTransaction, SpendingPeriod } from './types';

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

function dateFilter(period: SpendingPeriod): string {
  if (period === 'month') return `t.date >= DATE_TRUNC('month', CURRENT_DATE)`;
  if (period === 'quarter') return `t.date >= DATE_TRUNC('quarter', CURRENT_DATE)`;
  return `t.date >= DATE_TRUNC('year', CURRENT_DATE)`;
}

export async function queryCategories(): Promise<Category[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT id, name, parent_id, icon, color, system,
           CAST(created_at AS VARCHAR) AS created_at
    FROM categories
    ORDER BY parent_id NULLS FIRST, name
  `);
  return result.toArray().map((r) => r.toJSON() as Category);
}

export async function queryCategorySpending(period: SpendingPeriod): Promise<CategorySpending[]> {
  const conn = await getConnection();
  const df = dateFilter(period);
  const result = await conn.query(`
    SELECT
      COALESCE(parent.id, c.id) AS category_id,
      COALESCE(parent.name, c.name) AS category_name,
      COALESCE(parent.color, c.color) AS color,
      ABS(SUM(CAST(t.amount AS DOUBLE))) AS total,
      CAST(COUNT(*) AS INTEGER) AS transaction_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN categories parent ON c.parent_id = parent.id
    WHERE t.amount < 0
      AND t.is_transfer = false
      AND ${df}
    GROUP BY COALESCE(parent.id, c.id), COALESCE(parent.name, c.name), COALESCE(parent.color, c.color)
    ORDER BY total DESC
  `);
  return result.toArray().map((r) => r.toJSON() as CategorySpending);
}

export async function querySubcategorySpending(
  parentId: string,
  period: SpendingPeriod,
): Promise<SubcategorySpending[]> {
  const conn = await getConnection();
  const df = dateFilter(period);
  const result = await conn.query(`
    SELECT
      c.id AS subcategory_id,
      c.name AS subcategory_name,
      c.parent_id,
      c.color,
      ABS(SUM(CAST(t.amount AS DOUBLE))) AS total,
      CAST(COUNT(*) AS INTEGER) AS transaction_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE c.parent_id = '${esc(parentId)}'
      AND t.amount < 0
      AND t.is_transfer = false
      AND ${df}
    GROUP BY c.id, c.name, c.parent_id, c.color
    ORDER BY total DESC
  `);
  return result.toArray().map((r) => r.toJSON() as SubcategorySpending);
}

export async function queryTags(): Promise<Tag[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT t.id, t.name, t.color,
           CAST(COUNT(tt.transaction_id) AS INTEGER) AS usage_count
    FROM tags t
    LEFT JOIN transaction_tags tt ON t.id = tt.tag_id
    GROUP BY t.id, t.name, t.color
    ORDER BY t.name
  `);
  return result.toArray().map((r) => r.toJSON() as Tag);
}

export async function queryUncategorizedTransactions(limit = 50): Promise<UncategorizedTransaction[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT id, merchant, CAST(amount AS DOUBLE) AS amount,
           CAST(date AS VARCHAR) AS date, account_id
    FROM transactions
    WHERE (category_id IS NULL OR TRIM(CAST(category_id AS VARCHAR)) = '')
    ORDER BY date DESC
    LIMIT ${limit}
  `);
  return result.toArray().map((r) => r.toJSON() as UncategorizedTransaction);
}

export async function queryUncategorizedCount(): Promise<number> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT CAST(COUNT(*) AS INTEGER) AS cnt FROM transactions
    WHERE (category_id IS NULL OR TRIM(CAST(category_id AS VARCHAR)) = '')
  `);
  return Number(result.toArray()[0].toJSON().cnt);
}

export async function createCategory(
  name: string,
  color: string,
  parentId: string | null,
  icon?: string,
): Promise<string> {
  const conn = await getConnection();
  const id = `cat_${Date.now().toString(36)}`;
  const parent = parentId ? `'${esc(parentId)}'` : 'NULL';
  const iconVal = icon ? `'${esc(icon)}'` : 'NULL';
  await conn.query(`
    INSERT INTO categories (id, name, parent_id, icon, color, system, created_at)
    VALUES ('${esc(id)}', '${esc(name)}', ${parent}, ${iconVal}, '${esc(color)}', false, NOW())
  `);
  persistCategories().catch((e) => console.error('CSV persist failed:', e));
  return id;
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; color: string; icon: string | null }>,
): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];
  if ('name' in patch && patch.name != null) clauses.push(`name = '${esc(patch.name)}'`);
  if ('color' in patch && patch.color != null) clauses.push(`color = '${esc(patch.color)}'`);
  if ('icon' in patch) {
    clauses.push(patch.icon == null ? `icon = NULL` : `icon = '${esc(patch.icon)}'`);
  }
  if (clauses.length === 0) return;
  await conn.query(`UPDATE categories SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistCategories().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteCategory(id: string): Promise<void> {
  const conn = await getConnection();
  // Promote subcategories to top-level
  await conn.query(`UPDATE categories SET parent_id = NULL WHERE parent_id = '${esc(id)}'`);
  // Clear category from transactions assigned directly to this category
  await conn.query(`UPDATE transactions SET category_id = NULL WHERE category_id = '${esc(id)}'`);
  await conn.query(`DELETE FROM categories WHERE id = '${esc(id)}'`);
  await Promise.all([persistCategories(), persistTransactions()]);
}

export async function createTag(name: string, color: string): Promise<string> {
  const conn = await getConnection();
  const id = `tag_${Date.now().toString(36)}`;
  await conn.query(`
    INSERT INTO tags (id, name, color)
    VALUES ('${esc(id)}', '${esc(name)}', '${esc(color)}')
  `);
  persistTags().catch((e) => console.error('CSV persist failed:', e));
  return id;
}

export async function updateTag(
  id: string,
  patch: Partial<{ name: string; color: string }>,
): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];
  if ('name' in patch && patch.name != null) clauses.push(`name = '${esc(patch.name)}'`);
  if ('color' in patch && patch.color != null) clauses.push(`color = '${esc(patch.color)}'`);
  if (clauses.length === 0) return;
  await conn.query(`UPDATE tags SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistTags().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteTag(id: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`DELETE FROM transaction_tags WHERE tag_id = '${esc(id)}'`);
  await conn.query(`DELETE FROM tags WHERE id = '${esc(id)}'`);
  await Promise.all([persistTags(), persistTransactionTags()]);
}

export async function recategorizeTransactions(txnIds: string[], categoryId: string): Promise<void> {
  const conn = await getConnection();
  const idList = txnIds.map((id) => `'${esc(id)}'`).join(',');
  await conn.query(
    `UPDATE transactions SET category_id = '${esc(categoryId)}', updated_at = NOW()
     WHERE id IN (${idList})`,
  );
  persistTransactions().catch((e) => console.error('CSV persist failed:', e));
}

export async function assignTagToTransaction(txnId: string, tagId: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`
    INSERT INTO transaction_tags (transaction_id, tag_id)
    VALUES ('${esc(txnId)}', '${esc(tagId)}')
    ON CONFLICT DO NOTHING
  `);
  persistTransactionTags().catch((e) => console.error('CSV persist failed:', e));
}

export async function removeTagFromTransaction(txnId: string, tagId: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`
    DELETE FROM transaction_tags
    WHERE transaction_id = '${esc(txnId)}' AND tag_id = '${esc(tagId)}'
  `);
  persistTransactionTags().catch((e) => console.error('CSV persist failed:', e));
}
