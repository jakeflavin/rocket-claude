import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import type { PanelState } from './types';

const PRESET_COLORS = [
  '#f97316', '#fb923c', '#f59e0b', '#d97706', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#3b82f6', '#8b5cf6',
  '#ec4899', '#ef4444', '#6b7280', '#1a1915',
];

type Props = {
  panel: NonNullable<PanelState>;
  onClose: () => void;
  onSaveCategory: (id: string | null, name: string, color: string, parentId: string | null, icon?: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onSaveTag: (id: string | null, name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
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
  title,
  initial,
  isSystem,
  onSave,
  onDelete,
  onClose,
}: {
  title: string;
  initial: { id: string | null; name: string; color: string; parentId: string | null };
  isSystem: boolean;
  onSave: (name: string, color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
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
    <div className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-text mb-1.5">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
      </div>
      <ColorPicker value={color} onChange={setColor} />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
      </div>
      {!isSystem && onDelete && initial.id && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-error-border px-4 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors duration-[100ms]"
        >
          <Trash2 size={14} /> Delete
        </button>
      )}
    </div>
  );
}

function TagForm({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial: { id: string | null; name: string; color: string };
  onSave: (name: string, color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-text mb-1.5">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" />
      </div>
      <ColorPicker value={color} onChange={setColor} />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
      </div>
      {onDelete && initial.id && (
        <button
          type="button"
          onClick={async () => { setSaving(true); try { await onDelete?.(); onClose(); } finally { setSaving(false); } }}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-error-border px-4 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors duration-[100ms]"
        >
          <Trash2 size={14} /> Delete
        </button>
      )}
    </div>
  );
}

export function CategoryEditPanel({ panel, onClose, onSaveCategory, onDeleteCategory, onSaveTag, onDeleteTag }: Props) {
  const title =
    panel.mode === 'newCategory' ? 'New Category' :
    panel.mode === 'category' ? 'Edit Category' :
    panel.mode === 'newSubcategory' ? 'New Subcategory' :
    panel.mode === 'subcategory' ? 'Edit Subcategory' :
    panel.mode === 'newTag' ? 'New Tag' :
    'Edit Tag';

  return (
    <Card className="sticky top-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-4">

      {(panel.mode === 'category' || panel.mode === 'newCategory') && (
        <CategoryForm
          title={title}
          initial={{
            id: panel.mode === 'category' ? panel.category.id : null,
            name: panel.mode === 'category' ? panel.category.name : '',
            color: panel.mode === 'category' ? panel.category.color : '#6b7280',
            parentId: null,
          }}
          isSystem={panel.mode === 'category' ? panel.category.system : false}
          onSave={(name, color) =>
            onSaveCategory(
              panel.mode === 'category' ? panel.category.id : null,
              name, color, null,
            )
          }
          onDelete={panel.mode === 'category' ? () => onDeleteCategory(panel.category.id) : undefined}
          onClose={onClose}
        />
      )}

      {(panel.mode === 'subcategory' || panel.mode === 'newSubcategory') && (
        <CategoryForm
          title={title}
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
      )}

      {(panel.mode === 'tag' || panel.mode === 'newTag') && (
        <TagForm
          initial={{
            id: panel.mode === 'tag' ? panel.tag.id : null,
            name: panel.mode === 'tag' ? panel.tag.name : '',
            color: panel.mode === 'tag' ? panel.tag.color : '#6b7280',
          }}
          onSave={(name, color) => onSaveTag(panel.mode === 'tag' ? panel.tag.id : null, name, color)}
          onDelete={panel.mode === 'tag' ? () => onDeleteTag(panel.tag.id) : undefined}
          onClose={onClose}
        />
      )}
      </div>
    </Card>
  );
}
