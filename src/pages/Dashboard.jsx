function DashboardSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <Skeleton className="h-8 w-52" />
        <Grid cols={4} gap="gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
        <Grid cols={2} gap="gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </Grid>
        <Skeleton className="h-48 rounded-xl" />
        <Grid cols={2} gap="gap-4">
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
 *   PageHeader
 *   4 KPI StatCards
 *   SpendingChart + CategoryDonut (2-col)
 *   BudgetProgress (full-width)
 *   RecentTransactions + Upcoming Bills (2-col)
 */

const BILL_STATUS_CONFIG = {
  paid:     { label: 'Paid',     color: '#10b981' },
  due_soon: { label: 'Due Soon', color: '#f59e0b' },
  overdue:  { label: 'Overdue',  color: '#ef4444' },
  upcoming: { label: 'Upcoming', color: '#6b7280' },
};

function Dashboard({ onNavigate }) {
  const { settings } = useSettings();
  const { transactions, expenses, income, needsReview, billGroups, loading, error } = useTransactions();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthExpenses = expenses.filter(t => t.date.startsWith(currentMonth));
  const monthIncome   = income.filter(t => t.date.startsWith(currentMonth));

  const totalSpent  = monthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = monthIncome.reduce((sum, t) => sum + t.amount, 0);

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
    return (
      <Center className="h-full">
        <Alert variant="error" title="Failed to load transactions" />
      </Center>
    );
  }

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        {needsReview.length > 0 && (
          <NeedsReviewBanner count={needsReview.length} onNavigate={onNavigate} />
        )}

        <PageHeader
          title="Dashboard"
          subtitle={Formatters.monthYear(currentMonth + '-01')}
        />

        {/* KPI Cards */}
        <Grid cols={4} gap="gap-4">
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
        <Grid cols={2} gap="gap-4">
          <SpendingChart  transactions={transactions} month={currentMonth} />
          <CategoryDonut  transactions={transactions} month={currentMonth} />
        </Grid>

        {/* Budget Progress */}
        <BudgetProgress transactions={transactions} month={currentMonth} />

        {/* Recent Transactions + Upcoming Bills */}
        <Grid cols={2} gap="gap-4">
          <RecentTransactions transactions={transactions} onNavigate={onNavigate} />

          <Card>
            <CardHeader>
              <Heading level={3} className="text-sm font-semibold">Upcoming Bills</Heading>
            </CardHeader>
            <CardBody className="p-0">
              {upcomingBills.length === 0 ? (
                <EmptyState icon="CheckCircle" title="No upcoming bills" className="py-8" />
              ) : (
                <VStack gap="gap-0" className="divide-y divide-[#1a1a2e]">
                  {upcomingBills.map(bill => {
                    const cfg = BILL_STATUS_CONFIG[bill.status] ?? BILL_STATUS_CONFIG.upcoming;
                    return (
                      <HStack key={bill.merchant} gap="gap-3" className="px-4 py-3 justify-between">
                        <VStack gap="gap-0.5">
                          <Text className="text-sm font-medium">{bill.merchant}</Text>
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
