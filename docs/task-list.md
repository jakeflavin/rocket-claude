# Task List

Complete tasks in order. Each task must be fully working before moving to the next.

## Phase 1 — Foundation

- [x] **T01** Create `index.html` with all CDN script tags in correct load order. Mount empty React app to `#root`. Verify it renders "rocket-claude loading…" in the browser with no console errors.
- [x] **T02** Create `settings.json` with full structure: `user`, `dashboard`, `budgets`, `categories` (all 12 from schema), `accounts`, `notifications`, `data`.
- [x] **T03** Create `data/transactions.csv` with 60+ realistic mock rows spanning 3 months, covering all 12 categories, 3 accounts (TD Chequing, Chase Savings, Amex Gold), and at least 8 subscriptions and 6 recurring bills. Include 5 rows with `needs_review: true`.
- [x] **T04** Create `src/utils/formatters.js` — implement `Formatters.currency()`, `Formatters.date()`, `Formatters.percent()`, `Formatters.relativeDate()`. Expose on `window.Formatters`.
- [x] **T05** Create `src/utils/csvParser.js` — PapaParse wrapper that validates required fields and drops malformed rows. Expose on `window.CsvParser`.
- [x] **T06** Create `src/utils/categorizer.js` — identifies recurring transactions (same merchant, 2+ months) for the Bills page. Expose on `window.Categorizer`.
- [x] **T07** Create `src/context/SettingsContext.jsx` — fetch `settings.json`, provide via context, expose `useSettings()`.
- [x] **T08** Create `src/hooks/useTransactions.js` — load CSV via PapaParse, expose `transactions`, `expenses`, `income`, `needsReview`, `subscriptions`, `bills`, `loading`, `error`.

## Phase 2 — Layout & Navigation

- [x] **T09** Create `src/components/Sidebar.jsx` — app logo ("🚀 rocket-claude"), nav links for all 5 pages with icons, active state styling, current month/year display at bottom.
- [x] **T10** Create `src/App.jsx` — tab-based navigation, wrap with `SettingsProvider`, render `Sidebar` + active page. Full dark layout shell.

## Phase 3 — Shared Components

- [ ] **T11** Create `src/components/StatCard.jsx` — label, mono value, optional delta with up/down arrow and color.
- [ ] **T12** Create `src/components/NeedsReviewBanner.jsx` — amber banner showing count of flagged transactions, links to Transactions page filtered to needs_review.
- [ ] **T13** Create `src/components/SpendingChart.jsx` — Chart.js line chart, daily cumulative spend for selected month. Dark theme applied.
- [ ] **T14** Create `src/components/CategoryDonut.jsx` — Chart.js doughnut chart, spend by category. Colors from `settings.json`. Dark theme applied.
- [ ] **T15** Create `src/components/BudgetProgress.jsx` — progress bars per category. Pulls limits from `settings.json`. Color shifts at 75% and 90%.
- [ ] **T16** Create `src/components/RecentTransactions.jsx` — last N transactions, merchant + category badge + amount + date. Amount in `font-mono`.
- [ ] **T17** Create `src/components/SubscriptionCard.jsx` — merchant name, subcategory, last charged, monthly cost.
- [ ] **T18** Create `src/components/BillItem.jsx` — merchant, category, last paid date, estimated next due, status badge (Paid / Due Soon / Overdue).

## Phase 4 — Pages

- [ ] **T19** Build `src/pages/Dashboard.jsx` — assemble all dashboard widgets. 4 KPI cards across top, 2-column grid below (SpendingChart + CategoryDonut), BudgetProgress, RecentTransactions + upcoming bills side by side. NeedsReviewBanner at top if applicable.
- [ ] **T20** Build `src/pages/Transactions.jsx` — full list with search input, category filter dropdown, account filter dropdown, date range pickers, needs_review toggle filter. Paginated 50/page. Sortable columns. Inline notes editor.
- [ ] **T21** Build `src/pages/Subscriptions.jsx` — group by merchant, show monthly cost, subcategory filter tabs (All / Streaming / Software / Memberships), monthly total header.
- [ ] **T22** Build `src/pages/Bills.jsx` — recurring Utilities + Housing transactions. Group by merchant. Show last paid, estimated next due, status. Sort by next due date ascending.
- [ ] **T23** Build `src/pages/Settings.jsx` — 5 sections: Profile editor, Accounts list (derived from CSV), Budget limits editor (saves to settings.json), Notifications toggles, Imported Files table (unique source_file values + transaction counts).

## Phase 5 — Polish

- [ ] **T24** Add empty state components to every list: friendly message + icon when no data matches filters.
- [ ] **T25** Add loading skeleton screens for CSV parse delay.
- [ ] **T26** Add error state if `transactions.csv` is missing or unparseable.
- [ ] **T27** Verify all currency values use `font-mono` (JetBrains Mono).
- [ ] **T28** Verify all category colors are derived from `settings.json` — no hardcoded hex values in components.
- [ ] **T29** Test with browser opened via `file://` protocol (double-click `index.html`). Fix any CORS issues with CSV loading (may need a local server note in README).
- [ ] **T30** Write `README.md` — setup instructions, how to drop statements into `/statements`, how to run the Claude Code skill, how to open the dashboard.
