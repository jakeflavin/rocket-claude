import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import type { Category } from '../categories-tags-overview/types';
import type { Tag } from '../categories-tags-overview/types';
import type { Rule, RulePatch } from './types';

type Props = {
  rule: Rule | null;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onSave: (id: string | null, patch: RulePatch & { value: string; category_id: string; field: Rule['field']; operator: Rule['operator'] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const FIELD_OPTIONS = [
  { value: 'merchant', label: 'Merchant' },
  { value: 'description', label: 'Description' },
];

const OPERATOR_OPTIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts_with', label: 'Starts With' },
];

const OPERATOR_LABELS: Record<Rule['operator'], string> = {
  contains: 'contains',
  equals: 'equals',
  starts_with: 'starts with',
};

export function RuleEditorPanel({ rule, categories, tags, onClose, onSave, onDelete }: Props) {
  const [field, setField] = useState<Rule['field']>(rule?.field ?? 'merchant');
  const [operator, setOperator] = useState<Rule['operator']>(rule?.operator ?? 'contains');
  const [value, setValue] = useState(rule?.value ?? '');
  const [categoryId, setCategoryId] = useState(rule?.category_id ?? '');
  const [applyTag, setApplyTag] = useState<string>(rule?.apply_tag ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setField(rule?.field ?? 'merchant');
    setOperator(rule?.operator ?? 'contains');
    setValue(rule?.value ?? '');
    setCategoryId(rule?.category_id ?? '');
    setApplyTag(rule?.apply_tag ?? '');
    setError(null);
  }, [rule?.id]);

  const topLevelCategories = categories.filter((c) => c.parent_id == null);
  const allCategories = categories;

  async function handleSave() {
    if (!value.trim()) { setError('Match value is required.'); return; }
    if (!categoryId) { setError('Category is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(rule?.id ?? null, {
        field,
        operator,
        value: value.trim(),
        category_id: categoryId,
        apply_tag: applyTag || null,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!rule) return;
    setSaving(true);
    try {
      await onDelete(rule.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setSaving(false);
    }
  }

  const previewText = value.trim()
    ? `When ${field} ${OPERATOR_LABELS[operator]} "${value.trim()}" → assign to ${
        allCategories.find((c) => c.id === categoryId)?.name ?? '…'
      }${applyTag ? ` + tag "${tags.find((t) => t.id === applyTag)?.name ?? applyTag}"` : ''}`
    : 'Fill in the fields above to preview this rule.';

  return (
    <Card className="sticky top-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text">{rule ? 'Edit Rule' : 'New Rule'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-text transition-colors duration-[100ms]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[13px] font-medium text-text mb-1.5">Field</label>
            <Select value={field} onChange={(e) => setField(e.target.value as Rule['field'])}>
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text mb-1.5">Operator</label>
            <Select value={operator} onChange={(e) => setOperator(e.target.value as Rule['operator'])}>
              {OPERATOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text mb-1.5">Match Value</label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Whole Foods" />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text mb-1.5">Assign Category</label>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select category…</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_id ? `  ${c.name}` : c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text mb-1.5">Apply Tag (optional)</label>
          <Select value={applyTag} onChange={(e) => setApplyTag(e.target.value)}>
            <option value="">No tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-lg bg-canvas border border-border px-3 py-2">
          <p className="text-xs text-muted">{previewText}</p>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        </div>

        {rule && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-error-border px-4 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors duration-[100ms]"
          >
            <Trash2 size={14} /> Delete Rule
          </button>
        )}
      </div>
    </Card>
  );
}
