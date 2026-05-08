import { getConnection } from '../../shared/db/client';
import { persistSettings } from '../../shared/db/persist';
import type { AppearanceMode, Settings } from './types';

export async function querySettings(): Promise<Settings> {
  const conn = await getConnection();
  const result = await conn.query(`SELECT key, value FROM settings`);
  const rows = result.toArray().map((r) => r.toJSON() as { key: string; value: string });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    appearance: (map.appearance ?? 'system') as AppearanceMode,
  };
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(
    `UPDATE settings SET value = '${value.replace(/'/g, "''")}' WHERE key = '${key.replace(/'/g, "''")}'`,
  );
  persistSettings().catch((e) => console.error('Settings persist failed:', e));
}
