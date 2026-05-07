import { X, ExternalLink } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { useAccountBalanceHistory } from './useAccountBalanceHistory';
import type { Account } from './types';

type Props = {
  account: Account;
  onClose: () => void;
  onNavigateToTransactions: (accountId: string) => void;
};

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

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AccountDetailPanel({ account, onClose, onNavigateToTransactions }: Props) {
  const { history, loading: histLoading } = useAccountBalanceHistory(account.id);
  const isCredit = account.type === 'credit';
  const balanceLabel = isCredit ? 'Balance Owed' : 'Balance';
  const displayBalance = isCredit ? Math.abs(account.balance) : account.balance;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{account.name}</p>
          <p className="text-xs text-muted">{account.institution}</p>
        </div>
        <Button variant="icon" size="sm" onClick={onClose} aria-label="Close panel">
          <X size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default">{account.subtype}</Badge>
          {account.is_hidden && <Badge variant="warning">Hidden</Badge>}
          {account.is_closed && <Badge variant="error">Closed</Badge>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-muted">{balanceLabel}</span>
            <span className="text-sm font-semibold text-text">
              {formatCurrency(displayBalance, account.currency)}
            </span>
          </div>
          {account.available_balance != null && (
            <div className="flex justify-between">
              <span className="text-xs text-muted">
                {isCredit ? 'Available Credit' : 'Available'}
              </span>
              <span className="text-sm text-text">
                {formatCurrency(account.available_balance, account.currency)}
              </span>
            </div>
          )}
          {isCredit && account.credit_limit != null && (
            <div className="flex justify-between">
              <span className="text-xs text-muted">Credit Limit</span>
              <span className="text-sm text-text">
                {formatCurrency(account.credit_limit, account.currency)}
              </span>
            </div>
          )}
        </div>

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

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Currency</span>
            <span className="text-text">{account.currency}</span>
          </div>
          {account.last_synced_at && (
            <div className="flex justify-between">
              <span className="text-muted">Last Synced</span>
              <span className="text-text">{formatDate(account.last_synced_at)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Created</span>
            <span className="text-text">{formatDate(account.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onNavigateToTransactions(account.id)}
        >
          <ExternalLink size={14} />
          View Transactions
        </Button>
      </div>
    </div>
  );
}
