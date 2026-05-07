import { useState } from 'react';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { SpendingSummaryBar } from './SpendingSummaryBar';
import { SpendingTrendsSection } from './SpendingTrendsSection';
import { IncomeExpensesSection } from './IncomeExpensesSection';
import { CashFlowSection } from './CashFlowSection';
import { MerchantSpendingSection } from './MerchantSpendingSection';
import type { SpendingPeriod } from './types';

const PERIOD_SEGMENTS = [
  { value: 'monthly' as SpendingPeriod, label: 'Monthly' },
  { value: 'yearly' as SpendingPeriod, label: 'Yearly' },
];

export function SpendingAnalyticsPage() {
  const [period, setPeriod] = useState<SpendingPeriod>('monthly');

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Spending Analytics</h1>
        <SegmentedControl<SpendingPeriod>
          segments={PERIOD_SEGMENTS}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* Summary stat bar */}
      <SpendingSummaryBar />

      {/* Charts — two-column grid at lg, single column below */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SpendingTrendsSection period={period} />
        <IncomeExpensesSection period={period} />
      </div>

      <CashFlowSection period={period} />

      <MerchantSpendingSection period={period} />
    </div>
  );
}
