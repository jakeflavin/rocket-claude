# Coding Standards

## Core Principle

Every piece of code has one job. Components render. Hooks coordinate state and side effects. Queries talk to DuckDB. Utils compute. Nothing bleeds into anything else.

---

## The Layer Rule

All data flow follows this pipeline — no exceptions:

```
UI Component → Custom Hook → Query Function → DuckDB
```

**What this means in practice:**
- A component never imports `getConnection` or calls DuckDB directly
- A component never constructs a SQL string
- A hook never builds a SQL query — that belongs in a query function
- A query function never touches React state

**Example — correct:**
```tsx
// TransactionsPage.tsx (component)
const { transactions, total, loading, error } = useTransactions(filters, sort, page, pageSize);

// useTransactions.ts (hook)
queryTransactions(filters, sort, page, pageSize)
  .then(({ transactions, total }) => { /* set state */ })
  .catch((err) => { /* set error */ });

// queries.ts (query function)
export async function queryTransactions(
  filters: TransactionFilters,
  sort: TransactionSort,
  page: number,
  pageSize: PageSize,
): Promise<TransactionsResult> {
  const conn = await getConnection();
  // build SQL, execute, return typed data
}
```

**Example — wrong:**
```tsx
// TransactionsPage.tsx ❌ — component talking directly to DuckDB
import { getConnection } from '../../shared/db/client';
const conn = await getConnection();
const result = await conn.query(`SELECT * FROM transactions`);
```

```ts
// useTransactions.ts ❌ — hook building SQL strings
const where = `WHERE t.merchant ILIKE '%${search}%'`;
const conn = await getConnection();
conn.query(`SELECT ... FROM transactions ${where}`);
```

---

## Components

### Rules
- One component per file
- Max 150 lines — if approaching this, extract sub-components or move column/config definitions to a `columns.tsx` sibling file
- No business logic — only rendering and user interaction handling
- No direct DuckDB calls; no query construction
- No `async` functions inside components — delegate to hooks

### Structure (consistent order inside every component file)
```tsx
// 1. Imports
import { useState } from 'react';
import { DataTable } from '../../shared/components/DataTable';
import { useTransactions } from './useTransactions';

// 2. Types
type Props = {
  accountId: string;
};

// 3. Component
export function TransactionsPage({ accountId }: Props) {

  // 4. Hooks
  const { transactions, loading, error } = useTransactions(filters, sort, page, pageSize);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // 5. Derived state / computed values
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  // 6. Handlers
  function handleSort(key: string, dir: SortDir) {
    setSort({ key, dir });
    setPage(1);
  }

  // 7. Early returns (loading, error, empty)
  if (error) return <ErrorState message={error.message} />;

  // 8. Render
  return (
    <section>...</section>
  );
}
```

### Props
- Destructure props at the function signature
- Define a named `Props` type for every component (inline or separate)
- Never pass entire objects when only one field is needed — pass the field

```tsx
// Good
<MetricCard label="Total Spend" value={formatCurrency(total)} />

// Avoid
<MetricCard transaction={transaction} />
```

---

## Hooks

### Rules
- Prefix with `use`
- One responsibility per hook
- Query hooks return `{ data, loading, error }`
- Use a cancellation flag (`cancelled = true`) in `useEffect` cleanup to prevent race conditions on fast re-renders
- Debounce free-text inputs before including them in query dependencies

### Query hook pattern
```ts
// useTransactions.ts
import { useEffect, useState } from 'react';
import { queryTransactions } from './queries';
import type { Transaction, TransactionFilters, TransactionSort, PageSize } from './types';

type Result = {
  transactions: Transaction[];
  total: number;
  loading: boolean;
  error: Error | null;
};

export function useTransactions(
  filters: TransactionFilters,
  sort: TransactionSort,
  page: number,
  pageSize: PageSize,
): Result {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Debounce free-text search to avoid per-keystroke queries
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { accountId, categoryId, dateFrom, dateTo, type, status } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    queryTransactions(
      { search: debouncedSearch, accountId, categoryId, dateFrom, dateTo, type, status },
      sort,
      page,
      pageSize,
    )
      .then(({ transactions, total }) => {
        if (!cancelled) {
          setTransactions(transactions);
          setTotal(total);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedSearch, accountId, categoryId, dateFrom, dateTo, type, status, sort.key, sort.dir, page, pageSize]);

  return { transactions, total, loading, error };
}
```

### Mount-once hook pattern (non-reactive data like dropdown options)
```ts
// useFilterOptions.ts
export function useFilterOptions(): FilterOptions {
  const [accounts, setAccounts] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);

  useEffect(() => {
    queryFilterOptions()
      .then(({ accounts, categories }) => {
        setAccounts(accounts);
        setCategories(categories);
      })
      .catch(() => {
        // non-critical; dropdowns stay empty
      });
  }, []);

  return { accounts, categories };
}
```

---

## Queries

Query functions are the only layer that touches DuckDB. They are pure async functions — no React, no state, no hooks. Each function executes one logical operation and returns typed data.

### Rules
- Import `getConnection` from `shared/db/client`; never call `initDB` directly
- Build all SQL strings here — never in hooks or components
- Sanitize string interpolations with an `esc()` helper (replace `'` with `''`)
- Return plain typed objects — no DuckDB internals leak out
- Errors propagate naturally; hooks catch them

