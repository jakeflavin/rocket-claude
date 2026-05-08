import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import type { Category, PanelState } from './types';

const PRESET_COLORS = [
  '#f97316', '#fb923c', '#f59e0b', '#d97706', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#3b82f6', '#8b5cf6',
  '#ec4899', '#ef4444', '#6b7280', '#1a1915',
];

type Props = {
  panel: NonNullable<PanelState>;
  subcategories?: Category[];
  onClose: () => void;
  onSaveCategory: (id: string | null, name: string, color: string, parentId: string | null, icon?: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddSubcategory?: () => void;
  onEditSubcategory?: (sub: Category) => void;
};

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text mb-1.5">Color</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-6 w-6 rounded-full transition-transform duration-[100ms] hover:scale-110 ${value === c ? 'ring-2 ring-offset-1 ring-brand' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: value }} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
          placeholder="#rrggbb"
        />
      </div>
    </div>
  );
}

function CategoryForm({
  initial,
  isSystem,
  subcategories,
  onSave,
  onDelete,
  onClose,
  onAddSubcategory,
  onEditSubcategory,
}: {
  initial: { id: string | null; name: string; color: string; parentId: string | null };
  isSystem: boolean;
  subcategories?: Category[];
  onSave: (name: string, color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
  onAddSubcategory?: () => void;
  onEditSubcategory?: (sub: Category) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim(), color);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-text mb-1.5">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
        </div>
        <ColorPicker value={color} onChange={setColor} />

        {subcategories !== undefined && (
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-text">Subcategories</span>
              <button
                type="button"
                onClick={onAddSubcategory}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
              >
                <Plus size={12} /> New
              </button>
            </div>
            {(!subcategories || subcategories.length === 0) && (
              <p className="text-xs text-muted py-1">No subcategories.</p>
            )}
            {subcategories?.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onEditSubcategory?.(sub)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-hover transition-colors duration-[100ms] text-left"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sub.color }} />
                <span className="flex-1 truncate text-sm text-text">{sub.name}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <div className="shrink-0 border-t border-border p-4 space-y-2">
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : initial.id ? 'Save' : 'Create'}
        </Button>
        {!isSystem && onDelete && initial.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-error-border px-4 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors duration-[100ms] disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export function CategoryEditPanel({ panel, subcategories, onClose, onSaveCategory, onDeleteCategory, onAddSubcategory, onEditSubcategory }: Props) {
  if (panel.mode === 'category' || panel.mode === 'newCategory') {
    return (
      <CategoryForm
        initial={{
          id: panel.mode === 'category' ? panel.category.id : null,
          name: panel.mode === 'category' ? panel.category.name : '',
          color: panel.mode === 'category' ? panel.category.color : '#6b7280',
          parentId: null,
        }}
        isSystem={panel.mode === 'category' ? panel.category.system : false}
        subcategories={panel.mode === 'category' ? subcategories : undefined}
        onSave={(name, color) =>
          onSaveCategory(
            panel.mode === 'category' ? panel.category.id : null,
            name, color, null,
          )
        }
        onDelete={panel.mode === 'category' ? () => onDeleteCategory(panel.category.id) : undefined}
        onClose={onClose}
        onAddSubcategory={panel.mode === 'category' ? onAddSubcategory : undefined}
        onEditSubcategory={panel.mode === 'category' ? onEditSubcategory : undefined}
      />
    );
  }

  return (
    <CategoryForm
      initial={{
        id: panel.mode === 'subcategory' ? panel.category.id : null,
        name: panel.mode === 'subcategory' ? panel.category.name : '',
        color: panel.mode === 'subcategory' ? panel.category.color : panel.parent.color,
        parentId: panel.mode === 'subcategory' ? panel.parent.id : panel.parent.id,
      }}
      isSystem={panel.mode === 'subcategory' ? panel.category.system : false}
      onSave={(name, color) =>
        onSaveCategory(
          panel.mode === 'subcategory' ? panel.category.id : null,
          name, color, panel.parent.id,
        )
      }
      onDelete={panel.mode === 'subcategory' ? () => onDeleteCategory(panel.category.id) : undefined}
      onClose={onClose}
    />
  );
}
