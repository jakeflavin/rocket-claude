import { useEffect, useState } from 'react';
import { Drawer } from '../../shared/components/Drawer';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Toggle } from '../../shared/components/Toggle';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { Badge } from '../../shared/components/Badge';
import { GroupedBarChart } from '../../shared/components/GroupedBarChart';
import { useBudgetHistory } from './useBudgetHistory';
import {
  insertBudget,
  updateBudget,
  deleteBudget,
  queryAvailableCategories,
} from './queries';
import type { BudgetWithStats, BudgetPeriod, AvailableCategory } from './types';
import { STATUS_LABEL, STATUS_BADGE } from './types';

export type BudgetDrawerMode = 'new' | BudgetWithStats | null;

type Props = {
  mode: BudgetDrawerMode;
  onClose: () => void;
  onSaved: () => void;
};

const PERIOD_SEGMENTS: { value: BudgetPeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'annual', label: 'Annual' },
];

const PERIOD_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  annual: 'Annual',
};

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// --- Shared field components ---

type FieldProps = { label: string; children: React.ReactNode };
function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
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
  onSave: (v: string) => void;
};

function InlineTextField({ label, displayValue, editValue, type = 'text', placeholder, onSave }: InlineTextFieldProps) {
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
          className="text-left text-sm text-text hover:text-brand transition-colors duration-[100ms]"
          onClick={() => { setDraft(editValue); setEditing(true); }}
        >
          {displayValue || <span className="text-muted">{placeholder ?? '—'}</span>}
        </button>
      )}
    </div>
  );
}

// --- Create form ---

type FormState = {
  category_id: string;
  amount: string;
  period: BudgetPeriod;
  rollover: boolean;
  start_date: string;
  end_date: string;
};

function emptyForm(): FormState {
  return {
    category_id: '',
    amount: '',
    period: 'monthly',
    rollover: false,
    start_date: todayStr(),
    end_date: '',
  };
}

function CreateForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [categories, setCategories] = useState<AvailableCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(emptyForm());
    setError(null);
    queryAvailableCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.category_id) { setError('Please select a category.'); return; }
    if (isNaN(amount) || amount <= 0) { setError('Please enter a valid amount.'); return; }

    setSaving(true);
    setError(null);
    try {
      await insertBudget({
        category_id: form.category_id,
        amount,
        period: form.period,
        rollover: form.rollover,
        start_date: form.start_date || todayStr(),
        end_date: form.end_date || null,
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
        <Field label="Category">
          <Select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Amount">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
        </Field>

        <Field label="Period">
          <SegmentedControl<BudgetPeriod>
            segments={PERIOD_SEGMENTS}
            value={form.period}
            onChange={(v) => set('period', v)}
          />
        </Field>

        <Field label="Rollover unused budget">
          <div className="flex items-center gap-3">
            <Toggle checked={form.rollover} onChange={(v) => set('rollover', v)} />
            <span className="text-sm text-muted">{form.rollover ? 'Enabled' : 'Disabled'}</span>
          </div>
        </Field>

        <Field label="Start Date">
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
          />
        </Field>

        <Field label="End Date (optional)">
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
          />
        </Field>
      </div>

      <div className="shrink-0 border-t border-border p-4 space-y-2">
        {error && <p className="text-xs text-error">{error}</p>}
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Create Budget'}
        </Button>
      </div>
    </div>
  );
}

// --- History chart ---

function HistoryChart({ budgetId }: { budgetId: string }) {
  const { history, loading } = useBudgetHistory(budgetId);

  const series = [
    {
      key: 'budget',
      label: 'Budget',
      color: 'var(--color-brand)',
      data: history.map((p) => ({ label: p.label, value: p.budget })),
    },
    {
      key: 'spent',
      label: 'Spent',
      color: 'var(--color-error)',
      data: history.map((p) => ({ label: p.label, value: p.spent })),
    },
  ];

  if (loading) return <div className="h-[180px] rounded-lg bg-hover animate-pulse" />;
  return (
    <GroupedBarChart
      series={series}
      height={180}
      valueFormatter={fmt}
      emptyMessage="No transaction history found."
    />
  );
}

// --- Detail / inline-edit view ---

function DetailView({
  budget: initial,
  onClose,
  onSaved,
}: {
  budget: BudgetWithStats;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [budget, setBudget] = useState(initial);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setBudget(initial); }, [initial.id]);

  async function save(patch: Parameters<typeof updateBudget>[1]) {
    await updateBudget(budget.id, patch);
    setBudget((b) => ({ ...b, ...patch }));
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBudget(budget.id);
      onSaved();
      onClose();
    } catch {
      setDeleting(false);
    }
  }

  const isOver = budget.status === 'over_budget';

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-4 py-5 border-b border-border flex items-center gap-3">
          <span
            className="inline-block w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: budget.category_color }}
          />
          <div>
            <p className="text-2xl font-semibold text-text">{fmt(budget.spent)}</p>
            <p className="text-xs text-muted mt-0.5">
              of {fmt(budget.amount)} {PERIOD_LABEL[budget.period]?.toLowerCase() ?? budget.period} budget
            </p>
          </div>
        </div>

        {/* Stats + inline-editable fields */}
        <div className="px-4">
          <FieldRow label="Status">
            <Badge variant={STATUS_BADGE[budget.status]}>{STATUS_LABEL[budget.status]}</Badge>
          </FieldRow>
          <FieldRow label="Spent">{fmt(budget.spent)}</FieldRow>
          <FieldRow label={isOver ? 'Overspent' : 'Remaining'}>
            <span className={isOver ? 'text-error' : undefined}>
              {fmt(Math.abs(budget.remaining))}
            </span>
          </FieldRow>
          <InlineTextField
            label="Budget Limit"
            displayValue={fmt(budget.amount)}
            editValue={String(budget.amount)}
            type="number"
            placeholder="0"
            onSave={(v) => {
              const n = parseFloat(v);
              if (!isNaN(n) && n > 0) save({ amount: n });
            }}
          />
          <FieldRow label="Period">
            <SegmentedControl<BudgetPeriod>
              segments={PERIOD_SEGMENTS}
              value={budget.period}
              onChange={(v) => save({ period: v })}
            />
          </FieldRow>
          <FieldRow label="Rollover">
            <div className="flex items-center gap-3">
              <Toggle checked={budget.rollover} onChange={(v) => save({ rollover: v })} />
              <span className="text-sm text-muted">{budget.rollover ? 'Enabled' : 'Disabled'}</span>
            </div>
          </FieldRow>
          <InlineTextField
            label="Start Date"
            displayValue={budget.start_date}
            editValue={budget.start_date}
            type="date"
            onSave={(v) => { if (v) save({ start_date: v }); }}
          />
          <InlineTextField
            label="End Date"
            displayValue={budget.end_date ?? ''}
            editValue={budget.end_date ?? ''}
            type="date"
            placeholder="No end date"
            onSave={(v) => save({ end_date: v || null })}
          />
        </div>

        {/* 6-month history */}
        <div className="px-4 mt-4 pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-3">
            6-Month History
          </p>
          <HistoryChart budgetId={budget.id} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete Budget'}
        </Button>
      </div>
    </div>
  );
}

// --- Main export ---

export function BudgetDrawer({ mode, onClose, onSaved }: Props) {
  const isBudget = mode !== null && mode !== 'new';
  const title = mode === 'new'
    ? 'New Budget'
    : isBudget
    ? (mode as BudgetWithStats).category_name
    : '';

  return (
    <Drawer open={mode !== null} onClose={onClose} title={title} width={420}>
      {mode === 'new' && <CreateForm onClose={onClose} onSaved={onSaved} />}
      {isBudget && (
        <DetailView
          budget={mode as BudgetWithStats}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Drawer>
  );
}
