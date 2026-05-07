import { Plus, Pencil } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import type { Tag, PanelState } from './types';

type Props = {
  tags: Tag[];
  loading: boolean;
  onOpenPanel: (panel: PanelState) => void;
};

function TagRow({ tag, onEdit }: { tag: Tag; onEdit: () => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-hover transition-colors duration-[100ms]">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
      <span className="flex-1 text-sm text-text">{tag.name}</span>
      {tag.usage_count > 0 && (
        <Badge variant="default">{tag.usage_count}</Badge>
      )}
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

export function TagsSection({ tags, loading, onOpenPanel }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text">Tags</h2>
        <button
          type="button"
          onClick={() => onOpenPanel({ mode: 'newTag' })}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
        >
          <Plus size={12} /> New
        </button>
      </div>
      {loading && (
        <div className="space-y-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-9 animate-pulse rounded-lg bg-hover" />
          ))}
        </div>
      )}
      {!loading && tags.length === 0 && (
        <p className="text-sm text-muted py-4 text-center">No tags yet.</p>
      )}
      {!loading && tags.length > 0 && (
        <div className="space-y-0.5">
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              onEdit={() => onOpenPanel({ mode: 'tag', tag })}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
