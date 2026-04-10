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

// ─── Pie chart (local, no separate file needed) ──────────────────────────────

function BillsDonut({ billGroups }) {
  const { settings } = useSettings();
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  const slices = React.useMemo(() => {
    const colorMap = {};
    settings.categories.forEach(c => { colorMap[c.name] = c.color; });
    return billGroups
      .filter(b => b.averageAmount > 0)
      .map(b => ({
        label:  b.merchant,
        amount: parseFloat(Math.abs(b.averageAmount).toFixed(2)),
        color:  colorMap[b.category] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [billGroups, settings.categories]);

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
            callbacks: { label: ctx => `  ${Formatters.currency(ctx.parsed)}` },
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
              <Caption>Est. Monthly</Caption>
              <Text className="text-lg font-bold font-mono text-[#f0f0fa]">
                {Formatters.currency(total)}
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

// ─── Bills page ──────────────────────────────────────────────────────────────

/**
 * Bills — recurring Utilities + Housing transactions grouped by merchant,
 * sorted by estimated next due date ascending (most urgent first).
 * View toggle: List | Chart
 */

function Bills() {
  const { billGroups, loading, error, reload } = useTransactions();
  const [view, setView] = React.useState('list');

  const monthlyEstimate = billGroups.reduce(
    (sum, b) => sum + Math.abs(b.averageAmount), 0
  );

  if (loading) return <BillsSkeleton />;
  if (error)   return <DataErrorState error={error} onRetry={reload} />;

  return (
    <Box className="p-6">
      <VStack gap="gap-6">

        <HStack className="justify-between items-start flex-wrap gap-3">
          <PageHeader title="Bills" subtitle={`${billGroups.length} recurring`} />
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
          <BillsDonut billGroups={billGroups} />
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
