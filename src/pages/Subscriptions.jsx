/**
 * Subscriptions — grouped by merchant with subcategory filter tabs.
 * View toggle: List | Chart | Calendar
 *
 * Layout:
 *   PageHeader with monthly total + view toggle
 *   Tabs: All | Streaming | Software | Memberships
 *   Grid of SubscriptionCards  OR  RecurringDonut  OR  RecurringCalendar
 */

function SubscriptionsSkeleton() {
  return (
    <Box className="p-6">
      <VStack gap="gap-6">
        <HStack className="justify-between items-start">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </HStack>
        <Skeleton className="h-10 rounded" />
        <Grid cols={3} gap="gap-4">
          {[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </Grid>
      </VStack>
    </Box>
  );
}

const SUBCATEGORY_TABS = ['All', 'Streaming', 'Software', 'Memberships'];

// ─── Page ─────────────────────────────────────────────────────────────────────

function Subscriptions() {
  const { subscriptionGroups, loading, error, reload } = useTransactions();
  const { settings } = useSettings();

  const [tab,  setTab]  = React.useState('All');
  const [view, setView] = React.useState('list');

  const monthlyTotal = subscriptionGroups.reduce(
    (sum, s) => sum + Math.abs(s.monthlyAmount), 0
  );

  const visible = tab === 'All'
    ? subscriptionGroups
    : subscriptionGroups.filter(s => s.subcategory === tab);

  // Base color for the Subscriptions category (used by both chart and calendar)
  const baseColor = React.useMemo(
    () => settings.categories.find(c => c.name === 'Subscriptions')?.color || '#6366f1',
    [settings.categories]
  );

  // Slices for the donut chart — hue-rotated from the base color
  const subSlices = React.useMemo(
    () => ChartHelpers.hueRotatedSlices(visible, baseColor),
    [visible, baseColor]
  );

  // Items for the calendar
  const subCalItems = React.useMemo(() =>
    visible
      .filter(s => s.lastChargedDate)
      .map(s => {
        const nextDue = Categorizer._nextDueDate(s.lastChargedDate);
        if (!nextDue) return null;
        return {
          merchant:     s.merchant,
          dueDate:      nextDue,
          color:        baseColor,
          tooltipLabel: `${s.merchant} — ${Formatters.currency(Math.abs(s.monthlyAmount))}/mo`,
        };
      })
      .filter(Boolean),
    [visible, baseColor]
  );

  if (loading) return <SubscriptionsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Subscriptions" subtitle={`${subscriptionGroups.length} active`} />
          <HStack gap="gap-3">
            <ViewToggle view={view} onChange={setView} />
            <Stat label="Monthly Total" value={`${Formatters.currency(monthlyTotal)}/mo`} />
          </HStack>
        </HStack>

        <Box>
          <Tabs value={tab} onChange={setTab}>
            {SUBCATEGORY_TABS.map(t => <Tab key={t} value={t}>{t}</Tab>)}
          </Tabs>

          <Box className="pt-6">
            {visible.length === 0 ? (
              <EmptyState
                icon="CreditCard"
                title="No subscriptions"
                description={tab === 'All' ? 'No subscription transactions found.' : `No ${tab} subscriptions found.`}
              />
            ) : view === 'chart' ? (
              <RecurringDonut slices={subSlices} centerLabel="Monthly" tooltipSuffix="/mo" />
            ) : view === 'calendar' ? (
              <RecurringCalendar items={subCalItems} />
            ) : (
              <Grid cols={3} gap="gap-4">
                {visible.map(s => (
                  <SubscriptionCard key={s.merchant} subscription={s} />
                ))}
              </Grid>
            )}
          </Box>
        </Box>

      </VStack>
    </Box>
  );
}

window.Subscriptions = Subscriptions;
