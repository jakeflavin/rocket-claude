# File Structure

```
rocket-claude/
├── index.html                        # Entry point — load all scripts here
├── settings.json                     # App config — categories, budgets, accounts, notifications
├── README.md                         # Setup + usage instructions
├── scripts/
│   ├── pdf_to_markdown.py            # PDF → structured markdown (pdfplumber / pypdf)
│   └── csv_utils.py                  # Concat, dedup, sort, write transactions.csv
├── data/
│   ├── transactions.csv              # Output from /rocket skill (source of truth)
│   └── merchants.json                # Persistent merchant normalization dictionary
├── statements/                       # Drop zone — user drops bank PDFs/CSVs here
│   └── .gitkeep
├── .claude/
│   ├── CLAUDE.md                     # Agent conventions: field rules, pipeline, column schema
│   ├── skills/
│   │   └── rocket/                   # Claude Code import skill (/rocket)
│   │       ├── SKILL.md              # Orchestrator — 9-step pipeline
│   │       └── RULES.md              # CSV schema, column order, category taxonomy
│   └── agents/
│       ├── statement-normalizer.md   # Agent 1: bank detection + parse → _normalized.csv
│       ├── merchant-normalizer.md    # Agent 2: raw desc → canonical merchant + merchants.json
│       └── categorizer.md            # Agent 3: category + subcategory + needs_review
├── docs/
│   ├── overview.md
│   ├── data-flow.md
│   ├── csv-schema.md
│   ├── features-v1.md
│   ├── styling-guide.md
│   ├── coding-guide.md
│   ├── file-structure.md             # this file
│   ├── ui-library.md                 # full UI primitive reference
│   ├── task-list.md
│   └── bank-formats/                 # Per-bank statement format docs
│       ├── pnc.md
│       ├── amex.md
│       ├── chase.md
│       └── apple-card.md
└── src/
    ├── utils/
    │   ├── formatters.js             # currency(), date(), percent(), relativeDate() etc.
    │   ├── csvParser.js              # PapaParse wrapper + row validation
    │   └── categorizer.js            # Derives bills recurrence from transaction list
    ├── context/
    │   └── SettingsContext.jsx       # Settings loader + provider + useSettings + useCategoryColorMap
    ├── hooks/
    │   └── useTransactions.js        # CSV reader + derived data views
    ├── components/
    │   ├── ui/                       # Primitive component library (no import/export)
    │   │   ├── layout.jsx            # Box, VStack, HStack, Center, Grid, Spacer, Container, Divider
    │   │   ├── typography.jsx        # Text, Heading, Label, Caption
    │   │   ├── media.jsx             # Icon, Img, Avatar
    │   │   ├── forms.jsx             # Button, Input, Select, Textarea, Switch, Checkbox
    │   │   ├── feedback.jsx          # Spinner, Skeleton, Progress, Alert
    │   │   ├── data-display.jsx      # Card, CardHeader, CardBody, CardFooter, Badge, Table family
    │   │   ├── overlay.jsx           # Portal, Modal, AlertDialog, Tooltip, Popover, Menu, MenuItem
    │   │   ├── disclosure.jsx        # Accordion, AccordionItem, Collapsible, Tabs, Tab, TabPanel
    │   │   ├── other.jsx             # EmptyState, PageHeader, Stat
    │   │   └── charts.jsx            # ChartTheme, useChart, ChartHelpers, SpendingChart, CategoryDonut, RecurringDonut
    │   ├── Sidebar.jsx               # Left nav — app logo, page links, footer date
    │   ├── StatCard.jsx              # KPI card (label, value, delta, optional icon)
    │   ├── NeedsReviewBanner.jsx     # Dismissible amber alert banner for flagged transactions
    │   ├── BudgetProgress.jsx        # Progress bars per budgeted category
    │   ├── RecentTransactions.jsx    # Last N transactions list
    │   ├── SubscriptionCard.jsx      # Single subscription merchant card
    │   ├── BillItem.jsx              # Single bill row with status indicator (owns BILL_STATUS global)
    │   ├── DataErrorState.jsx        # Error fallback for failed CSV load
    │   ├── RecurringCalendar.jsx     # Calendar grid for Bills and Subscriptions calendar views
    │   └── ViewToggle.jsx            # List / Chart / Calendar view switcher
    ├── pages/
    │   ├── Dashboard.jsx             # Overview — all widgets assembled
    │   ├── Transactions.jsx          # Full transaction list with filters + inline edit
    │   ├── Subscriptions.jsx         # Subscriptions grouped by merchant
    │   ├── Bills.jsx                 # Recurring bills with due dates and status
    │   └── Settings.jsx              # Config editor + imported files table
    └── App.jsx                       # Root — SettingsProvider + Sidebar + page routing
```

