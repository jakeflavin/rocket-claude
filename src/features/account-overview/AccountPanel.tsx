import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Select } from '../../shared/components/Select';
import { Toggle } from '../../shared/components/Toggle';
import { useAccountBalanceHistory } from './useAccountBalanceHistory';
import { updateAccount } from '../account-management/queries';
import type { Account } from './types';

type Props = {
  account: Account;
  onNavigateToTransactions: (accountId: string) => void;
  onUpdated: () => void;
};

const SUBTYPES_BY_TYPE: Record<string, string[]> = {
  depository: ['checking', 'savings'],
  credit: ['credit card'],
  investment: ['brokerage'],
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Sparkline({ history }: { history: { date: string; balance: number }[] }) {
  if (history.length < 2) return null;
  const values = history.map((h) => h.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 240;
  const h = 48;
  const pts = history.map((point, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((point.balance - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// --- Inline field components ---

type InlineTextFieldProps = {
  label: string;
  value: string;
  type?: 'text' | 'number';
  placeholder?: string;
  maxLength?: number;
  onSave: (v: string) => void;
};

function InlineTextField({ label, value, type = 'text', placeholder, maxLength, onSave }: InlineTextFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  function commit() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted shrink-0 mr-3">{label}</span>
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
          maxLength={maxLength}
          className="text-right text-sm max-w-[140px]"
        />
      ) : (
        <button
          type="button"
          className="text-sm text-text hover:text-brand transition-colors duration-[100ms] text-right"
          onClick={() => { setDraft(value); setEditing(true); }}
        >
          {value || <span className="text-subtle">{placeholder ?? '—'}</span>}
        </button>
      )}
    </div>
  );
}

type InlineSelectFieldProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSave: (v: string) => void;
};

function InlineSelectField({ label, value, options, onSave }: InlineSelectFieldProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted shrink-0 mr-3">{label}</span>
      <Select
        value={value}
        onChange={(e) => onSave(e.target.value)}
        className="text-sm max-w-[140px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    </div>
  );
}

type RowProps = { label: string; children: React.ReactNode };
function Row({ label, children }: RowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

export function AccountPanel({ account, onNavigateToTransactions, onUpdated }: Props) {
  const { history, loading: histLoading } = useAccountBalanceHistory(account.id);
  const [local, setLocal] = useState(account);

  useEffect(() => { setLocal(account); }, [account.id]);

  async function save(patch: Parameters<typeof updateAccount>[1]) {
    await updateAccount(local.id, patch);
    setLocal((a) => ({ ...a, ...patch }));
    onUpdated();
  }

  const isCredit = local.type === 'credit';
  const displayBalance = isCredit ? Math.abs(local.balance) : local.balance;
  const balanceLabel = isCredit ? 'Balance Owed' : 'Balance';
  const validSubtypes = SUBTYPES_BY_TYPE[local.type] ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default">{local.subtype}</Badge>
          {local.is_hidden && <Badge variant="warning">Hidden</Badge>}
          {local.is_closed && <Badge variant="error">Closed</Badge>}
        </div>

        {/* Sparkline */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">30-Day Balance History</p>
          {histLoading ? (
            <div className="h-12 rounded bg-hover animate-pulse" />
          ) : history.length > 1 ? (
            <Sparkline history={history} />
          ) : (
            <p className="text-xs text-subtle">No history available</p>
          )}
        </div>

        {/* Editable fields */}
        <div>
          <InlineTextField
            label="Name"
            value={local.name}
            onSave={(v) => { if (v.trim()) save({ name: v.trim() }); }}
          />
          <InlineTextField
            label="Institution"
            value={local.institution}
            onSave={(v) => { if (v.trim()) save({ institution: v.trim() }); }}
          />
          <InlineSelectField
            label="Type"
            value={local.type}
            options={[
              { value: 'depository', label: 'Depository' },
              { value: 'credit', label: 'Credit' },
              { value: 'investment', label: 'Investment' },
            ]}
            onSave={(v) => {
              const newType = v as Account['type'];
              const defaultSubtype = SUBTYPES_BY_TYPE[newType]?.[0] as Account['subtype'];
              save({ type: newType, subtype: defaultSubtype });
            }}
          />
          <InlineSelectField
            label="Subtype"
            value={local.subtype}
            options={validSubtypes.map((s) => ({ value: s, label: s }))}
            onSave={(v) => save({ subtype: v as Account['subtype'] })}
          />
          <InlineTextField
            label={balanceLabel}
            value={String(displayBalance)}
            type="number"
            onSave={(v) => {
              const n = parseFloat(v);
              if (!isNaN(n)) save({ balance: isCredit ? -Math.abs(n) : n });
            }}
          />
          <InlineTextField
            label="Available Balance"
            value={local.available_balance != null ? String(local.available_balance) : ''}
            type="number"
            placeholder="None"
            onSave={(v) => save({ available_balance: v === '' ? null : parseFloat(v) })}
          />
          {isCredit && (
            <InlineTextField
              label="Credit Limit"
              value={local.credit_limit != null ? String(local.credit_limit) : ''}
              type="number"
              placeholder="None"
              onSave={(v) => save({ credit_limit: v === '' ? null : parseFloat(v) })}
            />
          )}
          <InlineTextField
            label="Currency"
            value={local.currency}
            maxLength={3}
            onSave={(v) => { if (v.trim()) save({ currency: v.trim().toUpperCase() }); }}
          />
          <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <span className="text-xs text-muted">Hide from dashboard</span>
            <Toggle
              checked={local.is_hidden}
              onChange={(v) => save({ is_hidden: v })}
            />
          </div>
        </div>

        {/* Read-only info */}
        <div>
          {local.last_synced_at && (
            <Row label="Last Synced">{formatDate(local.last_synced_at)}</Row>
          )}
          <Row label="Created">{formatDate(local.created_at)}</Row>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onNavigateToTransactions(local.id)}
        >
          <ExternalLink size={14} />
          View Transactions
        </Button>
      </div>
    </div>
  );
}
