# Features — v1 Scope

## 4.1 Dashboard

- **KPI Cards** (4): Total Spent, Total Income, Remaining Budget, Savings Rate %
- **Date Range Selector**: dropdown next to page header — This Month, This Week, Last 7/30/90 Days, Last 12 Months; filters all dashboard stats and charts
- **Spending Trend Chart**: Line chart — daily cumulative spend for selected range
- **Spending by Category**: Doughnut chart — breakdown by category
- **Budget Progress**: Progress bars per category — green → yellow → red
- **Recent Transactions**: Last N transactions, with merchant, category, amount, date
- **Upcoming Bills**: Next N bills sorted by due date
- **Needs Review Banner**: Dismissible amber alert banner if any `needs_review === true` transactions exist; click "Review now" to navigate to filtered Transactions view

## 4.2 Transactions

- Full paginated transaction list (50 per page)
- **Search**: filter by `normalized_description` or `merchant`
- **Filters**: by category, account, date range, `needs_review` status
- **Sort**: by date (default desc), amount, merchant
- **Inline editing**: `notes` field editable in-row; `needs_review` toggle
- **Inline category editing**: click category badge to open a Select dropdown; session-only edits indicated with a subtle dot
- **Expandable rows**: chevron button reveals full detail panel — raw description, account_type, source_file, timestamps, editable subcategory
- **Category badge**: color-coded pill matching category color from `settings.json`
- **Amount display**: income in emerald, expenses in rose
- **Needs Review tab**: dedicated filter view for flagged transactions

## 4.3 Subscriptions

- List of all transactions where `category === "Subscriptions"`
- Grouped by `merchant` — shows most recent charge + monthly cost
- **Subcategory filter**: Streaming / Software / Memberships
- **Monthly total** at top: sum of all subscription charges this month
- **Subscription card**: merchant name, subcategory, last charged date, monthly amount
- **View toggle**: List / Chart / Calendar
  - **Chart view**: doughnut by merchant sized by monthly cost
  - **Calendar view**: monthly grid with subscription charges plotted on due dates; prev/next month navigation

## 4.4 Bills

- List of recurring `Utilities` and `Housing` transactions
- Grouped by merchant — shows last paid date and amount
- **Upcoming bills**: estimated next due date based on recurrence pattern
- **Status indicator**: Paid / Due Soon / Overdue
- **View toggle**: List / Chart / Calendar
  - **Chart view**: doughnut by merchant sized by average monthly amount
  - **Calendar view**: monthly grid with bills plotted on estimated due dates; prev/next month navigation

## 4.5 Settings

- **Accounts**: editable account name and type — overrides persist to `settings.accountAliases`; applied in Transactions display
- **Budget Limits**: edit per-category budget limits (saved to `settings.json`)
- **Categories**: display category list with colors and icons (read-only)
- **Notifications**: toggle each alert type on/off
- **Imported Files**: table of unique `source_file` values found in CSV, with transaction count per file
- **Data**: button to reload CSV from disk
- **Theme**: light / dark / system selector — persists to `settings.json`
