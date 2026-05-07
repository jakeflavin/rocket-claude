import { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { HorizontalBarChart } from '../../shared/components/HorizontalBarChart';
import { MerchantDetailDrawer } from './MerchantDetailDrawer';
import { useMerchantSpending } from './useMerchantSpending';
import type { SpendingPeriod } from './types';

type Props = { period: SpendingPeriod };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MerchantSpendingSection({ period }: Props) {
  const { merchants, loading, error } = useMerchantSpending(period);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const data = merchants.map((m) => ({
    id: m.merchant,
    label: m.merchant,
    value: m.total,
    color: 'var(--color-brand)',
  }));

  const barHeight = Math.max(160, data.length * 36 + 40);

  return (
    <>
      <Card className="p-5 shadow-xs">
        <p className="text-sm font-semibold text-text mb-1">Top Merchants</p>
        <p className="text-xs text-muted mb-4">Click a bar to see details</p>
        {loading ? (
          <div className="h-[280px] rounded-lg bg-hover animate-pulse" />
        ) : error ? (
          <p className="py-8 text-center text-sm text-error">{error.message}</p>
        ) : (
          <HorizontalBarChart
            data={data}
            height={barHeight}
            valueFormatter={formatCurrency}
            selectedId={selectedMerchant}
            onBarClick={(id) => setSelectedMerchant(id === selectedMerchant ? null : id)}
            emptyMessage="No merchant data available."
          />
        )}
      </Card>

      <MerchantDetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </>
  );
}
