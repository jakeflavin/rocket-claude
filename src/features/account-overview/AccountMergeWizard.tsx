import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { queryMergePreview, executeMerge } from '../account-management/queries';
import type { Account } from './types';
import type { MergePreview } from '../account-management/types';

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onComplete: () => void;
};

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            i + 1 <= current ? 'bg-brand' : 'bg-border'
          } ${i + 1 === current ? 'w-6' : 'w-3'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted">Step {current} of {total}</span>
    </div>
  );
}

export function AccountMergeWizard({ open, onClose, accounts, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [primaryId, setPrimaryId] = useState('');
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedIds(new Set());
      setPrimaryId('');
      setPreview(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (step !== 3 || !primaryId) return;
    const mergeIds = Array.from(selectedIds).filter((id) => id !== primaryId);
    let cancelled = false;
    setLoadingPreview(true);
    setError(null);
    setPreview(null);
    queryMergePreview(primaryId, mergeIds)
      .then((data) => { if (!cancelled) { setPreview(data); setLoadingPreview(false); } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Failed to load preview'); setLoadingPreview(false); } });
    return () => { cancelled = true; };
  }, [step, primaryId, selectedIds]);

  function toggleAccount(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    const mergeIds = Array.from(selectedIds).filter((id) => id !== primaryId);
    setExecuting(true);
    setError(null);
    try {
      await executeMerge(primaryId, mergeIds);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merge failed');
      setExecuting(false);
    }
  }

  const selectedAccounts = accounts.filter((a) => selectedIds.has(a.id));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#1A1915]/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[480px] flex-col rounded-2xl bg-surface shadow-xl">

        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-text">Merge Accounts</h2>
            <div className="mt-1.5">
              <StepIndicator current={step} total={3} />
            </div>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" className="-mt-0.5">
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-2">
              <p className="mb-3 text-sm text-muted">Select two or more accounts to merge.</p>
              {accounts.map((account) => (
                <label
                  key={account.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors duration-[100ms] hover:bg-hover"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="accent-brand h-4 w-4 shrink-0 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{account.name}</p>
                    <p className="truncate text-xs text-muted">{account.institution} · {account.subtype}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-medium ${account.balance >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="mb-3 text-sm text-muted">Choose which account survives. All transactions will be reassigned to this account.</p>
              {selectedAccounts.map((account) => (
                <label
                  key={account.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-[100ms] ${
                    primaryId === account.id ? 'border-brand bg-brand/[0.06]' : 'border-border hover:bg-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="primary"
                    value={account.id}
                    checked={primaryId === account.id}
                    onChange={() => setPrimaryId(account.id)}
                    className="accent-brand h-4 w-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{account.name}</p>
                    <p className="truncate text-xs text-muted">{account.institution} · {account.subtype}</p>
                  </div>
                  {primaryId === account.id && <Badge variant="brand">Primary</Badge>}
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {loadingPreview && (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => <div key={n} className="h-8 animate-pulse rounded bg-hover" />)}
                </div>
              )}
              {!loadingPreview && preview && (
                <>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Surviving Account</p>
                    <div className="flex items-center gap-2 rounded-lg border border-success-border bg-success-bg px-3 py-2">
                      <span className="text-sm font-medium text-text">{preview.primary.name}</span>
                      <Badge variant="success">{preview.primary.institution}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Accounts to Archive</p>
                    <div className="space-y-1.5">
                      {preview.merging.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <ArrowRight size={14} className="shrink-0 text-subtle" aria-hidden="true" />
                          <span className="text-sm text-text">{acc.name}</span>
                          <span className="ml-auto text-xs text-muted">{acc.institution}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 rounded-lg border border-border bg-hover p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Combined Balance</span>
                      <span className="font-medium text-text">{formatCurrency(preview.combinedBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Transactions reassigned</span>
                      <span className="text-text">{preview.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Recurring items reassigned</span>
                      <span className="text-text">{preview.recurringCount}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg p-3">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                    <p className="text-xs text-warning">Merged accounts will be archived and this action cannot be undone.</p>
                  </div>
                </>
              )}
              {error && <p className="text-sm text-error">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {step === 1 ? (
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          ) : (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={executing}>Back</Button>
          )}
          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? selectedIds.size < 2 : !primaryId}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loadingPreview || executing || !!error || !preview}
            >
              {executing ? 'Merging…' : 'Merge and Archive'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
