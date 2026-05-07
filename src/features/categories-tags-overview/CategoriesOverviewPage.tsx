import { useCallback, useState } from 'react';
import { SpendingSection } from './SpendingSection';
import { CategoryListSection } from './CategoryListSection';
import { TagsSection } from './TagsSection';
import { UncategorizedSection } from './UncategorizedSection';
import { CategoryEditPanel } from './CategoryEditPanel';
import { useCategories } from './useCategories';
import { useTags } from './useTags';
import type { PanelState, SpendingPeriod } from './types';

export function CategoriesOverviewPage() {
  const { categories, loading: catsLoading, addCategory, editCategory, removeCategory } = useCategories();
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
    <div className="flex min-h-0 gap-6">
      <div className="flex-1 min-w-0 space-y-6">
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
        <UncategorizedSection categories={categories} />
      </div>

      {panel && (
        <div className="w-[300px] shrink-0">
          <CategoryEditPanel
            panel={panel}
            onClose={() => setPanel(null)}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveTag={handleSaveTag}
            onDeleteTag={removeTag}
          />
        </div>
      )}
    </div>
  );
}
