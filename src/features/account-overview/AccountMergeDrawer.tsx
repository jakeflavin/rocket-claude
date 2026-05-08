import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Drawer } from '../../shared/components/Drawer';
import { Select } from '../../shared/components/Select';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { queryMergePreview, executeMerge } from '../account-management/queries';
import type { Account } from './types';
import type { MergePreview } from '../account-management/types';

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onConfirm: () => void;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function AccountMergeDrawer({ open, onClose, accounts, onConfirm }: Props) {
  const [primaryId, setPrimaryId] = useState('');
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPrimaryId('');
      setPreview(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!primaryId) { setPreview(null); return; }
    const mergeIds = accounts.map((a) => a.id).filter((id) => id !== primaryId);
    let cancelled = false;
    setLoadingPreview(true);
    setError(null);
    queryMergePreview(primaryId, mergeIds)
      .then((data) => { if (!cancelled) { setPreview(data); setLoadingPreview(false); } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Failed to load preview'); setLoadingPreview(false); } });
    return () => { cancelled = true; };
  }, [primaryId, accounts]);

  async function handleConfirm() {
    if (!primaryId) return;
    const mergeIds = accounts.map((a) => a.id).filter((id) => id !== primaryId);
    setExecuting(true);
    setError(null);
    try {
      await executeMerge(primaryId, mergeIds);
      onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merge failed');
      setExecuting(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Merge Accounts" width={480}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-text mb-1.5">Primary Account (surviving)</label>
          <Select value={primaryId} onChange={(e) => setPrimaryId(e.target.value)}>
            <option value="">Select primary account…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.institution})</option>
            ))}
          </Select>
        </div>

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

            <div className="rounded-lg border border-border bg-hover p-3 space-y-1.5 text-sm">
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

        <div className="flex gap-2 pt-2">
          <Button variant="destructive" onClick={handleConfirm} disabled={!primaryId || loadingPreview || executing || !!error} className="flex-1">
            {executing ? 'Merging…' : 'Merge and Archive'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={executing}>Cancel</Button>
        </div>
      </div>
    </Drawer>
  );
}
