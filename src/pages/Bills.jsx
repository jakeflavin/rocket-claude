function BillsSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <HStack className="justify-between items-start">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </HStack>
        <Grid cols={2} gap="gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
      </VStack>
    </Box>
  );
}

/**
 * Bills — recurring Utilities + Housing transactions grouped by merchant,
 * sorted by estimated next due date ascending (most urgent first).
 * View toggle: List | Chart | Calendar
 */

function Bills() {
  const { billGroups, loading, error, reload } = useTransactions();
  const { settings } = useSettings();
  const [view, setView] = React.useState('list');

  const monthlyEstimate = billGroups.reduce(
    (sum, b) => sum + Math.abs(b.averageAmount), 0
  );

  // Resolve category colors once for both views
  const colorMap = React.useMemo(() => {
    const map = {};
    settings.categories.forEach(c => { map[c.name] = c.color; });
    return map;
  }, [settings.categories]);

  // Slices for the donut chart
  const billSlices = React.useMemo(() =>
    billGroups
      .filter(b => b.averageAmount !== 0)
      .map(b => ({
        label:  b.merchant,
        amount: parseFloat(Math.abs(b.averageAmount).toFixed(2)),
        color:  colorMap[b.category] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount),
    [billGroups, colorMap]
  );

  // Items for the calendar
  const billCalItems = React.useMemo(() =>
    billGroups
      .filter(b => b.estimatedNextDue)
      .map(b => ({
        merchant:     b.merchant,
        dueDate:      b.estimatedNextDue,
        color:        colorMap[b.category] || '#6b7280',
        tooltipLabel: `${b.merchant} — ${Formatters.currency(Math.abs(b.averageAmount))}`,
      })),
    [billGroups, colorMap]
  );

  if (loading) return <BillsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Bills" subtitle={`${billGroups.length} recurring`} />
          <HStack gap="gap-3">
            <HStack gap="gap-1" className="bg-raised rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-rim text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('chart')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'chart'
                    ? 'bg-rim text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-rim text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                Calendar
              </button>
            </HStack>
            <Stat label="Est. Monthly Total" value={Formatters.currency(monthlyEstimate)} />
          </HStack>
        </HStack>

        {billGroups.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="No recurring bills found"
            description="Bills appear when a merchant in Housing or Utilities charges you in 2+ months."
          />
        ) : view === 'chart' ? (
          <RecurringDonut slices={billSlices} centerLabel="Est. Monthly" />
        ) : view === 'calendar' ? (
          <RecurringCalendar items={billCalItems} />
        ) : (
          <Grid cols={2} gap="gap-4">
            {billGroups.map(bill => (
              <BillItem key={bill.merchant} bill={bill} />
            ))}
          </Grid>
        )}

      </VStack>
    </Box>
  );
}

window.Bills = Bills;
