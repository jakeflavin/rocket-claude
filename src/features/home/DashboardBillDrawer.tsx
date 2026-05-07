import { Drawer } from '../../shared/components/Drawer';
import type { DashboardBill } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(v));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  bill: DashboardBill | null;
  onClose: () => void;
};

export function DashboardBillDrawer({ bill, onClose }: Props) {
  return (
    <Drawer open={bill !== null} onClose={onClose} title="Upcoming Bill" width={360}>
      {bill && (
        <div className="px-4 pb-6">
          <FieldRow label="Merchant">{bill.merchant}</FieldRow>
          <FieldRow label="Amount">
            <span className="text-error">-{fmt(bill.amount)}</span>
          </FieldRow>
          <FieldRow label="Frequency">{capitalize(bill.frequency)}</FieldRow>
          <FieldRow label="Next Due">{bill.next_due_date}</FieldRow>
          <FieldRow label="Category">{bill.category_name}</FieldRow>
        </div>
      )}
    </Drawer>
  );
}
