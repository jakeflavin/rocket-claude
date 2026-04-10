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
      .filter(b => b.averageAmount !== 0)
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

// ─── Calendar view ───────────────────────────────────────────────────────────

const CAL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function BillsCalendar({ billGroups }) {
  const { settings } = useSettings();
  const [calDate, setCalDate] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const prevMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun

  // Build a lookup: day-of-month → bills due that day
  const billsByDay = React.useMemo(() => {
    const colorMap = {};
    settings.categories.forEach(c => { colorMap[c.name] = c.color; });

    const map = {};
    billGroups.forEach(bill => {
      if (!bill.estimatedNextDue) return;
      const due = new Date(bill.estimatedNextDue + 'T12:00:00');
      if (due.getFullYear() === year && due.getMonth() === month) {
        const day = due.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({ ...bill, color: colorMap[bill.category] || '#6b7280' });
      }
    });
    return map;
  }, [billGroups, year, month, settings.categories]);

  // Build grid cells: leading empty + days + trailing empty
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstWeekday + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const monthLabel = calDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <HStack className="justify-between items-center">
          <button onClick={prevMonth} className="text-[#9090b0] hover:text-[#f0f0fa] transition-colors p-1">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <Heading level={3} className="text-sm font-semibold">{monthLabel}</Heading>
          <button onClick={nextMonth} className="text-[#9090b0] hover:text-[#f0f0fa] transition-colors p-1">
            <Icon name="ChevronRight" size={16} />
          </button>
        </HStack>
      </CardHeader>
      <CardBody className="p-3">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {CAL_DAYS.map(d => (
            <div key={d} className="text-center text-xs text-[#555575] font-medium py-1">{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px">
          {cells.map((day, i) => {
            const bills = day ? (billsByDay[day] || []) : [];
            return (
              <div
                key={i}
                className={`min-h-[72px] rounded p-1 ${
                  day ? 'bg-[#0f0f1a]' : 'bg-transparent'
                } ${isToday(day) ? 'ring-1 ring-emerald-500' : ''}`}
              >
                {day && (
                  <VStack gap="gap-1">
                    <Text className={`text-xs font-medium text-right pr-0.5 ${
                      isToday(day) ? 'text-emerald-400' : 'text-[#9090b0]'
                    }`}>
                      {day}
                    </Text>
                    {bills.map(b => (
                      <Tooltip key={b.merchant} label={`${b.merchant} — ${Formatters.currency(Math.abs(b.averageAmount))}`}>
                        <div
                          className="text-[10px] leading-tight rounded px-1 py-0.5 truncate cursor-default"
                          style={{ backgroundColor: `${b.color}33`, color: b.color }}
                        >
                          {b.merchant}
                        </div>
                      </Tooltip>
                    ))}
                  </VStack>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Bills page ──────────────────────────────────────────────────────────────

/**
 * Bills — recurring Utilities + Housing transactions grouped by merchant,
 * sorted by estimated next due date ascending (most urgent first).
 * View toggle: List | Chart | Calendar
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
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-[#2a2a3d] text-[#f0f0fa]'
                    : 'text-[#9090b0] hover:text-[#f0f0fa]'
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
          <BillsDonut billGroups={billGroups} />
        ) : view === 'calendar' ? (
          <BillsCalendar billGroups={billGroups} />
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
