import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Card } from '../../shared/components/Card';
import type { Category, PanelState } from './types';

type Props = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenPanel: (panel: PanelState) => void;
};

function SubcategoryRow({
  cat,
  onEdit,
}: {
  cat: Category;
  parent: Category;
  onEdit: () => void;
}) {
  return (
    <div className="group flex items-center gap-2 py-2 pl-10 pr-3 hover:bg-hover rounded-lg">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 truncate text-sm text-text">{cat.name}</span>
      <button
        type="button"
        onClick={onEdit}
        className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}

function CategoryRow({
  cat,
  subcategories,
  isSelected,
  onSelect,
  onEdit,
  onAddSubcategory,
  onOpenPanel,
}: {
  cat: Category;
  subcategories: Category[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAddSubcategory: () => void;
  onOpenPanel: (panel: PanelState) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-[100ms] hover:bg-hover ${isSelected ? 'bg-hover ring-1 ring-inset ring-brand/20' : ''}`}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-center w-5 h-5 text-subtle hover:text-text"
        >
          {subcategories.length > 0
            ? <ChevronIcon size={14} />
            : <span className="w-3.5 h-3.5 inline-block" />}
        </button>
        <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-2 min-w-0">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="flex-1 truncate text-sm font-medium text-text text-left">{cat.name}</span>
          {subcategories.length > 0 && (
            <Badge variant="default">{subcategories.length}</Badge>
          )}
        </button>
        <div className="hidden group-hover:flex items-center gap-1">
          <button
            type="button"
            onClick={onAddSubcategory}
            className="flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover"
            title="Add subcategory"
          >
            <Plus size={12} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
      {expanded && subcategories.map((sub) => (
        <SubcategoryRow
          key={sub.id}
          cat={sub}
          parent={cat}
          onEdit={() => onOpenPanel({ mode: 'subcategory', category: sub, parent: cat })}
        />
      ))}
    </div>
  );
}

export function CategoryListSection({ categories, selectedCategoryId, onSelectCategory, onOpenPanel }: Props) {
  const { parents, childMap } = useMemo(() => {
    const parents = categories.filter((c) => c.parent_id == null);
    const childMap: Record<string, Category[]> = {};
    for (const c of categories) {
      if (c.parent_id) {
        childMap[c.parent_id] ??= [];
        childMap[c.parent_id].push(c);
      }
    }
    return { parents, childMap };
  }, [categories]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text">Categories</h2>
        <button
          type="button"
          onClick={() => onOpenPanel({ mode: 'newCategory' })}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
        >
          <Plus size={12} /> New
        </button>
      </div>
      {parents.length === 0 && (
        <p className="text-sm text-muted py-4 text-center">No categories yet.</p>
      )}
      <div className="space-y-0.5">
        {parents.map((cat) => (
          <CategoryRow
            key={cat.id}
            cat={cat}
            subcategories={childMap[cat.id] ?? []}
            isSelected={selectedCategoryId === cat.id}
            onSelect={() => onSelectCategory(selectedCategoryId === cat.id ? null : cat.id)}
            onEdit={() => onOpenPanel({ mode: 'category', category: cat })}
            onAddSubcategory={() => onOpenPanel({ mode: 'newSubcategory', parent: cat })}
            onOpenPanel={onOpenPanel}
          />
        ))}
      </div>
    </Card>
  );
}
