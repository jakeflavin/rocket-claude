import { useCallback, useState } from 'react';
import { FAB } from '../../shared/components/FAB';
import { GoalSummaryBar } from './GoalSummaryBar';
import { GoalListSection } from './GoalListSection';
import { GoalDrawer } from './GoalDrawer';
import { useGoals } from './useGoals';
import type { GoalWithStats } from './types';
import type { GoalDrawerMode } from './GoalDrawer';

export function GoalsPage() {
  const { goals, loading, refresh } = useGoals();
  const [drawerMode, setDrawerMode] = useState<GoalDrawerMode>(null);

  const handleSaved = useCallback(() => { refresh(); }, [refresh]);

  function openGoal(goal: GoalWithStats) {
    setDrawerMode(goal);
  }

  return (
    <div className="flex flex-col gap-4">
      <GoalSummaryBar goals={goals} loading={loading} />

      <GoalListSection goals={goals} loading={loading} onSelect={openGoal} />

      <GoalDrawer
        mode={drawerMode}
        onClose={() => setDrawerMode(null)}
        onSaved={handleSaved}
      />

      <FAB onClick={() => setDrawerMode('new')} label="New Goal" text="New Goal" />
    </div>
  );
}
