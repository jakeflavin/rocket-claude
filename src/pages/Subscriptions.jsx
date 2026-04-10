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

// Derive a hue-rotated palette from a single base hex color
function hueRotatedSlices(groups, baseHex) {
  const r = parseInt(baseHex.slice(1, 3), 16);
  const g = parseInt(baseHex.slice(3, 5), 16);
  const b = parseInt(baseHex.slice(5, 7), 16);

  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const lit = (max + min) / 2;
  const sat = max === min ? 0 : lit > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min);
  let hue = 0;
  if (max !== min) {
    if (max === rn)      hue = ((gn - bn) / (max - min) + 6) % 6;
    else if (max === gn) hue = (bn - rn) / (max - min) + 2;
    else                 hue = (rn - gn) / (max - min) + 4;
    hue = hue * 60;
  }

  const hslToHex = (hh, ss, ll) => {
    const a = ss * Math.min(ll, 1 - ll);
    const f = n => {
      const k = (n + hh / 30) % 12;
      return ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  };

  return groups
    .filter(g => g.monthlyAmount !== 0)
    .map((g, i) => ({
      label:  g.merchant,
      amount: parseFloat(Math.abs(g.monthlyAmount).toFixed(2)),
      color:  hslToHex((hue + i * 37) % 360, Math.max(0.4, sat), Math.max(0.4, lit)),
    }))
    .sort((a, b) => b.amount - a.amount);
}

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
    () => hueRotatedSlices(visible, baseColor),
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
