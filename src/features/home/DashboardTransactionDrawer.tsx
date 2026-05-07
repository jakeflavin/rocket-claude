import { Drawer } from '../../shared/components/Drawer';
import type { DashboardTransaction } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(v));
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</p>
      <div className="text-sm font-medium text-text text-right">{children}</div>
    </div>
  );
}

type Props = {
  transaction: DashboardTransaction | null;
  onClose: () => void;
};

export function DashboardTransactionDrawer({ transaction, onClose }: Props) {
  return (
    <Drawer open={transaction !== null} onClose={onClose} title="Transaction" width={360}>
      {transaction && (
        <div className="px-4 pb-6">
          <FieldRow label="Date">{transaction.date}</FieldRow>
          <FieldRow label="Merchant">{transaction.merchant}</FieldRow>
          <FieldRow label="Amount">
            <span className={transaction.amount >= 0 ? 'text-success' : 'text-text'}>
              {transaction.amount >= 0 ? '+' : '-'}{fmt(transaction.amount)}
            </span>
          </FieldRow>
          <FieldRow label="Category">{transaction.category_name}</FieldRow>
        </div>
      )}
    </Drawer>
  );
}
