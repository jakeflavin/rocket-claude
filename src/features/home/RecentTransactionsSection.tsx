import { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { DashboardTransactionDrawer } from './DashboardTransactionDrawer';
import type { DashboardTransaction } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(v));
}

type Props = {
  transactions: DashboardTransaction[];
  loading: boolean;
  onNavigate: (path: string) => void;
};

export function RecentTransactionsSection({ transactions, loading, onNavigate }: Props) {
  const [selected, setSelected] = useState<DashboardTransaction | null>(null);

  if (loading) {
    return <div className="h-48 rounded-xl bg-surface animate-pulse" />;
  }

  return (
    <>
      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Recent Transactions</h2>
          <button
            className="text-xs text-brand hover:underline"
            onClick={() => onNavigate('/transactions')}
          >
            View All
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">No recent transactions.</p>
        ) : (
          <div className="flex flex-col">
            {transactions.map((txn) => (
              <button
                key={txn.id}
                className="flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-lg hover:bg-row-hover transition-colors text-left w-full"
                onClick={() => setSelected(txn)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{txn.merchant}</p>
                  <p className="text-xs text-muted">{txn.date} · {txn.category_name}</p>
                </div>
                <p className={`text-sm font-semibold tabular-nums shrink-0 ${txn.amount >= 0 ? 'text-success' : 'text-text'}`}>
                  {txn.amount >= 0 ? '+' : '-'}{fmt(txn.amount)}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <DashboardTransactionDrawer transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}
