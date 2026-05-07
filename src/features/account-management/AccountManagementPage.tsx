import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { useAccountManagement } from './useAccountManagement';
import { AccountEditPanel } from './AccountEditPanel';
import { MergePreviewModal } from './MergePreviewModal';
import type { Account } from './types';

function formatBalance(account: Account): string {
  const val = account.type === 'credit' ? Math.abs(account.balance) : account.balance;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency,
  }).format(val);
}

function AccountListItem({
  account,
  txnCount,
  isSelected,
  isChecked,
  showCheckbox,
  onSelect,
  onCheck,
}: {
  account: Account;
  txnCount: number;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  onSelect: () => void;
  onCheck: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[100ms] hover:bg-hover ${
        isSelected ? 'border-l-2 border-brand bg-hover' : 'border-l-2 border-transparent'
      }`}
    >
      <div
        className={showCheckbox || isChecked ? 'block' : 'hidden group-hover:block'}
        onClick={(e) => { e.stopPropagation(); onCheck(); }}
        role="presentation"
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheck}
          onClick={(e) => e.stopPropagation()}
          className="accent-brand h-4 w-4 cursor-pointer rounded"
          aria-label={`Select ${account.name}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-text">{account.name}</p>
          {account.is_hidden && <Badge variant="warning">Hidden</Badge>}
          {account.is_closed && <Badge variant="error">Closed</Badge>}
        </div>
        <p className="truncate text-xs text-muted">
          {account.institution} · {account.subtype}
          {txnCount > 0 && ` · ${txnCount} txns`}
        </p>
      </div>
      <span className={`shrink-0 text-sm font-medium ${
        account.balance >= 0 ? 'text-success' : 'text-error'
      }`}>
        {formatBalance(account)}
      </span>
    </button>
  );
}

export function AccountManagementPage() {
  const {
    accounts,
    loading,
    error,
    txnCounts,
    selectedId,
    setSelectedId,
    multiSelected,
    toggleMultiSelect,
    clearMultiSelect,
    refresh,
  } = useAccountManagement();

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [primaryId, setPrimaryId] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedId) ?? null;
  const multiSelectedAccounts = accounts.filter((a) => multiSelected.has(a.id));
  const showMergePanel = multiSelected.size >= 2 && !mergeModalOpen;

  function handleMergeConfirm() {
    setMergeModalOpen(false);
    clearMultiSelect();
    setPrimaryId(null);
    refresh();
  }

  return (
    <div className="flex h-[calc(100vh-52px-48px)] -m-6 overflow-hidden">
      {/* Left panel — account list */}
      <div className="flex w-80 shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-text">Accounts</span>
          <div className="flex items-center gap-2">
            {multiSelected.size > 0 && (
              <Button variant="ghost" size="sm" onClick={clearMultiSelect}>
                Clear
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={multiSelected.size < 2}
              onClick={() => setMergeModalOpen(true)}
            >
              Merge
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 animate-pulse rounded bg-hover" />
              ))}
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-error">{error.message}</p>
          ) : (
            accounts.map((account) => (
              <AccountListItem
                key={account.id}
                account={account}
                txnCount={txnCounts[account.id] ?? 0}
                isSelected={selectedId === account.id}
                isChecked={multiSelected.has(account.id)}
                showCheckbox={multiSelected.size > 0}
                onSelect={() => {
                  if (multiSelected.size > 0) {
                    toggleMultiSelect(account.id);
                  } else {
                    setSelectedId(account.id === selectedId ? null : account.id);
                  }
                }}
                onCheck={() => toggleMultiSelect(account.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {showMergePanel ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            <div className="w-full max-w-sm space-y-4">
              <h3 className="text-sm font-semibold text-text">
                {multiSelected.size} accounts selected
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Primary Account (surviving)</label>
                <select
                  value={primaryId ?? ''}
                  onChange={(e) => setPrimaryId(e.target.value || null)}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text focus:border-link focus:outline-none focus:ring-[3px] focus:ring-brand/[0.12]"
                >
                  <option value="">Select primary account…</option>
                  {multiSelectedAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.institution})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                disabled={!primaryId}
                onClick={() => setMergeModalOpen(true)}
              >
                Preview Merge
              </Button>
            </div>
          </div>
        ) : selectedAccount ? (
          <AccountEditPanel
            account={selectedAccount}
            onSaved={() => { refresh(); }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Settings2 size={48} className="text-subtle" aria-hidden="true" />
            <p className="text-sm text-muted">Select an account to edit</p>
            <p className="text-xs text-subtle">
              Or select multiple accounts to merge
            </p>
          </div>
        )}
      </div>

      {mergeModalOpen && primaryId && (
        <MergePreviewModal
          primaryId={primaryId}
          mergeIds={Array.from(multiSelected).filter((id) => id !== primaryId)}
          onConfirm={handleMergeConfirm}
          onCancel={() => setMergeModalOpen(false)}
        />
      )}
    </div>
  );
}
