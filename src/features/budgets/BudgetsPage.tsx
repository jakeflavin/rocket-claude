import { useCallback, useState } from 'react';
import { FAB } from '../../shared/components/FAB';
import { BudgetSummaryBar } from './BudgetSummaryBar';
import { BudgetAllocationSection } from './BudgetAllocationSection';
import { BudgetListSection } from './BudgetListSection';
import { BudgetDrawer } from './BudgetDrawer';
import { useBudgets } from './useBudgets';
import type { BudgetWithStats } from './types';
import type { BudgetDrawerMode } from './BudgetDrawer';

export function BudgetsPage() {
  const { budgets, loading, refresh } = useBudgets();
  const [drawerMode, setDrawerMode] = useState<BudgetDrawerMode>(null);

  const handleSaved = useCallback(() => { refresh(); }, [refresh]);

  function openBudget(budget: BudgetWithStats) {
    setDrawerMode(budget);
  }

  return (
    <div className="flex flex-col gap-4">
      <BudgetSummaryBar tick={budgets.length} />

      <BudgetAllocationSection budgets={budgets} loading={loading} />

      <BudgetListSection
        budgets={budgets}
        loading={loading}
        onSelect={openBudget}
      />

      <BudgetDrawer
        mode={drawerMode}
        onClose={() => setDrawerMode(null)}
        onSaved={handleSaved}
      />

      <FAB onClick={() => setDrawerMode('new')} label="New Budget" text="New Budget" />
    </div>
  );
}
