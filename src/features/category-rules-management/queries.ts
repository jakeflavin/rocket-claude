import { getConnection } from '../../shared/db/client';
import { persistRules } from '../../shared/db/persist';
import type { Rule, RulePatch } from './types';

function esc(v: string): string {
  return v.replace(/'/g, "''");
}

export async function queryRules(): Promise<Rule[]> {
  const conn = await getConnection();
  const result = await conn.query(`
    SELECT id, CAST(priority AS INTEGER) AS priority, field, operator, value,
           category_id, CAST(is_default AS BOOLEAN) AS is_default,
           enabled, CAST(created_at AS VARCHAR) AS created_at
    FROM rules
    ORDER BY priority ASC
  `);
  return result.toArray().map((r) => r.toJSON() as Rule);
}

export async function createRule(
  field: Rule['field'],
  operator: Rule['operator'],
  value: string,
  categoryId: string,
): Promise<string> {
  const conn = await getConnection();
  const id = `rule_${Date.now().toString(36)}`;
  const maxResult = await conn.query(`SELECT COALESCE(MAX(CAST(priority AS INTEGER)), 0) AS mx FROM rules`);
  const nextPriority = Number(maxResult.toArray()[0].toJSON().mx) + 1;
  await conn.query(`
    INSERT INTO rules (id, priority, field, operator, value, category_id, is_default, enabled, created_at)
    VALUES ('${esc(id)}', ${nextPriority}, '${esc(field)}', '${esc(operator)}', '${esc(value)}',
            '${esc(categoryId)}', false, true, NOW())
  `);
  persistRules().catch((e) => console.error('CSV persist failed:', e));
  return id;
}

export async function updateRule(id: string, patch: RulePatch): Promise<void> {
  const conn = await getConnection();
  const clauses: string[] = [];
  if ('field' in patch && patch.field) clauses.push(`field = '${esc(patch.field)}'`);
  if ('operator' in patch && patch.operator) clauses.push(`operator = '${esc(patch.operator)}'`);
  if ('value' in patch && patch.value != null) clauses.push(`value = '${esc(patch.value)}'`);
  if ('category_id' in patch && patch.category_id) clauses.push(`category_id = '${esc(patch.category_id)}'`);
  if ('enabled' in patch && patch.enabled != null) clauses.push(`enabled = ${patch.enabled}`);
  if (clauses.length === 0) return;
  await conn.query(`UPDATE rules SET ${clauses.join(', ')} WHERE id = '${esc(id)}'`);
  persistRules().catch((e) => console.error('CSV persist failed:', e));
}

export async function deleteRule(id: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(`DELETE FROM rules WHERE id = '${esc(id)}'`);
  persistRules().catch((e) => console.error('CSV persist failed:', e));
}

export async function reorderRules(orderedIds: string[]): Promise<void> {
  const conn = await getConnection();
  for (let i = 0; i < orderedIds.length; i++) {
    await conn.query(
      `UPDATE rules SET priority = ${i + 1} WHERE id = '${esc(orderedIds[i])}'`,
    );
  }
  persistRules().catch((e) => console.error('CSV persist failed:', e));
}
