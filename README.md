# rocket-claude

A Claude Code–powered personal finance dashboard. No build step. No compile.

React 18 + Tailwind CSS + Chart.js + PapaParse, all via CDN. Drop bank statements into `statements/`, run the import skill, open the dashboard.

---

## Requirements

| Tool | Purpose |
|------|---------|
| [Node.js](https://nodejs.org) | Runs `npx serve` to serve the dashboard over HTTP |
| [Claude Code](https://claude.ai/code) | Runs the `/rocket` import skill |
| Python 3 + `pdfplumber pypdf anthropic pandas` | Used by the import skill to parse PDFs and CSVs |
| `ANTHROPIC_API_KEY` env variable | AI categorization fallback in the import skill |

Install Python dependencies once:

```bash
pip install pdfplumber pypdf anthropic pandas
```

---

## Quick Start

### 1. Serve the dashboard

The app must be served over HTTP — opening `index.html` directly via `file://` will fail due to browser CORS restrictions.

```bash
npx serve .
```

Then open the URL printed by `serve` (typically `http://localhost:3000`).

### 2. Drop statements into `statements/`

Place any PDF or CSV bank/credit card statements into the `statements/` folder. Supported formats:

- **PDF** — standard bank statement PDFs (Chase, TD, Amex, etc.)
- **CSV** — exported transaction CSVs from online banking

```
statements/
  chase-2026-03.pdf
  td-chequing-feb-2026.pdf
  amex-gold-march-2026.csv
```

Files are read but never modified. You can leave old statements in the folder — the skill deduplicates by transaction ID.

### 3. Run the import skill

In Claude Code, run:

```
/rocket
```

The skill will:
1. Detect all files in `statements/`
2. Extract transactions (parse PDF tables or read CSV columns)
3. Normalize fields — merchant, category, subcategory, account, date, amount
4. Use AI to categorize ambiguous transactions (falls back to `Misc`)
5. Deduplicate against existing rows in `data/transactions.csv`
6. Append new transactions and write the updated CSV
7. Flag transactions it isn't confident about as `needs_review: true`

### 4. Open the dashboard

Reload the browser tab (or open `http://localhost:3000` if it isn't open).

If any transactions need review, an amber banner appears at the top of the Dashboard. Click **Review now** to filter to them in the Transactions page.

---

## Dashboard Pages

| Page | What it shows |
|------|--------------|
| **Dashboard** | KPI cards, date-range selector, spending chart, category donut, budget progress, recent transactions, upcoming bills |
| **Transactions** | Full searchable/filterable table with inline note and category editing, expandable detail rows |
| **Subscriptions** | Subscription charges grouped by merchant — list, pie chart, or calendar view |
| **Bills** | Recurring Utilities + Housing bills with status and due dates — list, pie chart, or calendar view |
| **Settings** | Editable accounts, budget limits, notification toggles, theme selector, imported files |

---

## Customising `settings.json`

| Key | What it controls |
|-----|-----------------|
| `user.theme` | Starting theme — `"dark"`, `"light"`, or `"system"` (also changeable in Settings) |
| `budgets` | Monthly spending limit per category (editable in Settings → Budget Limits) |
| `categories` | Category names, hex colors, and Lucide icon names — edit here to change badge colors app-wide |
| `dashboard.recentTransactionsCount` | How many rows appear in the Dashboard recent list |
| `dashboard.upcomingBillsCount` | How many upcoming bills appear on the Dashboard |
| `notifications` | Toggle which alert types appear |

---

## Troubleshooting

**Blank page / console errors on open**
→ You opened `index.html` via `file://`. Run `npx serve .` and open `http://localhost:3000`.

**"Could not load transactions" error**
→ `data/transactions.csv` is missing or malformed. Run `/rocket` to import statements, or check the file exists and has the correct columns (see `docs/csv-schema.md`).

**Transactions not appearing after import**
→ Hard-reload the page (`Cmd+Shift+R` / `Ctrl+Shift+R`) to bypass the browser cache.

**PDF not parsed correctly**
→ Some banks use image-based PDFs that can't be text-extracted. Export a CSV from your bank's online portal instead.
