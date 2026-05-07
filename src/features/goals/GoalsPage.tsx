import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { GoalSummaryBar } from './GoalSummaryBar';
import { GoalListSection } from './GoalListSection';
import { GoalDetailDrawer } from './GoalDetailDrawer';
import { GoalEditorDrawer } from './GoalEditorDrawer';
import { useGoals } from './useGoals';
import type { GoalWithStats } from './types';

type EditorMode =
  | { kind: 'create' }
  | { kind: 'edit'; goal: GoalWithStats };

export function GoalsPage() {
  const { goals, loading, refresh } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<GoalWithStats | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);

  const handleSaved = useCallback(() => { refresh(); }, [refresh]);

  function openEditor(goal?: GoalWithStats) {
    setSelectedGoal(null);
    setEditorMode(goal ? { kind: 'edit', goal } : { kind: 'create' });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Goals</h1>
        <Button variant="primary" onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-1.5 inline-block" />
          New Goal
        </Button>
      </div>

      <GoalSummaryBar goals={goals} loading={loading} />

      <GoalListSection goals={goals} loading={loading} onSelect={setSelectedGoal} />

      <GoalDetailDrawer
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onEdit={(g) => openEditor(g)}
      />

      <GoalEditorDrawer
        mode={editorMode}
        onClose={() => setEditorMode(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
