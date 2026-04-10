/**
 * CategoryDonut — doughnut chart of expenses by category for a given month.
 *
 * Colors come exclusively from settings.json — nothing is hardcoded.
 * Renders a custom legend below the chart (Chart.js built-in legend disabled).
 *
 * Globals: CategoryDonut
 *
 * Props:
 *   transactions {Array}  full transaction list from useTransactions
 *   month        {string} YYYY-MM — defaults to current month
 *
 * Load order: must come after Card/CardHeader/CardBody (data-display),
 *             Heading, Caption (typography), EmptyState (other),
 *             Formatters (formatters.js), and SettingsContext.
 */

window.CategoryDonut = ({ transactions = [], month }) => {
  const activeMonth = month || new Date().toISOString().slice(0, 7);
  const { settings } = useSettings();

  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  // ─── Build per-category totals ──────────────────────────────────────────────
  const slices = React.useMemo(() => {
    // Build a color lookup from settings to avoid hardcoding
    const colorMap = {};
    settings.categories.forEach(c => { colorMap[c.name] = c.color; });

    const totals = {};
    transactions
      .filter(t => t.amount < 0 && t.date && String(t.date).startsWith(activeMonth))
      .forEach(t => {
        const cat = t.category || 'Misc';
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
      });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
        color: colorMap[name] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, activeMonth, settings.categories]);

  // ─── Chart lifecycle ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvasRef.current || !slices.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.name),
        datasets: [{
          data: slices.map(s => s.amount),
          backgroundColor: slices.map(s => `${s.color}cc`), // ~80% opacity fill
          borderColor:     slices.map(s => s.color),
          borderWidth: 1.5,
          hoverBorderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a26',
            borderColor: '#2a2a3d',
            borderWidth: 1,
            titleColor: '#f0f0fa',
            bodyColor: '#9090b0',
            padding: 12,
            callbacks: {
              label: ctx => `  ${Formatters.currency(ctx.parsed)}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [slices]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold text-[#f0f0fa]">
            Spending by Category
          </Heading>
          <Caption>{Formatters.monthYear(activeMonth)}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        {slices.length === 0 ? (
          <EmptyState
            icon="PieChart"
            title="No spending data"
            description="No expenses recorded for this month."
          />
        ) : (
          <VStack gap="gap-5">
            {/* Donut canvas with centred total */}
            <div className="relative h-48 flex items-center justify-center">
              <canvas ref={canvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Caption>Total</Caption>
                <Text className="text-base font-bold font-mono text-[#f0f0fa]">
                  {Formatters.currency(total)}
                </Text>
              </div>
            </div>

            {/* Custom legend */}
            <VStack gap="gap-1.5">
              {slices.map(s => {
                const pct = total > 0 ? ((s.amount / total) * 100).toFixed(1) : '0.0';
                return (
                  <HStack key={s.name} className="items-center justify-between">
                    <HStack gap="gap-2" className="items-center min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <Text className="text-xs text-[#9090b0] truncate">{s.name}</Text>
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
        )}
      </CardBody>
    </Card>
  );
};
