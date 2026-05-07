import { useCallback, useState } from 'react';
import { SpendingSection } from './SpendingSection';
import { CategoryListSection } from './CategoryListSection';
import { TagsSection } from './TagsSection';
import { CategoryEditPanel } from './CategoryEditPanel';
import { Drawer } from '../../shared/components/Drawer';
import { useCategories } from './useCategories';
import { useTags } from './useTags';
import type { PanelState, SpendingPeriod } from './types';

function panelTitle(panel: PanelState): string {
  if (!panel) return '';
  if (panel.mode === 'newCategory') return 'New Category';
  if (panel.mode === 'category') return 'Edit Category';
  if (panel.mode === 'newSubcategory') return 'New Subcategory';
  if (panel.mode === 'subcategory') return 'Edit Subcategory';
  if (panel.mode === 'newTag') return 'New Tag';
  return 'Edit Tag';
}

export function CategoriesOverviewPage() {
  const { categories, addCategory, editCategory, removeCategory } = useCategories();
  const { tags, loading: tagsLoading, addTag, editTag, removeTag } = useTags();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [panel, setPanel] = useState<PanelState>(null);

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

  const handleSaveTag = useCallback(
    async (id: string | null, name: string, color: string) => {
      if (id) {
        await editTag(id, { name, color });
      } else {
        await addTag(name, color);
      }
    },
    [addTag, editTag],
  );

  return (
    <>
      <div className="space-y-6">
        <SpendingSection
          period={period}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onPeriodChange={setPeriod}
        />
        <CategoryListSection
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onOpenPanel={setPanel}
        />
        <TagsSection
          tags={tags}
          loading={tagsLoading}
          onOpenPanel={setPanel}
        />
      </div>

      <Drawer
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panelTitle(panel)}
      >
        {panel && (
          <CategoryEditPanel
            panel={panel}
            onClose={() => setPanel(null)}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveTag={handleSaveTag}
            onDeleteTag={removeTag}
          />
        )}
      </Drawer>
    </>
  );
}
