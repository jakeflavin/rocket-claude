import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { queryMergePreview, executeMerge } from './queries';
import type { MergePreview } from './types';

type Props = {
  primaryId: string;
  mergeIds: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function MergePreviewModal({ primaryId, mergeIds, onConfirm, onCancel }: Props) {
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queryMergePreview(primaryId, mergeIds)
      .then((data) => {
        if (!cancelled) {
          setPreview(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load preview');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [primaryId, mergeIds]);

  async function handleConfirm() {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#1A1915]/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-[calc(100%-2rem)] max-w-[480px] rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-text">Merge Accounts</h2>
          <Button variant="icon" size="sm" onClick={onCancel} aria-label="Cancel">
            <X size={16} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-8 animate-pulse rounded bg-hover" />
              ))}
            </div>
          ) : preview ? (
            <>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Surviving Account
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-success-border bg-success-bg px-3 py-2">
                  <span className="text-sm font-medium text-text">{preview.primary.name}</span>
                  <Badge variant="success">{preview.primary.institution}</Badge>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Accounts to Archive
                </p>
                <div className="space-y-1.5">
                  {preview.merging.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                    >
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
                  <span className="font-medium text-text">
                    {formatCurrency(preview.combinedBalance)}
                  </span>
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
                <p className="text-xs text-warning">
                  Merged accounts will be archived and this action cannot be undone.
                </p>
              </div>
            </>
          ) : null}

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onCancel} disabled={executing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || executing || !!error}
          >
            {executing ? 'Merging…' : 'Merge and Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}
