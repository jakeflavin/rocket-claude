# Data Flow

## Pipeline

```
┌─────────────────────────────────────┐
│  Bank PDFs / Credit Card CSVs       │
│  (saved to /statements folder)      │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Claude Code Skill                  │
│  - Reads statements folder          │
│  - Normalizes & categorizes         │
│  - Deduplicates via SHA-256 id      │
│  - Writes / overwrites rows         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  data/transactions.csv              │
│  (single source of truth)           │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  rocket-claude (index.html)         │
│  - PapaParse reads CSV              │
│  - useTransactions hook filters     │
│  - Pages render from hook data      │
│  - User edits notes/review flag     │
│    → written back to CSV            │
└─────────────────────────────────────┘
```

## Key Constraints

- The UI is **read-only** except for two fields: `notes` and `needs_review`
- Re-importing the CSV via the Claude Code skill will **overwrite** any row that shares an `id` and update `updated_at`
- The app loads the CSV fresh on each page load — no service worker or local storage caching
- No backend, no server, no database — the CSV file is the only persistent store
- All filtering, grouping, and derived data is computed in the browser at runtime from the raw CSV rows
