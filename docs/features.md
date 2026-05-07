# Features 

This documents describes planned features, tasks for the feature, and their current status. 

## Goals
A new goals page should be added htat allows users to set and manage savings goals. 

For this feature to be completed users should be able to do the following:
- Savings targets
- Goal progress tracking
- Target date tracking
- Linked account tracking

### Tasks
- [x] Add task list to `docs/features.md`
- [ ] Add `persistGoals()` to `src/shared/db/persist.ts`
- [ ] Create `src/shared/components/ProjectionChart.tsx`
- [ ] Create `src/features/goals/types.ts`
- [ ] Create `src/features/goals/queries.ts`
- [ ] Create `src/features/goals/useGoals.ts`
- [ ] Create `src/features/goals/GoalSummaryBar.tsx`
- [ ] Create `src/features/goals/GoalCard.tsx`
- [ ] Create `src/features/goals/GoalListSection.tsx`
- [ ] Create `src/features/goals/GoalDetailDrawer.tsx`
- [ ] Create `src/features/goals/GoalEditorDrawer.tsx`
- [ ] Create `src/features/goals/GoalsPage.tsx`
- [ ] Wire up navigation (`navigation.ts`) and routing (`App.tsx`)
- [ ] Commit all changes
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

