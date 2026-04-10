# File Structure

```
rocket-claude/
├── index.html                        # Entry point — load all scripts here
├── settings.json                     # App config — categories, budgets, accounts, notifications
├── data/
│   └── transactions.csv              # Output from Claude Code skill (source of truth)
├── statements/                       # Input folder — user drops bank PDFs/CSVs here
│   └── .gitkeep
├── docs/
│   ├── overview.md
│   ├── data-flow.md
│   ├── csv-schema.md
│   ├── features-v1.md
│   ├── styling-guide.md
│   ├── coding-guide.md
│   ├── file-structure.md             # this file
│   ├── ui-library.md                 # full UI primitive reference
│   └── task-list.md
└── src/
    ├── utils/
    │   ├── formatters.js             # currency(), date(), percent(), relativeDate() etc.
    │   ├── csvParser.js              # PapaParse wrapper + row validation
    │   └── categorizer.js            # Derives bills recurrence from transaction list
    ├── context/
    │   └── SettingsContext.jsx       # Settings loader + provider + useSettings hook
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
    │   │   └── other.jsx             # EmptyState, PageHeader, Stat
    │   ├── Sidebar.jsx               # Left nav — app logo, page links, footer date
    │   ├── StatCard.jsx              # KPI card (label, value, delta, optional icon)
    │   ├── NeedsReviewBanner.jsx     # Amber alert banner for flagged transactions
    │   ├── SpendingChart.jsx         # Line chart — daily cumulative spend over month
    │   ├── CategoryDonut.jsx         # Doughnut chart — spend by category
    │   ├── BudgetProgress.jsx        # Progress bars per budgeted category
    │   ├── RecentTransactions.jsx    # Last N transactions list
    │   ├── SubscriptionCard.jsx      # Single subscription merchant card
    │   └── BillItem.jsx              # Single bill row with status indicator
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
CDN deps (React 18, ReactDOM, Babel standalone, Tailwind, PapaParse, Chart.js, Lucide React)
  │
  ├─ src/components/ui/layout.jsx          ← no dependencies
  ├─ src/components/ui/typography.jsx      ← no dependencies
  ├─ src/components/ui/media.jsx           ← depends on: (LucideReact global from CDN)
  ├─ src/components/ui/forms.jsx           ← depends on: layout, typography, media
  ├─ src/components/ui/feedback.jsx        ← depends on: layout, typography, media
  ├─ src/components/ui/data-display.jsx    ← depends on: layout, typography
  ├─ src/components/ui/overlay.jsx         ← depends on: layout, typography, media, forms
  ├─ src/components/ui/disclosure.jsx      ← depends on: layout, typography, media
  ├─ src/components/ui/other.jsx           ← depends on: all other UI files
  │
  ├─ src/utils/formatters.js               ← no UI dependencies
  ├─ src/utils/csvParser.js                ← no UI dependencies
  ├─ src/utils/categorizer.js              ← depends on: formatters
  │
  ├─ src/context/SettingsContext.jsx       ← depends on: layout (loading state)
  ├─ src/hooks/useTransactions.js          ← depends on: csvParser, categorizer
  │
  ├─ src/components/Sidebar.jsx            ← depends on: layout, typography, media, formatters
  ├─ src/components/StatCard.jsx           ← depends on: data-display, other, media
  ├─ src/components/NeedsReviewBanner.jsx  ← depends on: feedback
  ├─ src/components/SpendingChart.jsx      ← depends on: data-display, typography, other, formatters
  ├─ src/components/CategoryDonut.jsx      ← depends on: data-display, typography, other, formatters, SettingsContext
  ├─ src/components/BudgetProgress.jsx     ← depends on: data-display, feedback, media, typography, other, formatters, SettingsContext
  ├─ src/components/RecentTransactions.jsx ← depends on: data-display, typography, other, formatters, SettingsContext
  ├─ src/components/SubscriptionCard.jsx   ← depends on: data-display, typography, media, formatters, SettingsContext
  ├─ src/components/BillItem.jsx           ← depends on: data-display, typography, media, formatters, SettingsContext
  │
  ├─ src/pages/Dashboard.jsx              ← depends on: all components above + useTransactions
  ├─ src/pages/Transactions.jsx           ← depends on: all components above + useTransactions
  ├─ src/pages/Subscriptions.jsx          ← depends on: SubscriptionCard + useTransactions
  ├─ src/pages/Bills.jsx                  ← depends on: BillItem + useTransactions
  ├─ src/pages/Settings.jsx               ← depends on: forms, SettingsContext, useTransactions
  │
  └─ src/App.jsx                          ← depends on: everything
```

### Rule of thumb when adding a new file

1. Identify all globals it uses (components, hooks, utils).
2. Find the **last** of those in `index.html`.
3. Insert the new `<script>` tag immediately after it.
