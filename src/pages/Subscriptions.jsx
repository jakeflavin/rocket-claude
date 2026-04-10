/**
 * Subscriptions — grouped by merchant with subcategory filter tabs.
 * View toggle: List | Chart
 *
 * Layout:
 *   PageHeader with monthly total + view toggle
 *   Tabs: All | Streaming | Software | Memberships
 *   Grid of SubscriptionCards  OR  SubscriptionsDonut
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

// ─── Donut chart — colors generated from the Subscriptions category base ─────

function SubscriptionsDonut({ groups }) {
  const { settings } = useSettings();
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  const slices = React.useMemo(() => {
    // Derive a palette by rotating hue from the Subscriptions category color
    const base = settings.categories.find(c => c.name === 'Subscriptions')?.color || '#6366f1';
    const r = parseInt(base.slice(1, 3), 16);
    const g = parseInt(base.slice(3, 5), 16);
    const b = parseInt(base.slice(5, 7), 16);

    // Convert to HSL for hue rotation
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const lit = (max + min) / 2;
    const sat = max === min ? 0 : lit > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    let hue = 0;
    if (max !== min) {
      if (max === rn) hue = ((gn - bn) / (max - min) + 6) % 6;
      else if (max === gn) hue = (bn - rn) / (max - min) + 2;
      else hue = (rn - gn) / (max - min) + 4;
      hue = hue * 60;
    }

    const hslToHex = (hh, ss, ll) => {
      const a = ss * Math.min(ll, 1 - ll);
      const f = n => { const k = (n + hh / 30) % 12; return ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    };

    return groups
      .filter(g => g.monthlyAmount > 0)
      .map((g, i) => ({
        label:  g.merchant,
        amount: parseFloat(Math.abs(g.monthlyAmount).toFixed(2)),
        color:  hslToHex((hue + i * 37) % 360, Math.max(0.4, sat), Math.max(0.4, lit)),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [groups, settings.categories]);

  React.useEffect(() => {
    if (!canvasRef.current || !slices.length) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.label),
        datasets: [{
          data:            slices.map(s => s.amount),
          backgroundColor: slices.map(s => `${s.color}cc`),
          borderColor:     slices.map(s => s.color),
          borderWidth: 1.5,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a26',
            borderColor: '#2a2a3d',
            borderWidth: 1,
            titleColor: '#f0f0fa',
            bodyColor: '#9090b0',
            padding: 12,
            callbacks: { label: ctx => `  ${Formatters.currency(ctx.parsed)}/mo` },
          },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [slices]);

  const total = slices.reduce((s, b) => s + b.amount, 0);

  return (
    <Card>
      <CardBody>
        <VStack gap="gap-6">
          <div className="relative h-64 flex items-center justify-center">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Caption>Monthly</Caption>
              <Text className="text-lg font-bold font-mono text-[#f0f0fa]">
                {Formatters.currency(total)}<span className="text-sm font-normal text-[#9090b0]">/mo</span>
              </Text>
            </div>
          </div>
          <VStack gap="gap-2">
            {slices.map(s => {
              const pct = total > 0 ? ((s.amount / total) * 100).toFixed(1) : '0.0';
              return (
                <HStack key={s.label} className="justify-between">
                  <HStack gap="gap-2" className="items-center min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <Text className="text-xs text-[#9090b0] truncate">{s.label}</Text>
                  </HStack>
                  <HStack gap="gap-3" className="items-center shrink-0">
                    <Caption>{pct}%</Caption>
                    <Text className="text-xs font-mono text-[#f0f0fa] w-20 text-right">
                      {Formatters.currency(s.amount)}
                    </Text>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Subscriptions() {
  const { subscriptionGroups, loading, error, reload } = useTransactions();

  const [tab,  setTab]  = React.useState('All');
  const [view, setView] = React.useState('list');

  const monthlyTotal = subscriptionGroups.reduce(
    (sum, s) => sum + Math.abs(s.monthlyAmount), 0
  );

  const visible = tab === 'All'
    ? subscriptionGroups
    : subscriptionGroups.filter(s => s.subcategory === tab);

  if (loading) return <SubscriptionsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Subscriptions" subtitle={`${subscriptionGroups.length} active`} />
          <HStack gap="gap-3">
            <HStack gap="gap-1" className="bg-[#1a1a26] rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-[#2a2a3d] text-[#f0f0fa]'
                    : 'text-[#9090b0] hover:text-[#f0f0fa]'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('chart')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'chart'
                    ? 'bg-[#2a2a3d] text-[#f0f0fa]'
                    : 'text-[#9090b0] hover:text-[#f0f0fa]'
                }`}
              >
                Chart
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
              <SubscriptionsDonut groups={visible} />
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
