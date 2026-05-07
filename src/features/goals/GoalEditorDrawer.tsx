import { useEffect, useState } from 'react';
import { Drawer } from '../../shared/components/Drawer';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { insertGoal, updateGoal, deleteGoal, queryAvailableAccounts } from './queries';
import type { GoalWithStats, AvailableAccount } from './types';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; goal: GoalWithStats };

type Props = {
  mode: Mode | null;
  onClose: () => void;
  onSaved: () => void;
};

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

function goalToForm(g: GoalWithStats): FormState {
  return {
    name: g.name,
    target_amount: String(g.target_amount),
    current_amount: String(g.current_amount),
    target_date: g.target_date,
    linked_account_id: g.linked_account_id ?? '',
  };
}

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

export function GoalEditorDrawer({ mode, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode?.kind === 'edit';
  const editGoal = mode?.kind === 'edit' ? mode.goal : null;
  const open = mode !== null;
  const isLinked = form.linked_account_id !== '';

  useEffect(() => {
    if (!open) return;
    setForm(editGoal ? goalToForm(editGoal) : emptyForm());
    setError(null);
    queryAvailableAccounts()
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, [open, editGoal?.id]);

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
      const payload = {
        name: form.name.trim(),
        target_amount: target,
        current_amount: isLinked ? (editGoal?.current_amount ?? 0) : current,
        target_date: form.target_date,
        linked_account_id: form.linked_account_id || null,
      };
      if (editGoal) {
        await updateGoal(editGoal.id, payload);
      } else {
        await insertGoal(payload);
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
    if (!editGoal) return;
    setDeleting(true);
    try {
      await deleteGoal(editGoal.id);
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
      title={isEdit ? 'Edit Goal' : 'New Goal'}
      width={400}
    >
      <div className="px-4 pb-6 flex flex-col gap-5">
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

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" onClick={handleSave} disabled={saving || deleting}>
            {saving ? 'Saving…' : 'Save Goal'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving || deleting}>
            Cancel
          </Button>
          {isEdit && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving || deleting}>
              {deleting ? 'Deleting…' : 'Delete Goal'}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
