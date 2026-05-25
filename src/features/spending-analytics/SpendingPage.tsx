import { useCallback, useState } from 'react';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { Drawer } from '../../shared/components/Drawer';
import { SpendingSummaryBar } from './SpendingSummaryBar';
import { SpendingTrendsSection } from './SpendingTrendsSection';
import { IncomeExpensesSection } from './IncomeExpensesSection';
import { CashFlowSection } from './CashFlowSection';
import { MerchantSpendingSection } from './MerchantSpendingSection';
import { SpendingSection } from '../categories-tags-overview/SpendingSection';
import { CategoryListSection } from '../categories-tags-overview/CategoryListSection';
import { CategoryEditPanel } from '../categories-tags-overview/CategoryEditPanel';
import { useCategories } from '../categories-tags-overview/useCategories';
import type { SpendingPeriod as AnalyticsPeriod } from './types';
import type { SpendingPeriod as CategoryPeriod, PanelState } from '../categories-tags-overview/types';

function panelTitle(panel: PanelState): string {
  if (!panel) return '';
  if (panel.mode === 'newCategory') return 'New Category';
  if (panel.mode === 'category') return 'Edit Category';
  if (panel.mode === 'newSubcategory') return 'New Subcategory';
  if (panel.mode === 'subcategory') return 'Edit Subcategory';
  if (panel.mode === 'newTag') return 'New Tag';
  return 'Edit Tag';
}

const ANALYTICS_PERIOD_SEGMENTS = [
  { value: 'monthly' as AnalyticsPeriod, label: 'Monthly' },
  { value: 'yearly' as AnalyticsPeriod, label: 'Yearly' },
];

export function SpendingPage() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('monthly');
  const [categoryPeriod, setCategoryPeriod] = useState<CategoryPeriod>('month');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);

  const { categories, addCategory, editCategory, removeCategory } = useCategories();

  const handleSaveCategory = useCallback(
    async (id: string | null, name: string, color: string, parentId: string | null, icon?: string) => {
      if (id) {
        await editCategory(id, { name, color, icon: icon ?? null });
      } else {
        await addCategory(name, color, parentId, icon);
      }
    },
    [addCategory, editCategory],
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      await removeCategory(id);
    },
    [removeCategory, selectedCategoryId],
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <SegmentedControl<AnalyticsPeriod>
            segments={ANALYTICS_PERIOD_SEGMENTS}
            value={analyticsPeriod}
            onChange={setAnalyticsPeriod}
          />
        </div>

        <SpendingSummaryBar />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SpendingTrendsSection period={analyticsPeriod} />
          <IncomeExpensesSection period={analyticsPeriod} />
        </div>

        <CashFlowSection period={analyticsPeriod} />

        <MerchantSpendingSection period={analyticsPeriod} />

        <div className="border-t border-border pt-2" />

        <SpendingSection
          period={categoryPeriod}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onPeriodChange={setCategoryPeriod}
        />

        <CategoryListSection categories={categories} onOpenPanel={setPanel} />
      </div>

      <Drawer
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panelTitle(panel)}
      >
        {panel && (
          <CategoryEditPanel
            panel={panel}
            subcategories={panel.mode === 'category' ? categories.filter((c) => c.parent_id === panel.category.id) : undefined}
            onClose={() => setPanel(null)}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddSubcategory={panel.mode === 'category' ? () => setPanel({ mode: 'newSubcategory', parent: panel.category }) : undefined}
            onEditSubcategory={panel.mode === 'category' ? (sub) => setPanel({ mode: 'subcategory', category: sub, parent: panel.category }) : undefined}
          />
        )}
      </Drawer>
    </>
  );
}
