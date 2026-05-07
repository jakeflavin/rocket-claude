import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { BudgetSummaryBar } from './BudgetSummaryBar';
import { BudgetAllocationSection } from './BudgetAllocationSection';
import { BudgetListSection } from './BudgetListSection';
import { BudgetDetailDrawer } from './BudgetDetailDrawer';
import { BudgetEditorDrawer } from './BudgetEditorDrawer';
import { useBudgets } from './useBudgets';
import type { BudgetWithStats } from './types';

type EditorMode =
  | { kind: 'create' }
  | { kind: 'edit'; budget: BudgetWithStats };

export function BudgetsPage() {
  const { budgets, loading, refresh } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithStats | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);

  const handleSaved = useCallback(() => {
    refresh();
  }, [refresh]);

  function openEditor(budget?: BudgetWithStats) {
    setSelectedBudget(null);
    setEditorMode(budget ? { kind: 'edit', budget } : { kind: 'create' });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Budgets</h1>
        <Button variant="primary" onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-1.5 inline-block" />
          New Budget
        </Button>
      </div>

      {/* Summary stat bar */}
      <BudgetSummaryBar tick={budgets.length} />

      {/* Allocation donut */}
      <BudgetAllocationSection budgets={budgets} loading={loading} />

      {/* Budget cards grid */}
      <BudgetListSection
        budgets={budgets}
        loading={loading}
        onSelect={setSelectedBudget}
      />

      {/* Detail drawer */}
      <BudgetDetailDrawer
        budget={selectedBudget}
        onClose={() => setSelectedBudget(null)}
        onEdit={(b) => openEditor(b)}
      />

      {/* Editor drawer */}
      <BudgetEditorDrawer
        mode={editorMode}
        onClose={() => setEditorMode(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
