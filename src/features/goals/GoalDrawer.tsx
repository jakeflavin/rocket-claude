import { useEffect, useState } from 'react';
import { Drawer } from '../../shared/components/Drawer';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Badge } from '../../shared/components/Badge';
import { RadialProgressChart } from '../../shared/components/RadialProgressChart';
import { ProjectionChart } from '../../shared/components/ProjectionChart';
import {
  insertGoal,
  updateGoal,
  deleteGoal,
  queryAvailableAccounts,
  queryGoalProjectionData,
} from './queries';
import type { GoalWithStats, GoalProjectionData, AvailableAccount } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

export type GoalDrawerMode = 'new' | GoalWithStats | null;

type Props = {
  mode: GoalDrawerMode;
  onClose: () => void;
  onSaved: () => void;
};

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// --- Shared field components ---

type FieldProps = { label: string; hint?: string; children: React.ReactNode };
function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

type FieldRowProps = { label: string; children: React.ReactNode };
function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</span>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

type InlineTextFieldProps = {
  label: string;
  displayValue: string;
  editValue: string;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  onSave: (v: string) => void;
};

function InlineTextField({
  label, displayValue, editValue, type = 'text', placeholder, disabled, hint, onSave,
}: InlineTextFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(editValue);

  useEffect(() => {
    if (!editing) setDraft(editValue);
  }, [editValue, editing]);

  function commit() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</span>
      {editing ? (
        <Input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          className="text-left text-sm text-text hover:text-brand transition-colors duration-[100ms] disabled:cursor-default disabled:hover:text-text"
          onClick={() => { if (!disabled) { setDraft(editValue); setEditing(true); } }}
        >
          {displayValue || <span className="text-muted">{placeholder ?? '—'}</span>}
        </button>
      )}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

// --- Create form ---

type FormState = {
  name: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  linked_account_id: string;
};

function emptyForm(): FormState {
  return { name: '', target_amount: '', current_amount: '0', target_date: '', linked_account_id: '' };
}

function CreateForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLinked = form.linked_account_id !== '';

  useEffect(() => {
    setForm(emptyForm());
    setError(null);
    queryAvailableAccounts()
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    const target = parseFloat(form.target_amount);
    const current = parseFloat(form.current_amount);
    if (!form.name.trim()) { setError('Please enter a goal name.'); return; }
    if (isNaN(target) || target <= 0) { setError('Please enter a valid target amount.'); return; }
    if (!isLinked && (isNaN(current) || current < 0)) { setError('Please enter a valid current amount.'); return; }
    if (!form.target_date) { setError('Please select a target date.'); return; }

    setSaving(true);
    setError(null);
    try {
      await insertGoal({
        name: form.name.trim(),
        target_amount: target,
        current_amount: isLinked ? 0 : current,
        target_date: form.target_date,
        linked_account_id: form.linked_account_id || null,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <Field label="Goal Name">
          <Input
            type="text"
            placeholder="e.g. Emergency Fund"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>

        <Field label="Target Amount">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.target_amount}
            onChange={(e) => set('target_amount', e.target.value)}
          />
        </Field>

        <Field
          label="Current Amount"
          hint={isLinked ? 'Driven by linked account balance' : undefined}
        >
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.current_amount}
            onChange={(e) => set('current_amount', e.target.value)}
            disabled={isLinked}
          />
        </Field>

        <Field label="Target Date">
          <Input
            type="date"
            value={form.target_date}
            onChange={(e) => set('target_date', e.target.value)}
          />
        </Field>

        <Field label="Linked Account (optional)">
          <Select
            value={form.linked_account_id}
            onChange={(e) => set('linked_account_id', e.target.value)}
          >
            <option value="">None</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.institution}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="shrink-0 border-t border-border p-4 space-y-2">
        {error && <p className="text-xs text-error">{error}</p>}
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Create Goal'}
        </Button>
      </div>
    </div>
  );
}

// --- Projection chart ---

function GoalProjection({ goal }: { goal: GoalWithStats }) {
  const [projData, setProjData] = useState<GoalProjectionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryGoalProjectionData(goal)
      .then((data) => { if (!cancelled) { setProjData(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [goal.id]);

  if (loading) return <div className="h-[200px] rounded-lg bg-hover animate-pulse" />;
  if (!projData) return null;
  return (
    <ProjectionChart
      historicalData={projData.historicalData}
      projectionData={projData.projectionData}
      targetValue={goal.target_amount}
      height={200}
      valueFormatter={fmt}
      emptyMessage="No projection data available."
    />
  );
}

// --- Detail / inline-edit view ---

function DetailView({
  goal: initial,
  onClose,
  onSaved,
}: {
  goal: GoalWithStats;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [goal, setGoal] = useState(initial);
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setGoal(initial); }, [initial.id]);

  useEffect(() => {
    queryAvailableAccounts()
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  async function save(patch: Parameters<typeof updateGoal>[1]) {
    await updateGoal(goal.id, patch);
    setGoal((g) => ({ ...g, ...patch }));
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteGoal(goal.id);
      onSaved();
      onClose();
    } catch {
      setDeleting(false);
    }
  }

  const isCompleted = goal.status === 'completed';
  const pct = Math.round(goal.progress * 100);
  const isLinked = goal.linked_account_id !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-4 py-5 border-b border-border flex items-center gap-4">
          <RadialProgressChart
            value={goal.progress}
            size={64}
            strokeWidth={6}
            color={isCompleted ? 'var(--color-success)' : undefined}
            label={`${pct}%`}
          />
          <div>
            <p className="text-2xl font-semibold text-text">{pct}% Saved</p>
            <p className="text-xs text-muted mt-0.5">
              {fmt(goal.current_amount)} of {fmt(goal.target_amount)}
            </p>
          </div>
        </div>

        {/* Stats + inline-editable fields */}
        <div className="px-4">
          <FieldRow label="Status">
            <Badge variant={STATUS_BADGE[goal.status]}>{STATUS_LABEL[goal.status]}</Badge>
          </FieldRow>
          <InlineTextField
            label="Goal Name"
            displayValue={goal.name}
            editValue={goal.name}
            placeholder="Goal name"
            onSave={(v) => { if (v.trim()) save({ name: v.trim() }); }}
          />
          <InlineTextField
            label="Target Amount"
            displayValue={fmt(goal.target_amount)}
            editValue={String(goal.target_amount)}
            type="number"
            placeholder="0"
            onSave={(v) => { const n = parseFloat(v); if (!isNaN(n) && n > 0) save({ target_amount: n }); }}
          />
          <InlineTextField
            label="Current Amount"
            displayValue={fmt(goal.current_amount)}
            editValue={String(goal.current_amount)}
            type="number"
            placeholder="0"
            disabled={isLinked}
            hint={isLinked ? 'Driven by linked account balance' : undefined}
            onSave={(v) => { const n = parseFloat(v); if (!isNaN(n) && n >= 0) save({ current_amount: n }); }}
          />
          <FieldRow label="Remaining">
            {isCompleted ? '—' : fmt(goal.remaining)}
          </FieldRow>
          <InlineTextField
            label="Target Date"
            displayValue={goal.target_date ? formatDate(goal.target_date) : ''}
            editValue={goal.target_date}
            type="date"
            placeholder="Select a date"
            onSave={(v) => { if (v) save({ target_date: v }); }}
          />
          <FieldRow label="Days Remaining">
            {isCompleted ? 'Completed' : `${goal.days_remaining} days`}
          </FieldRow>
          <FieldRow label="Monthly Needed">
            {isCompleted ? '—' : `${fmt(goal.monthly_needed)}/mo`}
          </FieldRow>
          <FieldRow label="Linked Account">
            <Select
              value={goal.linked_account_id ?? ''}
              onChange={(e) => save({ linked_account_id: e.target.value || null })}
            >
              <option value="">None</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.institution}</option>
              ))}
            </Select>
          </FieldRow>
        </div>

        {/* Projection chart */}
        <div className="px-4 mt-4 pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-3">
            Progress Projection
          </p>
          <GoalProjection goal={goal} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete Goal'}
        </Button>
      </div>
    </div>
  );
}

// --- Main export ---

export function GoalDrawer({ mode, onClose, onSaved }: Props) {
  const isGoal = mode !== null && mode !== 'new';
  const title = mode === 'new'
    ? 'New Goal'
    : isGoal
    ? (mode as GoalWithStats).name
    : '';

  return (
    <Drawer open={mode !== null} onClose={onClose} title={title} width={420}>
      {mode === 'new' && <CreateForm onClose={onClose} onSaved={onSaved} />}
      {isGoal && (
        <DetailView
          goal={mode as GoalWithStats}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Drawer>
  );
}
