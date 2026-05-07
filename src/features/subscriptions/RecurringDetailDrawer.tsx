import { Drawer } from '../../shared/components/Drawer';
import { Badge } from '../../shared/components/Badge';
import type { RecurringTransaction } from './types';

type Props = {
  item: RecurringTransaction | null;
  onClose: () => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(value));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  annual: 'Annual',
};

function confidenceVariant(score: number) {
  if (score >= 0.95) return 'success' as const;
  if (score >= 0.8) return 'warning' as const;
  return 'error' as const;
}

type FieldRowProps = { label: string; children: React.ReactNode };

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</span>
      <div className="text-sm text-text">{children}</div>
    </div>
  );
}

export function RecurringDetailDrawer({ item, onClose }: Props) {
  const isIncome = item ? item.amount > 0 : false;

  return (
    <Drawer
      open={item !== null}
      onClose={onClose}
      title={item?.merchant ?? ''}
      width={360}
    >
      {item && (
        <div className="px-4 pb-6">
          {/* Amount hero */}
          <div className="py-5 border-b border-border">
            <p className={`text-3xl font-semibold ${isIncome ? 'text-success' : 'text-text'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
            </p>
            <p className="text-sm text-muted mt-0.5">{FREQUENCY_LABEL[item.frequency] ?? item.frequency}</p>
          </div>

          {/* Fields */}
          <div>
            <FieldRow label="Status">
              <Badge variant={item.active ? 'success' : 'default'}>
                {item.active ? 'Active' : 'Cancelled'}
              </Badge>
            </FieldRow>

            <FieldRow label="Type">
              <Badge variant={isIncome ? 'info' : 'default'}>
                {isIncome ? 'Income' : 'Bill'}
              </Badge>
            </FieldRow>

            <FieldRow label="Next Due">
              {formatDate(item.next_due_date)}
            </FieldRow>

            <FieldRow label="Category">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.category_color }}
                />
                {item.category_name}
              </span>
            </FieldRow>

            <FieldRow label="Account">
              {item.account_name}
            </FieldRow>

            <FieldRow label="Detection Confidence">
              <Badge variant={confidenceVariant(item.confidence)}>
                {Math.round(item.confidence * 100)}%
              </Badge>
            </FieldRow>
          </div>
        </div>
      )}
    </Drawer>
  );
}
