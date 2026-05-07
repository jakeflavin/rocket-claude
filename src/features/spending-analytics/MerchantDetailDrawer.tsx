import { Drawer } from '../../shared/components/Drawer';
import { LineAreaChart } from '../../shared/components/LineAreaChart';
import { useMerchantDetail } from './useMerchantDetail';

type Props = {
  merchant: string | null;
  onClose: () => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

type FieldRowProps = { label: string; value: string };

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-text tabular-nums">{value}</span>
    </div>
  );
}

export function MerchantDetailDrawer({ merchant, onClose }: Props) {
  const { detail, loading } = useMerchantDetail(merchant);

  const trendSeries = detail
    ? [{ key: 'value', label: detail.merchant, color: 'var(--color-brand)', data: detail.trend }]
    : [];

  return (
    <Drawer open={merchant !== null} onClose={onClose} title={merchant ?? ''} width={380}>
      {loading && (
        <div className="flex flex-col gap-3 px-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-hover animate-pulse" />
          ))}
        </div>
      )}

      {!loading && detail && (
        <div className="px-4 pb-6">
          {/* Total hero */}
          <div className="py-5 border-b border-border">
            <p className="text-3xl font-semibold text-text">{formatCurrency(detail.total)}</p>
            <p className="text-sm text-muted mt-0.5">Total spent</p>
          </div>

          {/* Stats */}
          <div className="border-b border-border">
            <FieldRow label="Transactions" value={String(detail.count)} />
            <FieldRow label="Average per transaction" value={formatCurrency(detail.average)} />
          </div>

          {/* Trend chart */}
          {detail.trend.length > 1 && (
            <div className="pt-5">
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-3">
                Monthly Trend
              </p>
              <LineAreaChart
                series={trendSeries}
                height={160}
                valueFormatter={formatCurrencyShort}
              />
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
