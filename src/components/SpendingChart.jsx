/**
 * SpendingChart — daily cumulative spend line chart for a given month.
 *
 * Globals: SpendingChart
 *
 * Props:
 *   transactions {Array}  full transaction list from useTransactions
 *   month        {string} YYYY-MM — defaults to current month
 *
 * Load order: must come after Card/CardHeader/CardBody (data-display),
 *             Heading, Caption (typography), EmptyState (other),
 *             and Formatters (formatters.js).
 */

window.SpendingChart = ({ transactions = [], month }) => {
  const activeMonth = month || new Date().toISOString().slice(0, 7);

  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  // ─── Build daily cumulative dataset ────────────────────────────────────────
  const { labels, data } = React.useMemo(() => {
    const [year, mon] = activeMonth.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();

    // Expenses only, for this month
    const monthExpenses = transactions.filter(t =>
      t.amount < 0 && t.date && String(t.date).startsWith(activeMonth)
    );

    // Sum absolute amounts per calendar day
    const dailyTotals = {};
    monthExpenses.forEach(t => {
      const day = parseInt(String(t.date).slice(8, 10), 10);
      dailyTotals[day] = (dailyTotals[day] || 0) + Math.abs(t.amount);
    });

    const labels = [];
    const data   = [];
    let cumulative = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      cumulative += dailyTotals[d] || 0;
      labels.push(String(d));
      data.push(parseFloat(cumulative.toFixed(2)));
    }

    return { labels, data };
  }, [transactions, activeMonth]);

  // ─── Chart lifecycle ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvasRef.current || !labels.length) return;

    // Destroy previous instance before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cumulative Spend',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              title: items => `Day ${items[0].label}`,
              label: ctx => `  ${Formatters.currency(ctx.parsed.y)} total`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: '#2a2a3d' },
            ticks: { color: '#9090b0', font: { family: 'DM Sans', size: 11 } },
          },
          y: {
            grid: { color: '#2a2a3d' },
            beginAtZero: true,
            ticks: {
              color: '#9090b0',
              font: { family: 'DM Sans', size: 11 },
              callback: val => Formatters.currency(val),
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
  }, [labels, data]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const hasData = data.length > 0 && data[data.length - 1] > 0;

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold text-[#f0f0fa]">
            Spending Trend
          </Heading>
          <Caption>{Formatters.monthYear(activeMonth)}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        <div className="relative h-56">
          {hasData ? (
            <canvas ref={canvasRef} />
          ) : (
            <EmptyState
              icon="TrendingUp"
              title="No spending data"
              description="No expenses recorded for this month."
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
};
