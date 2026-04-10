/**
 * SpendingChart — cumulative spend line chart (short range) or monthly bar
 * chart (longer range).
 *
 * Globals: SpendingChart
 *
 * Props:
 *   transactions {Array}  full transaction list from useTransactions
 *   start        {string} YYYY-MM-DD range start
 *   end          {string} YYYY-MM-DD range end
 *   rangeLabel   {string} display label for the range (caption)
 *
 * Load order: must come after Card/CardHeader/CardBody (data-display),
 *             Heading, Caption (typography), EmptyState (other),
 *             and Formatters (formatters.js).
 */

window.SpendingChart = ({ transactions = [], start, end, rangeLabel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeStart = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const activeEnd   = end || today;

  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  // ─── Build dataset ──────────────────────────────────────────────────────────
  const { labels, data, isMultiMonth } = React.useMemo(() => {
    const rangeExpenses = transactions.filter(t =>
      t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd
    );

    const startDate = new Date(activeStart);
    const endDate   = new Date(activeEnd);
    const daysDiff  = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 31) {
      // Day-by-day cumulative
      const dailyTotals = {};
      rangeExpenses.forEach(t => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + Math.abs(t.amount);
      });

      const labels = [];
      const data   = [];
      let cumulative = 0;
      const d = new Date(startDate);
      while (d <= endDate) {
        const key = d.toISOString().slice(0, 10);
        cumulative += dailyTotals[key] || 0;
        labels.push(daysDiff <= 14
          ? `${d.getMonth() + 1}/${d.getDate()}`
          : String(d.getDate())
        );
        data.push(parseFloat(cumulative.toFixed(2)));
        d.setDate(d.getDate() + 1);
      }
      return { labels, data, isMultiMonth: false };
    }

    // Month-by-month totals
    const monthlyTotals = {};
    rangeExpenses.forEach(t => {
      const m = t.date.slice(0, 7);
      monthlyTotals[m] = (monthlyTotals[m] || 0) + Math.abs(t.amount);
    });

    const labels = [];
    const data   = [];
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (d <= endMonth) {
      const key = d.toISOString().slice(0, 7);
      labels.push(d.toLocaleString('default', { month: 'short' }));
      data.push(parseFloat((monthlyTotals[key] || 0).toFixed(2)));
      d.setMonth(d.getMonth() + 1);
    }
    return { labels, data, isMultiMonth: true };
  }, [transactions, activeStart, activeEnd]);

  // ─── Chart lifecycle ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canvasRef.current || !labels.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const sharedScales = {
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
    };

    if (isMultiMonth) {
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Spend',
            data,
            backgroundColor: 'rgba(16,185,129,0.5)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4,
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
                label: ctx => `  ${Formatters.currency(ctx.parsed.y)}`,
              },
            },
          },
          scales: sharedScales,
        },
      });
    } else {
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
                label: ctx => `  ${Formatters.currency(ctx.parsed.y)} total`,
              },
            },
          },
          scales: sharedScales,
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, data, isMultiMonth]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const hasData = data.length > 0 && data.some(v => v > 0);

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold text-[#f0f0fa]">
            Spending Trend
          </Heading>
          <Caption>{rangeLabel || 'This Month'}</Caption>
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
              description="No expenses recorded for this period."
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
};
