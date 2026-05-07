import { useDashboard } from './useDashboard';
import { DashboardSummaryBar } from './DashboardSummaryBar';
import { CashFlowSection } from './CashFlowSection';
import { AccountBalancesSection } from './AccountBalancesSection';
import { BudgetProgressSection } from './BudgetProgressSection';
import { RecentTransactionsSection } from './RecentTransactionsSection';
import { UpcomingBillsSection } from './UpcomingBillsSection';

type Props = { onNavigate: (path: string) => void };

export function HomePage({ onNavigate }: Props) {
  const { data, loading } = useDashboard();

  return (
    <div className="flex flex-col gap-4">
      <DashboardSummaryBar summary={data?.summary ?? null} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <CashFlowSection data={data?.cashFlow ?? []} loading={loading} />
          <AccountBalancesSection accounts={data?.accounts ?? []} loading={loading} onNavigate={onNavigate} />
        </div>
        <div className="flex flex-col gap-4">
          <BudgetProgressSection budgets={data?.budgets ?? []} loading={loading} onNavigate={onNavigate} />
          <UpcomingBillsSection bills={data?.upcomingBills ?? []} loading={loading} onNavigate={onNavigate} />
        </div>
      </div>

      <RecentTransactionsSection transactions={data?.recentTransactions ?? []} loading={loading} onNavigate={onNavigate} />
    </div>
  );
}
