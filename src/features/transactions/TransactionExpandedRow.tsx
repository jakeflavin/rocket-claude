import { useState, type ReactNode } from 'react';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { updateTransaction, deleteTransaction, type TransactionPatch } from './queries';
import type { Transaction } from './types';
import type { FilterOption } from './useFilterOptions';

// ── Shared layout ────────────────────────────────────────────────────────────

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-full' : ''}>
      <dt className="text-xs font-medium uppercase tracking-[0.04em] text-subtle">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

const Dash = () => <span className="text-subtle">—</span>;

// ── Inline-edit primitives ───────────────────────────────────────────────────

function EditableText({
  value,
  placeholder = 'Add…',
  multiline = false,
  onSave,
}: {
  value: string | null;
  placeholder?: string;
  multiline?: boolean;
  onSave: (v: string | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  async function commit() {
    const trimmed = draft.trim();
    const next = trimmed === '' ? null : trimmed;
    if (next === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(next);
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setDraft(value ?? '');
    setEditing(false);
  }

  if (editing) {
    const cls =
      'w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text ' +
      'focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50';
    return multiline ? (
      <textarea
        autoFocus
        rows={3}
        className={cls}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
        disabled={saving}
      />
    ) : (
      <input
        autoFocus
        type="text"
        className={cls}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') cancel();
        }}
        disabled={saving}
      />
    );
  }

  return (
    <button
      type="button"
      className="group flex items-start gap-1 text-left"
      onClick={() => { setDraft(value ?? ''); setEditing(true); }}
    >
      <span className={`text-sm ${value ? 'text-text' : 'italic text-subtle'}`}>
        {value ?? placeholder}
      </span>
      <Pencil className="mt-0.5 h-3 w-3 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function EditableSelect({
  value,
  displayValue,
  options,
  onSave,
}: {
  value: string | null;
  displayValue: string;
  options: FilterOption[];
  onSave: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChange(id: string) {
    if (id === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(id);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <select
        autoFocus
        className="rounded border border-border bg-surface px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
        defaultValue={value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setEditing(false)}
        disabled={saving}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      className="group flex items-center gap-1 text-left"
      onClick={() => setEditing(true)}
    >
      <span className="text-sm text-text">{displayValue}</span>
      <Pencil className="h-3 w-3 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function TagsField({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string | null) => Promise<void>;
}) {
  const tags = value ? value.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  async function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setSaving(true);
    await onSave(next.length > 0 ? next.join(', ') : null);
    setSaving(false);
  }

  async function addTag() {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) { setAdding(false); setDraft(''); return; }
    setSaving(true);
    await onSave([...tags, trimmed].join(', '));
    setSaving(false);
    setDraft('');
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 rounded-full bg-hover px-2 py-0.5 text-xs text-text"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            disabled={saving}
            className="text-subtle hover:text-text disabled:opacity-40"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={addTag}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
            if (e.key === 'Escape') { setAdding(false); setDraft(''); }
          }}
          placeholder="tag name"
          disabled={saving}
          className="w-24 rounded border border-border bg-surface px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-subtle transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="h-3 w-3" />
          Add tag
        </button>
      )}
    </div>
  );
}

function ToggleField({
  checked,
  label,
  onSave,
}: {
  checked: boolean;
  label: string;
  onSave: (v: boolean) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function handleChange(v: boolean) {
    setSaving(true);
    await onSave(v);
    setSaving(false);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={saving}
        className="h-4 w-4 cursor-pointer rounded border-border accent-brand disabled:opacity-50"
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}

// ── Formatters ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Main component ───────────────────────────────────────────────────────────

type Props = {
  row: Transaction;
  categories: FilterOption[];
  onMutated: () => void;
};

export function TransactionExpandedRow({ row, categories, onMutated }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(patch: TransactionPatch) {
    await updateTransaction(row.id, patch);
    onMutated();
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteTransaction(row.id);
    onMutated();
  }

  const categoryDisplay =
    categories.find((c) => c.id === row.category_id)?.name ?? row.category;

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 pt-1 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Merchant">
          <EditableText
            value={row.merchant}
            onSave={(v) => save({ merchant: v ?? '' })}
          />
        </Field>

        <Field label="Description">
          <EditableText value={row.description} onSave={(v) => save({ description: v })} />
        </Field>

        <Field label="Category">
          <EditableSelect
            value={row.category_id}
            displayValue={categoryDisplay}
            options={categories}
            onSave={(id) => save({ category_id: id })}
          />
        </Field>

        <Field label="Type">
          {row.transaction_type ? (
            <span className="text-sm capitalize text-text">{row.transaction_type}</span>
          ) : (
            <Dash />
          )}
        </Field>

        <Field label="Authorized Date">
          <span className="text-sm text-text">
            {row.authorized_date ? formatDate(row.authorized_date) : <Dash />}
          </span>
        </Field>

        <Field label="Transfer">
          {row.is_transfer ? (
            <Badge variant="info">Yes</Badge>
          ) : (
            <span className="text-sm text-subtle">No</span>
          )}
        </Field>

        <Field label="Transfer Group">
          <span className="text-sm text-text">{row.transfer_group ?? <Dash />}</span>
        </Field>

        <Field label="External ID">
          {row.external_id ? (
            <span className="font-mono text-xs text-text">{row.external_id}</span>
          ) : (
            <Dash />
          )}
        </Field>

        <Field label="Location">
          <span className="text-sm text-text">{row.location ?? <Dash />}</span>
        </Field>

        <Field label="Imported">
          <span className="text-sm text-text">
            {row.created_at ? formatDateTime(row.created_at) : <Dash />}
          </span>
        </Field>

        <Field label="Recurring">
          <ToggleField
            checked={row.is_recurring}
            label="Mark as recurring"
            onSave={(v) => save({ is_recurring: v })}
          />
        </Field>

        <Field label="Analytics">
          <ToggleField
            checked={row.exclude_from_analytics}
            label="Exclude from analytics"
            onSave={(v) => save({ exclude_from_analytics: v })}
          />
        </Field>

        <Field label="Notes" wide>
          <EditableText
            value={row.notes}
            placeholder="Add a note…"
            multiline
            onSave={(v) => save({ notes: v })}
          />
        </Field>

        <Field label="Tags" wide>
          <TagsField value={row.tags} onSave={(v) => save({ tags: v })} />
        </Field>
      </dl>

      <div className="flex items-center justify-end border-t border-border pt-3">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Delete this transaction?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-error hover:bg-error-bg"
          >
            <Trash2 className="h-4 w-4" />
            Delete transaction
          </Button>
        )}
      </div>
    </div>
  );
}
