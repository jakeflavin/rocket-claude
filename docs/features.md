# Features 

This documents describes planned features, tasks for the feature, and their current status. 

## Home Dashboard
Users should be presents with a dashboard as their main screen when opening the app. It should include:
- Account balances overview
- Spending summary
- Monthly cash flow
- Budget progress
- Recent transactions
- Upcoming bills
- Savings goals summary

### Tasks
- [x] Add task list to docs/features.md
- [x] Create src/shared/components/Sparkline.tsx
- [x] Create src/features/home/types.ts
- [x] Create src/features/home/queries.ts
- [x] Create src/features/home/useDashboard.ts
- [x] Create src/features/home/DashboardSummaryBar.tsx
- [x] Create src/features/home/CashFlowSection.tsx
- [x] Create src/features/home/AccountBalancesSection.tsx
- [x] Create src/features/home/BudgetProgressSection.tsx
- [x] Create src/features/home/DashboardTransactionDrawer.tsx
- [x] Create src/features/home/RecentTransactionsSection.tsx
- [x] Create src/features/home/DashboardBillDrawer.tsx
- [x] Create src/features/home/UpcomingBillsSection.tsx
- [x] Create src/features/home/HomePage.tsx
- [x] Wire up navigation (navigation.ts) and routing (App.tsx)
- [ ] Commit all changes

