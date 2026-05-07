# Features 

This documents describes planned features, tasks for the feature, and their current status. 

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

### Tasks
- [x] Add tasks to docs/features.md
- [x] Create `GroupedBarChart` generic shared component (`src/shared/components/GroupedBarChart.tsx`)
- [x] Create `types.ts` — `PeriodPoint`, `MerchantSpend`, `SpendingPeriod`, `SpendingSummary`, `MerchantDetail`
- [x] Create `queries.ts` — `querySpendingTrends`, `queryIncomeVsExpenses`, `queryCashFlow`, `queryMerchantSpending`, `queryMerchantDetail`, `querySpendingSummary`
- [x] Create hooks — `useSpendingTrends`, `useIncomeVsExpenses`, `useCashFlow`, `useMerchantSpending`, `useSpendingSummary`
- [x] Create `SpendingSummaryBar.tsx` — avg monthly spend, savings rate, net cash flow MetricCards
- [x] Create `MerchantDetailDrawer.tsx` — Drawer with total, count, avg, mini trend chart
- [x] Create `SpendingTrendsSection.tsx` — LineAreaChart for expense trend over time
- [x] Create `IncomeExpensesSection.tsx` — GroupedBarChart for income vs expenses per period
- [x] Create `CashFlowSection.tsx` — LineAreaChart for net cash flow per period
- [x] Create `MerchantSpendingSection.tsx` — HorizontalBarChart; bar click opens MerchantDetailDrawer
- [x] Create `SpendingAnalyticsPage.tsx` — page shell with period picker, summary bar, all sections
- [x] Wire up navigation and routing

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

