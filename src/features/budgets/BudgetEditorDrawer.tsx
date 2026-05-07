import { useEffect, useState } from 'react';
import { Drawer } from '../../shared/components/Drawer';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Toggle } from '../../shared/components/Toggle';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { insertBudget, updateBudget, deleteBudget, queryAvailableCategories } from './queries';
import type { BudgetWithStats, BudgetPeriod, AvailableCategory } from './types';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; budget: BudgetWithStats };

type Props = {
  mode: Mode | null;
  onClose: () => void;
  onSaved: () => void;
};

const PERIOD_SEGMENTS: { value: BudgetPeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'annual', label: 'Annual' },
];

type FormState = {
  category_id: string;
  amount: string;
  period: BudgetPeriod;
  rollover: boolean;
  start_date: string;
  end_date: string;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): FormState {
  return { category_id: '', amount: '', period: 'monthly', rollover: false, start_date: todayStr(), end_date: '' };
}

function budgetToForm(b: BudgetWithStats): FormState {
  return {
    category_id: b.category_id,
    amount: String(b.amount),
    period: b.period,
    rollover: b.rollover,
    start_date: b.start_date,
    end_date: b.end_date ?? '',
  };
}

type FieldProps = { label: string; children: React.ReactNode };

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

export function BudgetEditorDrawer({ mode, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [categories, setCategories] = useState<AvailableCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode?.kind === 'edit';
  const editBudget = mode?.kind === 'edit' ? mode.budget : null;
  const open = mode !== null;

  useEffect(() => {
    if (!open) return;
    setForm(editBudget ? budgetToForm(editBudget) : emptyForm());
    setError(null);

    const excludeId = editBudget?.id;
    queryAvailableCategories(excludeId)
      .then((cats) => {
        setCategories(
          editBudget
            ? [{ id: editBudget.category_id, name: editBudget.category_name, color: editBudget.category_color }, ...cats]
            : cats,
        );
      })
      .catch(() => setCategories([]));
  }, [open, editBudget?.id]);

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
      const payload = {
        category_id: form.category_id,
        amount,
        period: form.period,
        rollover: form.rollover,
        start_date: form.start_date || todayStr(),
        end_date: form.end_date || null,
      };
      if (editBudget) {
        await updateBudget(editBudget.id, payload);
      } else {
        await insertBudget(payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editBudget) return;
    setDeleting(true);
    try {
      await deleteBudget(editBudget.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Budget' : 'New Budget'}
      width={400}
    >
      <div className="px-4 pb-6 flex flex-col gap-5">
        <Field label="Category">
          <Select
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
            disabled={isEdit}
          >
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

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" onClick={handleSave} disabled={saving || deleting}>
            {saving ? 'Saving…' : 'Save Budget'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving || deleting}>
            Cancel
          </Button>
          {isEdit && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving || deleting}>
              {deleting ? 'Deleting…' : 'Delete Budget'}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