---

## Script Load Order in `index.html`

Script load order **is** the dependency graph — there is no module bundler.
Every file must come after the files it depends on.

```
CDN deps (React 18, ReactDOM, Babel standalone, Tailwind, PapaParse, Chart.js, Lucide)
  │
  ├─ src/components/ui/layout.jsx          ← no dependencies
  ├─ src/components/ui/typography.jsx      ← no dependencies
  ├─ src/components/ui/media.jsx           ← depends on: (lucide global from CDN)
  ├─ src/components/ui/forms.jsx           ← depends on: layout, typography, media
  ├─ src/components/ui/feedback.jsx        ← depends on: layout, typography, media
  ├─ src/components/ui/data-display.jsx    ← depends on: layout, typography
  ├─ src/components/ui/overlay.jsx         ← depends on: layout, typography, media, forms
  ├─ src/components/ui/disclosure.jsx      ← depends on: layout, typography, media
  ├─ src/components/ui/other.jsx           ← depends on: all other UI files
  ├─ src/components/ui/charts.jsx          ← depends on: all other UI files
  │                                          (Formatters/Chart.js called at render time only)
  │
  ├─ src/utils/formatters.js               ← no UI dependencies
  ├─ src/utils/csvParser.js                ← no UI dependencies
  ├─ src/utils/categorizer.js              ← depends on: formatters
  │
  ├─ src/context/SettingsContext.jsx       ← depends on: layout (loading state)
  │                                          exposes: useSettings, useCategoryColorMap
  ├─ src/hooks/useTransactions.js          ← depends on: csvParser, categorizer
  │
  ├─ src/components/Sidebar.jsx            ← depends on: layout, typography, media, formatters
  ├─ src/components/StatCard.jsx           ← depends on: data-display, other, media
  ├─ src/components/NeedsReviewBanner.jsx  ← depends on: feedback
  ├─ src/components/BudgetProgress.jsx     ← depends on: data-display, feedback, media, typography, other, formatters, SettingsContext
  ├─ src/components/RecentTransactions.jsx ← depends on: data-display, typography, other, formatters, SettingsContext
  ├─ src/components/SubscriptionCard.jsx   ← depends on: data-display, typography, media, formatters, SettingsContext
  ├─ src/components/BillItem.jsx           ← depends on: data-display, typography, media, formatters
  ├─ src/components/DataErrorState.jsx     ← depends on: other, layout
  ├─ src/components/RecurringCalendar.jsx  ← depends on: layout, typography, data-display, overlay, formatters
  ├─ src/components/ViewToggle.jsx         ← depends on: forms, layout, media
  │
  ├─ src/pages/Dashboard.jsx              ← depends on: all components above + useTransactions
  ├─ src/pages/Transactions.jsx           ← depends on: all components above + useTransactions
  ├─ src/pages/Subscriptions.jsx          ← depends on: SubscriptionCard, RecurringCalendar, charts + useTransactions
  ├─ src/pages/Bills.jsx                  ← depends on: BillItem, RecurringCalendar, charts + useTransactions
  ├─ src/pages/Settings.jsx               ← depends on: forms, SettingsContext, useTransactions
  │
  └─ src/App.jsx                          ← depends on: everything
```

### Rule of thumb when adding a new file

1. Identify all globals it uses (components, hooks, utils).
2. Find the **last** of those in `index.html`.
3. Insert the new `<script>` tag immediately after it.
