# Features 

This documents describes planned features, tasks for the feature, and their current status. 

## Subscriptions & Bills
A new reoccurring page needs added that displays recorring transactions. This should be a sub page to transactions. Users should be able to see their reoccuring bills and subscriptions in different views (list, calendar). 

For this feature to be completed users should be able to do the following:
- Subscription detection
- Recurring income detection
- Bill reminders
- Upcoming payment calendar
- Frequency detection
- Confidence scoring
- Subscription spending summaries
- Cancelled subscription tracking

### Tasks
- [x] Add tasks to docs/features.md
- [x] Create `CalendarGrid<T>` generic shared component (`src/shared/components/CalendarGrid.tsx`)
- [x] Create `types.ts` — `RecurringTransaction`, `RecurringFilters`, `RecurringSummary`
- [x] Create `queries.ts` — `queryRecurring`, `queryRecurringSummary`
- [x] Create `useRecurring.ts` and `useRecurringSummary.ts` hooks
- [x] Create `SubscriptionSummaryBar.tsx` — stat cards for monthly cost, active count, due this week, cancelled
- [x] Create `RecurringDetailDrawer.tsx` — Drawer with full item detail
- [x] Create `SubscriptionListSection.tsx` — DataTable list view, row click opens detail drawer
- [x] Create `SubscriptionCalendarSection.tsx` — CalendarGrid view for upcoming payments
- [x] Create `SubscriptionsPage.tsx` — page shell with view toggle, filter bar, summary bar
- [x] Wire up navigation and routing

## Spending Analytics
A new page is needed where users can see their spending in filterable graphical represenation. This should be a sub page on transactions. 

For this feature to be completed users should be able to do the following:
- Monthly spending trends
- Yearly spending trends
- Spending by merchant
- Income vs expenses
- Average monthly spending
- Savings rate calculations
- Cash flow tracking

## Budgets
A new page is needed where users should be able to create and manage budgets. Users should be able to see and create budgets on this page. 

For this feature to be completed users should be able to do the following:
- Create onthly budgets
- Creat weekly budgets
- Apply custom budget periods
- Apply category budgets
- Rollover budgets for periods
- Budget progress tracking via progress charts
- Budget alerts/warnings
- Remaining budget calculations
- Overspending detection

## Goals
A new goals page should be added htat allows users to set and manage savings goals. 

For this feature to be completed users should be able to do the following:
- Savings targets
- Goal progress tracking
- Target date tracking
- Linked account tracking
- Contribution recommendations

## Home Dashboard
Users should be presents with a dashboard as their main screen when opening the app. It should include:
- Account balances overview
- Spending summary
- Monthly cash flow
- Budget progress
- Recent transactions
- Upcoming bills
- Savings goals summary

