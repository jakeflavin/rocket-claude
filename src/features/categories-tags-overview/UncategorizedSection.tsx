import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { useUncategorizedTransactions } from './useUncategorizedTransactions';
import { recategorizeTransactions } from './queries';
import type { Category } from './types';

type Props = {
  categories: Category[];
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UncategorizedSection({ categories }: Props) {
  const { transactions, total, loading, error, refresh } = useUncategorizedTransactions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const topLevel = categories.filter((c) => c.parent_id == null);

  function toggleAll() {
    if (selected.size === transactions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAssign(categoryId: string) {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      await recategorizeTransactions(Array.from(selected), categoryId);
      setSelected(new Set());
      setAssigningTo(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">Uncategorized Transactions</h2>
          {total > 0 && <Badge variant="warning">{total}</Badge>}
        </div>
        {selected.size > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAssigningTo(assigningTo ? null : 'open')}
              className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover transition-colors duration-[100ms]"
              disabled={saving}
            >
              <Check size={12} />
              Categorize {selected.size}
              <ChevronDown size={12} />
            </button>
            {assigningTo === 'open' && (
              <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-xl border border-border bg-surface shadow-md overflow-auto max-h-64">
                {topLevel.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAssign(cat.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-hover transition-colors duration-[100ms]"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-10 animate-pulse rounded-lg bg-hover" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-error">{error.message}</p>}
      {!loading && !error && transactions.length === 0 && (
        <p className="text-sm text-muted py-4 text-center">All transactions are categorized.</p>
      )}
      {!loading && !error && transactions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <input
              type="checkbox"
              checked={selected.size === transactions.length && transactions.length > 0}
              onChange={toggleAll}
              className="h-3.5 w-3.5 accent-brand"
            />
            <span className="text-xs text-muted">Select all</span>
          </div>
          <div className="divide-y divide-border">
            {transactions.map((txn) => (
              <label
                key={txn.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-row-hover transition-colors duration-[100ms]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(txn.id)}
                  onChange={() => toggleOne(txn.id)}
                  className="h-3.5 w-3.5 accent-brand shrink-0"
                />
                <span className="flex-1 truncate text-sm text-text">{txn.merchant}</span>
                <span className="shrink-0 text-xs text-muted">{formatDate(txn.date)}</span>
                <span className="shrink-0 text-sm font-medium text-text">{formatCurrency(txn.amount)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
