# Features 

This documents describes planned features, tasks for the feature, and their current status. 

## Budgets
A new page is needed where users should be able to create and manage budgets. Users should be able to see and create budgets on this page. 

For this feature to be completed users should be able to do the following:
- Create monthly budgets
- Create weekly budgets
- Apply custom budget periods
- Apply category budgets
- Rollover budgets for periods
- Budget progress tracking via progress charts
- Budget alerts/warnings
- Remaining budget calculations
- Overspending detection

### Tasks
- [x] Add task list to `docs/features.md`
- [ ] Add `persistBudgets()` to `src/shared/db/persist.ts`
- [ ] Create `src/shared/components/RadialProgressChart.tsx`
- [ ] Create `src/features/budgets/types.ts`
- [ ] Create `src/features/budgets/queries.ts`
- [ ] Create `src/features/budgets/useBudgets.ts` and `useBudgetHistory.ts`
- [ ] Create `src/features/budgets/BudgetSummaryBar.tsx`
- [ ] Create `src/features/budgets/BudgetCard.tsx`
- [ ] Create `src/features/budgets/BudgetAllocationSection.tsx`
- [ ] Create `src/features/budgets/BudgetListSection.tsx`
- [ ] Create `src/features/budgets/BudgetDetailDrawer.tsx`
- [ ] Create `src/features/budgets/BudgetEditorDrawer.tsx`
- [ ] Create `src/features/budgets/BudgetsPage.tsx`
- [ ] Wire up navigation (`navigation.ts`) and routing (`App.tsx`)
- [ ] Commit all changes

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

