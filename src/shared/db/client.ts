import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: duckdb_wasm, mainWorker: mvp_worker },
  eh: { mainModule: duckdb_wasm_eh, mainWorker: eh_worker },
};

const CSV_TABLES = [
  'accounts',
  'transactions',
  'categories',
  'rules',
  'budgets',
  'recurring_transactions',
  'net_worth_snapshots',
  'goals',
  'tags',
  'transaction_tags',
  'institutions',
  'imports',
  'account_balance_history',
  'settings',
] as const;

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function csvToRows(text: string): unknown[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitCSVLine(line);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = vals[i] ?? '';
      if (v === '') row[h] = null;
      else if (v === 'true') row[h] = true;
      else if (v === 'false') row[h] = false;
      else if (!isNaN(Number(v))) row[h] = Number(v);
      else row[h] = v;
    });
    return row;
  });
}

type DBHandle = { db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection };

async function initDB(): Promise<DBHandle> {
  const bundle = await duckdb.selectBundle(BUNDLES);
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule);
  const conn = await db.connect();

  for (const table of CSV_TABLES) {
    const resp = await fetch(`/data/${table}.csv`);
    if (!resp.ok) continue;
    const text = await resp.text();
    const rows = csvToRows(text);
    if (rows.length === 0) continue;
    await db.registerFileText(`${table}.json`, JSON.stringify(rows));
    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${table} AS
       SELECT * FROM read_json_auto('${table}.json')`,
    );
  }

  // Add editable columns not present in the source CSV
  await conn.query(
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS exclude_from_analytics BOOLEAN DEFAULT false`,
  );
  await conn.query(
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false`,
  );

  // Ensure is_default column exists on rules (added after initial release)
  await conn.query(`ALTER TABLE rules ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false`);

  // Ensure settings table and default appearance row exist
  await conn.query(`CREATE TABLE IF NOT EXISTS settings (key VARCHAR, value VARCHAR)`);
  await conn.query(`
    INSERT INTO settings (key, value)
    SELECT 'appearance', 'system'
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'appearance')
  `);

  return { db, conn };
}

let handlePromise: Promise<DBHandle> | null = null;

function getHandle(): Promise<DBHandle> {
  handlePromise ??= initDB();
  return handlePromise;
}

export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  return (await getHandle()).conn;
}

export async function getDB(): Promise<duckdb.AsyncDuckDB> {
  return (await getHandle()).db;
}
