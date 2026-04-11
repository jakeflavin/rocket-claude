const RANGES = [
  { value: 'this_month',     label: 'This Month' },
  { value: 'this_week',      label: 'This Week' },
  { value: 'last_7',         label: 'Last 7 Days' },
  { value: 'last_30',        label: 'Last 30 Days' },
  { value: 'last_90',        label: 'Last 90 Days' },
  { value: 'last_12_months', label: 'Last 12 Months' },
];

function getRangeDates(range) {
  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);
  const end = fmt(today);

  switch (range) {
    case 'this_month': {
      return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end };
    }
    case 'this_week': {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay());
      return { start: fmt(d), end };
    }
    case 'last_7': {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { start: fmt(d), end };
    }
    case 'last_30': {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { start: fmt(d), end };
    }
    case 'last_90': {
      const d = new Date(today);
      d.setDate(d.getDate() - 89);
      return { start: fmt(d), end };
    }
    case 'last_12_months': {
      const d = new Date(today);
      d.setFullYear(d.getFullYear() - 1);
      d.setDate(1);
      return { start: fmt(d), end };
    }
    default:
      return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end };
  }
}

function DashboardSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <Skeleton className="h-8 w-52" />
        <Grid cols={4} gap="gap-4" responsive>
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
        <Grid cols={2} gap="gap-4" responsive>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </Grid>
        <Skeleton className="h-48 rounded-xl" />
        <Grid cols={2} gap="gap-4" responsive>
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </Grid>
      </VStack>
    </Box>
  );
}

/**
 * Dashboard — main overview page.
 *
 * Layout:
 *   NeedsReviewBanner (if applicable)
 *   PageHeader + range selector
 *   4 KPI StatCards
 *   SpendingChart + CategoryDonut (2-col)
 *   BudgetProgress (full-width)
 *   RecentTransactions + Upcoming Bills (2-col)
 */

function Dashboard({ onNavigate }) {
  const { settings } = useSettings();
  const { transactions, expenses, income, needsReview, billGroups, loading, error, reload } = useTransactions();

  const [range, setRange] = React.useState('this_month');
  const { start, end } = getRangeDates(range);
  const rangeLabel = RANGES.find(r => r.value === range)?.label || 'This Month';

  const rangeExpenses = expenses.filter(t => t.date >= start && t.date <= end);
  const rangeIncome   = income.filter(t => t.date >= start && t.date <= end);

  const totalSpent  = rangeExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = rangeIncome.reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = Object.values(settings.budgets || {}).reduce((sum, v) => sum + v, 0);
  const remaining   = totalBudget - totalSpent;

  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalSpent) / totalIncome) * 100
    : 0;

  const upcomingCount = settings.dashboard?.upcomingBillsCount ?? 5;
  const upcomingBills = billGroups
    .filter(b => b.status !== 'paid')
    .slice(0, upcomingCount);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return <DataErrorState error={error} onRetry={reload} />;
  }

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        {needsReview.length > 0 && (
          <NeedsReviewBanner count={needsReview.length} onNavigate={onNavigate} />
        )}

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Dashboard" subtitle={rangeLabel} />
          <Box className="w-44">
            <Select
              value={range}
              onChange={e => setRange(e.target.value)}
            >
              {RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </Box>
        </HStack>

        {/* KPI Cards */}
        <Grid cols={4} gap="gap-4" responsive>
          <StatCard label="Total Spent"       value={Formatters.currency(totalSpent)}   icon="TrendingDown" />
          <StatCard label="Total Income"      value={Formatters.currency(totalIncome)}  icon="TrendingUp"   />
          <StatCard
            label="Remaining Budget"
            value={Formatters.currency(Math.abs(remaining))}
            icon="Wallet"
            delta={remaining < 0 ? 'Over budget' : undefined}
            deltaPositive={false}
          />
          <StatCard
            label="Savings Rate"
            value={Formatters.percent(savingsRate, 1)}
            icon="PiggyBank"
            delta={savingsRate < 0 ? 'Negative' : undefined}
            deltaPositive={savingsRate >= 0}
          />
        </Grid>

        {/* Charts */}
        <Grid cols={2} gap="gap-4" responsive>
          <SpendingChart  transactions={transactions} start={start} end={end} rangeLabel={rangeLabel} />
          <CategoryDonut  transactions={transactions} categories={settings.categories} start={start} end={end} rangeLabel={rangeLabel} />
        </Grid>

        {/* Budget Progress */}
        <BudgetProgress transactions={transactions} start={start} end={end} rangeLabel={rangeLabel} />

        {/* Recent Transactions + Upcoming Bills */}
        <Grid cols={2} gap="gap-4" responsive>
          <RecentTransactions transactions={transactions} onNavigate={onNavigate} />

          <Card>
            <CardHeader>
              <Heading level={3} className="text-sm font-semibold">Upcoming Bills</Heading>
            </CardHeader>
            <CardBody className="p-0">
              {upcomingBills.length === 0 ? (
                <EmptyState icon="CheckCircle" title="No upcoming bills" className="py-8" />
              ) : (
                <VStack gap="gap-0" className="divide-y divide-rim">
                  {upcomingBills.map(bill => {
                    const cfg = BILL_STATUS[bill.status] ?? BILL_STATUS.upcoming;
                    return (
                      <HStack key={bill.merchant} gap="gap-3" className="px-4 py-3 justify-between">
                        <VStack gap="gap-0.5">
                          <Text className="text-sm font-medium text-fg">{bill.merchant}</Text>
                          <Caption>{bill.subcategory || bill.category}</Caption>
                        </VStack>
                        <VStack gap="gap-0.5" className="items-end">
                          <Badge color={cfg.color}>{cfg.label}</Badge>
                          <Caption>{Formatters.date(bill.estimatedNextDue)}</Caption>
                        </VStack>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Grid>

      </VStack>
    </Box>
  );
}

window.Dashboard = Dashboard;
