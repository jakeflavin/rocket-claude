import { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { DashboardBillDrawer } from './DashboardBillDrawer';
import type { DashboardBill } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(v));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  bills: DashboardBill[];
  loading: boolean;
  onNavigate: (path: string) => void;
};

export function UpcomingBillsSection({ bills, loading, onNavigate }: Props) {
  const [selected, setSelected] = useState<DashboardBill | null>(null);

  if (loading) {
    return <div className="h-48 rounded-xl bg-surface animate-pulse" />;
  }

  return (
    <>
      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Upcoming Bills</h2>
          <button
            className="text-xs text-brand hover:underline"
            onClick={() => onNavigate('/subscriptions')}
          >
            View All
          </button>
        </div>

        {bills.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">No bills due in the next 30 days.</p>
        ) : (
          <div className="flex flex-col">
            {bills.map((bill) => (
              <button
                key={bill.id}
                className="flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-lg hover:bg-hover transition-colors text-left w-full"
                onClick={() => setSelected(bill)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{bill.merchant}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="default">{capitalize(bill.frequency)}</Badge>
                    <span className="text-xs text-muted">{bill.next_due_date}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold tabular-nums text-error shrink-0">
                  -{fmt(bill.amount)}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <DashboardBillDrawer bill={selected} onClose={() => setSelected(null)} />
    </>
  );
}
