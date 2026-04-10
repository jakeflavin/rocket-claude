# Features — v1 Scope

## 4.1 Dashboard

- **KPI Cards** (4): Total Spent, Total Income, Remaining Budget, Savings Rate %
- **Spending Trend Chart**: Line chart — daily cumulative spend for current month
- **Spending by Category**: Doughnut chart — breakdown by category
- **Budget Progress**: Progress bars per category — green → yellow → red
- **Recent Transactions**: Last 10 transactions, with merchant, category, amount, date
- **Upcoming Bills**: Next 5 bills sorted by due date
- **Needs Review Badge**: Alert banner if any `needs_review === true` transactions exist

## 4.2 Transactions

- Full paginated transaction list (50 per page)
- **Search**: filter by `normalized_description` or `merchant`
- **Filters**: by category, account, date range, `needs_review` status
- **Sort**: by date (default desc), amount, merchant
- **Inline editing**: `notes` field editable in-row; `needs_review` toggle
- **Category badge**: color-coded pill matching category color from `settings.json`
- **Amount display**: income in emerald, expenses in rose
- **Needs Review tab**: dedicated filter view for flagged transactions

## 4.3 Subscriptions

- List of all transactions where `category === "Subscriptions"`
- Grouped by `merchant` — shows most recent charge + monthly cost
- **Subcategory filter**: Streaming / Software / Memberships
- **Monthly total** at top: sum of all subscription charges this month
- **Subscription card**: merchant name, subcategory, last charged date, monthly amount

## 4.4 Bills

- List of recurring `Utilities` and `Housing` transactions
- Grouped by merchant — shows last paid date and amount
- **Upcoming bills**: estimated next due date based on recurrence pattern
- **Status indicator**: Paid / Due Soon / Overdue

## 4.5 Settings

- **Profile**: edit user name, currency, locale
- **Accounts**: list accounts found in CSV (read-only, derived from data)
- **Budget Limits**: edit per-category budget limits (saved to `settings.json`)
- **Categories**: display category list with colors and icons (read-only)
- **Notifications**: toggle each alert type on/off
- **Imported Files**: table of unique `source_file` values found in CSV, with transaction count per file
- **Data**: button to reload CSV from disk
