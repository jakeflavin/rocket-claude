import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Card } from '../../shared/components/Card';
import type { Category, PanelState } from './types';
import { Button } from '../../shared/components/Button';

type Props = {
  categories: Category[];
  onOpenPanel: (panel: PanelState) => void;
};

function SubcategoryRow({ cat, parent, onClick }: { cat: Category; parent: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg py-2 pl-9 pr-2 hover:bg-hover transition-colors duration-[100ms] text-left"
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 truncate text-sm text-text">{cat.name}</span>
    </button>
  );
}

function CategoryRow({
  cat,
  subcategories,
  onClick,
  onOpenPanel,
}: {
  cat: Category;
  subcategories: Category[];
  onClick: () => void;
  onOpenPanel: (panel: PanelState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg py-2 pr-2 transition-colors duration-[100ms] hover:bg-hover">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-7 shrink-0 items-center justify-center text-subtle hover:text-text"
        >
          {subcategories.length > 0 ? <ChevronIcon size={14} /> : <span className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={onClick} className="flex flex-1 items-center gap-2 min-w-0">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="flex-1 truncate text-sm font-medium text-text text-left">{cat.name}</span>
          {subcategories.length > 0 && <Badge variant="default">{subcategories.length}</Badge>}
        </button>
      </div>
      {expanded && subcategories.map((sub) => (
        <SubcategoryRow
          key={sub.id}
          cat={sub}
          parent={cat}
          onClick={() => onOpenPanel({ mode: 'subcategory', category: sub, parent: cat })}
        />
      ))}
    </div>
  );
}

export function CategoryListSection({ categories, onOpenPanel }: Props) {
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
        <Button variant="primary" size="sm" onClick={() => onOpenPanel({ mode: 'newCategory' })}> 
          <Plus size={12} /> New
        </Button>
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
              onClick={() => onOpenPanel({ mode: 'category', category: cat })}
              onOpenPanel={onOpenPanel}
            />
          ))
        )}
      </div>
    </Card>
  );
}
