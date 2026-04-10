# File Structure

```
rocket-claude/
├── index.html                        # Entry point — load all scripts here
├── settings.json                     # App config — categories, budgets, accounts, notifications
├── data/
│   └── transactions.csv              # Output from Claude Code skill (source of truth)
├── statements/                       # Input folder — user drops bank PDFs/CSVs here
│   └── .gitkeep
├── src/
│   ├── utils/
│   │   ├── formatters.js             # currency(), date(), percent() helpers
│   │   ├── csvParser.js              # PapaParse wrapper + row validation
│   │   └── categorizer.js            # Derives bills recurrence from transaction list
│   ├── context/
│   │   └── SettingsContext.jsx       # Settings loader + provider + useSettings hook
│   ├── hooks/
│   │   └── useTransactions.js        # CSV reader + derived data views
│   ├── components/
│   │   ├── Sidebar.jsx               # Left nav, app title, page links
│   │   ├── StatCard.jsx              # KPI card (label, value, delta)
│   │   ├── SpendingChart.jsx         # Line chart — daily spend over month
│   │   ├── CategoryDonut.jsx         # Doughnut chart — spend by category
│   │   ├── BudgetProgress.jsx        # Progress bars per category
│   │   ├── RecentTransactions.jsx    # Last N transactions list
│   │   ├── SubscriptionCard.jsx      # Single subscription merchant card
│   │   ├── BillItem.jsx              # Single bill row with status indicator
│   │   └── NeedsReviewBanner.jsx     # Amber alert banner for flagged transactions
│   └── pages/
│       ├── Dashboard.jsx             # Overview — all widgets
│       ├── Transactions.jsx          # Full transaction list with filters
│       ├── Subscriptions.jsx         # Subscriptions grouped by merchant
│       ├── Bills.jsx                 # Recurring bills with due dates
│       └── Settings.jsx              # Config editor + imported files table
└── README.md                         # Setup instructions for end users
```

## Script Load Order in index.html

Script load order **is** the dependency graph — there is no module bundler.

```
CDN deps (React, Babel, Tailwind, PapaParse, Chart.js)
  └─ src/utils/formatters.js
  └─ src/utils/csvParser.js
  └─ src/utils/categorizer.js
  └─ src/context/SettingsContext.jsx
  └─ src/hooks/useTransactions.js
  └─ src/components/Sidebar.jsx
  └─ src/components/StatCard.jsx
  └─ src/components/NeedsReviewBanner.jsx
  └─ src/components/SpendingChart.jsx
  └─ src/components/CategoryDonut.jsx
  └─ src/components/BudgetProgress.jsx
  └─ src/components/RecentTransactions.jsx
  └─ src/components/SubscriptionCard.jsx
  └─ src/components/BillItem.jsx
  └─ src/pages/Dashboard.jsx
  └─ src/pages/Transactions.jsx
  └─ src/pages/Subscriptions.jsx
  └─ src/pages/Bills.jsx
  └─ src/pages/Settings.jsx
  └─ src/App.jsx
```