### Query file structure
```ts
// features/transactions/queries.ts
import { getConnection } from '../../shared/db/client';
import type { Transaction, TransactionFilters, TransactionSort, FilterOption } from './types';
import type { PageSize } from '../../shared/components/Pagination';

// Sanitize values interpolated into SQL strings
function esc(v: string): string {
  return v.replace(/'/g, "''");
}

// Build a reusable WHERE clause from filter state
function buildWhere(f: TransactionFilters): string {
  const conds: string[] = [];
  if (f.search.trim()) {
    const s = esc(f.search.trim());
    conds.push(`(t.merchant ILIKE '%${s}%' OR t.description ILIKE '%${s}%')`);
  }
  // ... additional conditions
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
  // ... run conn.query(), map results, return typed data
}

export type FilterOptionsResult = {
  accounts: FilterOption[];
  categories: FilterOption[];
};

export async function queryFilterOptions(): Promise<FilterOptionsResult> {
  const conn = await getConnection();
  // ... run queries, return typed data
}
```

### Mapping DuckDB results
DuckDB WASM returns `Table` objects. Always call `.toArray().map(r => r.toJSON())` and cast to the expected type. Never pass raw DuckDB objects to hooks or components.

```ts
// Good
const rows = result.toArray().map((r) => r.toJSON() as Transaction);

// Bad — leaks DuckDB types into hook/component layers
return result;
```

---

## Error Handling

- Query functions let errors propagate — no `try/catch` inside query files
- Hooks catch errors from query calls and surface them as `error` state
- Components display inline error messages from the `error` state
- Non-critical queries (e.g., dropdown options) can catch and silently fail when empty data is an acceptable fallback

```ts
// hook — catches and surfaces errors
queryTransactions(...)
  .then(({ transactions, total }) => {
    if (!cancelled) {
      setTransactions(transactions);
      setTotal(total);
      setLoading(false);
      setError(null);
    }
  })
  .catch((err) => {
    if (!cancelled) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  });

// non-critical hook — silent failure is acceptable
queryFilterOptions()
  .then(({ accounts, categories }) => { setAccounts(accounts); setCategories(categories); })
  .catch(() => { /* dropdowns stay empty */ });
```

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `TransactionsPage.tsx`, `DataTable.tsx` |
| Hooks | camelCase, `use` prefix | `useTransactions.ts`, `useFilterOptions.ts` |
| Query files | camelCase, `queries` suffix | `queries.ts` (one per feature) |
| Utils | camelCase | `formatters.ts`, `dates.ts` |
| Types files | `types.ts` (one per feature) | `features/transactions/types.ts` |
| Types/interfaces | PascalCase | `Transaction`, `TransactionFilters` |
| CSS variables | `--color-*`, `--shadow-*` | `--color-brand`, `--shadow-sm` |
| Event handlers | `handle` prefix | `handleSort`, `handlePageSizeChange` |
| Query functions | `query` prefix | `queryTransactions`, `queryFilterOptions` |

---

## Component Reuse

Reusable components are a must. Before starting any feature, determine whether a generic shared component exists, can be extended, or should be created.

### Where components live

| Location | Rule |
|---|---|
| `src/shared/components/` | Used by 2+ features, OR is a fundamental UI primitive with no feature-specific dependencies |
| `src/features/{name}/` | Used only within that feature, or depends on feature-specific types |

Examples:
- `DataTable<T>` → `shared/` — generic, works with any row type via generics
- `MetricCard` → `shared/` — pure display, no domain knowledge
- `Pagination` → `shared/` — used by any paginated feature
- `TransactionExpandedRow` → `features/transactions/` — knows about the `Transaction` type

### Generic over specific

Prefer a generic component with typed props over duplicating similar components across features.

```tsx
// Good — one generic table, column behavior defined per feature
<DataTable<Transaction>
  columns={COLUMNS}
  rows={transactions}
  getRowKey={(row) => row.id}
  renderExpanded={(row) => <TransactionExpandedRow row={row} />}
/>

// Bad — a separate table component per feature
<TransactionsTable transactions={transactions} />
<BudgetsTable budgets={budgets} />
```

### Composition over configuration

Shared components take typed props, not variant strings. Pass behavior in — don't bake it in.

```tsx
// Good — caller controls column behavior
const COLUMNS: ColumnDef<Transaction>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => formatDate(row.date) },
  { key: 'merchant', header: 'Merchant', sortable: true, render: (row) => row.merchant },
];

// Bad — variant prop leaks domain knowledge into shared component
<DataTable variant="transactions" data={transactions} />
```

### When to create a new shared component

Create a new component in `shared/components/` when any of the following is true:
- You are about to duplicate JSX structure for the second time across different features
- The component has no imports from feature-specific type files
- It represents a UI primitive that could appear on any page (e.g., `Badge`, `EmptyState`, `StatCard`, `Spinner`)

### When to extract within a feature

If a feature page file approaches 150 lines, look for extraction opportunities in this order:
1. **Column definitions** — move `const COLUMNS` to a `columns.tsx` sibling file if it's over ~40 lines
2. **Sub-components** — extract distinct UI sections (filter bar, expanded row) to sibling files
3. **Hooks** — if a component is calling multiple hooks with complex derived state, consider a wrapper hook

### Shared component props discipline

Keep shared component interfaces minimal and focused. Accept only what the component actually renders.

```tsx
// Good — minimal, focused props
type MetricCardProps = {
  label: string;
  value: number | string;
};

// Bad — passing the whole object when only two fields are used
type MetricCardProps = {
  transaction: Transaction;
};
```

### Shared type exports

Types that are used by both the shared component and the feature layer live in the shared component file and are re-exported from the feature's `types.ts` for convenience.

```ts
// shared/components/DataTable.tsx
export type SortDir = 'asc' | 'desc';

// features/transactions/types.ts — re-export for feature-level use
export type { SortDir } from '../../shared/components/DataTable';
```
