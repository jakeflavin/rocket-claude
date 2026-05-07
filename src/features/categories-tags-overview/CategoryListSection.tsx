import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Card } from '../../shared/components/Card';
import type { Category, PanelState } from './types';

type Props = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenPanel: (panel: PanelState) => void;
};

function SubcategoryRow({ cat, parent, onEdit }: { cat: Category; parent: Category; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg py-2 pl-9 pr-2 hover:bg-hover transition-colors duration-[100ms]">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 truncate text-sm text-text">{cat.name}</span>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover transition-colors duration-[100ms]"
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
  const [expanded, setExpanded] = useState(false);
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div className={`flex items-center gap-2 rounded-lg py-2 pr-2 transition-colors duration-[100ms] hover:bg-hover ${isSelected ? 'bg-hover ring-1 ring-inset ring-brand/20' : ''}`}>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-7 shrink-0 items-center justify-center text-subtle hover:text-text"
        >
          {subcategories.length > 0 ? <ChevronIcon size={14} /> : <span className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-2 min-w-0">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="flex-1 truncate text-sm font-medium text-text text-left">{cat.name}</span>
          {subcategories.length > 0 && <Badge variant="default">{subcategories.length}</Badge>}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAddSubcategory}
            className="flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover transition-colors duration-[100ms]"
            title="Add subcategory"
          >
            <Plus size={12} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center w-6 h-6 rounded text-muted hover:text-text hover:bg-hover transition-colors duration-[100ms]"
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
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text">Categories</h2>
        <button
          type="button"
          onClick={() => onOpenPanel({ mode: 'newCategory' })}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
        >
          <Plus size={12} /> New
        </button>
      </div>
      <div className="p-2 space-y-0.5">
        {parents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No categories yet.</p>
        ) : (
          parents.map((cat) => (
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
          ))
        )}
      </div>
    </Card>
  );
}
