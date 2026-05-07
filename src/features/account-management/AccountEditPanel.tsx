import { useEffect, useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { updateAccount } from './queries';
import type { Account, AccountPatch } from './types';

type Props = {
  account: Account;
  onSaved: () => void;
};

const SUBTYPES_BY_TYPE: Record<string, string[]> = {
  depository: ['checking', 'savings'],
  credit: ['credit card'],
  investment: ['brokerage'],
};

export function AccountEditPanel({ account, onSaved }: Props) {
  const [draft, setDraft] = useState<AccountPatch>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraft({});
    setSaveError(null);
  }, [account.id]);

  function get<K extends keyof Account>(key: K): Account[K] {
    return key in draft ? (draft as Account)[key] : account[key];
  }

  const currentType = (get('type') as string) ?? account.type;
  const validSubtypes = SUBTYPES_BY_TYPE[currentType] ?? [];

  async function handleSave() {
    if (Object.keys(draft).length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateAccount(account.id, draft);
      setDraft({});
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-text">Edit Account</h3>
        <p className="mt-0.5 text-xs text-muted">{account.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Account Name</label>
          <Input
            value={(get('name') as string) ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Institution</label>
          <Input
            value={(get('institution') as string) ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, institution: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Type</label>
          <Select
            value={currentType}
            onChange={(e) =>
              setDraft((d) => {
                const newType = e.target.value as Account['type'];
                const defaultSubtype = SUBTYPES_BY_TYPE[newType]?.[0] as Account['subtype'];
                return { ...d, type: newType, subtype: defaultSubtype };
              })
            }
            className="w-full"
          >
            <option value="depository">Depository</option>
            <option value="credit">Credit</option>
            <option value="investment">Investment</option>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Subtype</label>
          <Select
            value={(get('subtype') as string) ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, subtype: e.target.value as Account['subtype'] }))}
            className="w-full"
          >
            {validSubtypes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Currency</label>
          <Input
            value={(get('currency') as string) ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value }))}
            maxLength={3}
            className="uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Balance</label>
          <Input
            type="number"
            step="0.01"
            value={(get('balance') as number) ?? 0}
            onChange={(e) => setDraft((d) => ({ ...d, balance: parseFloat(e.target.value) }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Available Balance</label>
          <Input
            type="number"
            step="0.01"
            value={(get('available_balance') as number | null) ?? ''}
            placeholder="Leave blank for none"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                available_balance: e.target.value === '' ? null : parseFloat(e.target.value),
              }))
            }
          />
        </div>

        {currentType === 'credit' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Credit Limit</label>
            <Input
              type="number"
              step="0.01"
              value={(get('credit_limit') as number | null) ?? ''}
              placeholder="Leave blank for none"
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  credit_limit: e.target.value === '' ? null : parseFloat(e.target.value),
                }))
              }
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(get('is_hidden') as boolean) ?? false}
            onChange={(e) => setDraft((d) => ({ ...d, is_hidden: e.target.checked }))}
            className="accent-brand h-4 w-4 rounded"
          />
          <span className="text-sm text-text">Hide from dashboard</span>
        </label>

        {saveError && (
          <p className="text-sm text-error">{saveError}</p>
        )}
      </div>

      <div className="border-t border-border p-6">
        <Button
          variant="primary"
          className="w-full"
          disabled={Object.keys(draft).length === 0 || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
