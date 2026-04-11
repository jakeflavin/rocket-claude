/**
 * charts.jsx — Chart.js helpers and all chart components.
 *
 * Globals exposed:
 *   ChartTheme      — reads CSS custom properties; builds tooltip/scales configs
 *   useChart        — Chart.js lifecycle hook (create / destroy on deps change)
 *   ChartHelpers    — shared data-transformation utilities (hueRotatedSlices)
 *   SpendingChart   — cumulative spend line chart or monthly bar chart
 *   CategoryDonut   — doughnut chart of expenses by category
 *   RecurringDonut  — shared doughnut for Bills and Subscriptions chart views
 *
 * Load order: must come after all other UI library files (uses Card, HStack,
 *             VStack, Heading, Caption, Text, EmptyState, etc.).
 *             Formatters and Chart.js globals are referenced at render time
 *             only, so they do not need to be loaded before this file.
 */

// ─── ChartTheme ───────────────────────────────────────────────────────────────
// Reads CSS custom properties at call time so charts always reflect the active
// theme (dark / light / system). Call ChartTheme.read() inside buildConfig,
// not at module level.

window.ChartTheme = {
  /** Return current theme token values from CSS custom properties. */
  read() {
    const cv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return {
      raised: cv('--c-raised'),
      rim:    cv('--c-rim'),
      fg:     cv('--c-fg'),
      muted:  cv('--c-muted'),
    };
  },

  /**
   * Return a Chart.js tooltip config using the current theme tokens.
   * @param {object} t        — result of ChartTheme.read()
   * @param {object} callbacks — Chart.js tooltip callbacks object
   */
  tooltip(t, callbacks = {}) {
    return {
      backgroundColor: t.raised,
      borderColor:     t.rim,
      borderWidth:     1,
      titleColor:      t.fg,
      bodyColor:       t.muted,
      padding:         12,
      callbacks,
    };
  },

  /**
   * Return Chart.js x/y scales config for line and bar charts.
   * @param {object}   t       — result of ChartTheme.read()
   * @param {Function} yTickFn — optional tick formatter (e.g. v => Formatters.currency(v))
   */
  scales(t, yTickFn = v => v) {
    const tick = { color: t.muted, font: { family: 'DM Sans', size: 11 } };
    return {
      x: { grid: { color: t.rim }, ticks: tick },
      y: {
        grid: { color: t.rim },
        beginAtZero: true,
        ticks: { ...tick, callback: yTickFn },
      },
    };
  },
};

// ─── useChart ────────────────────────────────────────────────────────────────
// Replaces the repeated useRef + useEffect destroy/recreate pattern in every
// chart component.
//
// Usage:
//   const canvasRef = React.useRef(null);
//   useChart(canvasRef, () => {
//     if (!data.length) return null;         // return null to skip creation
//     const t = ChartTheme.read();
//     return { type: 'line', data: {...}, options: {...} };
//   }, [data]);

window.useChart = (canvasRef, buildConfig, deps) => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const cfg = buildConfig();
    if (!cfg) return;

    chartRef.current = new Chart(canvasRef.current, cfg);

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return chartRef;
};

// ─── ChartHelpers ─────────────────────────────────────────────────────────────

window.ChartHelpers = {
  /**
   * Generate donut slices from recurring groups using a hue-rotated color
   * palette derived from a single base hex color. Used by Subscriptions.
   *
   * @param {Array}  groups  — subscriptionGroups from useTransactions
   * @param {string} baseHex — hex color (e.g. "#ec4899") as palette seed
   * @returns {Array<{label, amount, color}>}
   */
  hueRotatedSlices(groups, baseHex) {
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
      return '#' + [f(0), f(8), f(4)]
        .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
        .join('');
    };

    return groups
      .filter(g => g.monthlyAmount !== 0)
      .map((g, i) => ({
        label:  g.merchant,
        amount: parseFloat(Math.abs(g.monthlyAmount).toFixed(2)),
        color:  hslToHex((hue + i * 37) % 360, Math.max(0.4, sat), Math.max(0.4, lit)),
      }))
      .sort((a, b) => b.amount - a.amount);
  },
};

// ─── SpendingChart ───────────────────────────────────────────────────────────
/**
 * Cumulative spend line chart (≤31 day ranges) or monthly bar chart (longer).
 *
 * Props:
 *   transactions {Array}  full transaction list from useTransactions
 *   start        {string} YYYY-MM-DD range start
 *   end          {string} YYYY-MM-DD range end
 *   rangeLabel   {string} display label shown in the card caption
 */
window.SpendingChart = ({ transactions = [], start, end, rangeLabel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeStart = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const activeEnd   = end   || today;

  const canvasRef = React.useRef(null);

  // ─── Build dataset ─────────────────────────────────────────────────────────
  const { labels, data, isMultiMonth } = React.useMemo(() => {
    const rangeExpenses = transactions.filter(t =>
      t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd
    );

    const startDate = new Date(activeStart);
    const endDate   = new Date(activeEnd);
    const daysDiff  = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 31) {
      const dailyTotals = {};
      rangeExpenses.forEach(t => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + Math.abs(t.amount);
      });
      const labels = [], data = [];
      let cumulative = 0;
      const d = new Date(startDate);
      while (d <= endDate) {
        const key = d.toISOString().slice(0, 10);
        cumulative += dailyTotals[key] || 0;
        labels.push(daysDiff <= 14 ? `${d.getMonth() + 1}/${d.getDate()}` : String(d.getDate()));
        data.push(parseFloat(cumulative.toFixed(2)));
        d.setDate(d.getDate() + 1);
      }
      return { labels, data, isMultiMonth: false };
    }

    const monthlyTotals = {};
    rangeExpenses.forEach(t => {
      const m = t.date.slice(0, 7);
      monthlyTotals[m] = (monthlyTotals[m] || 0) + Math.abs(t.amount);
    });
    const labels = [], data = [];
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
  useChart(canvasRef, () => {
    if (!labels.length) return null;
    const t = ChartTheme.read();
    const scales = ChartTheme.scales(t, v => Formatters.currency(v));

    if (isMultiMonth) {
      return {
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
            tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed.y)}` }),
          },
          scales,
        },
      };
    }

    return {
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
          tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed.y)} total` }),
        },
        scales,
      },
    };
  }, [labels, data, isMultiMonth]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const hasData = data.length > 0 && data.some(v => v > 0);

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold">Spending Trend</Heading>
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

// ─── CategoryDonut ────────────────────────────────────────────────────────────
/**
 * Doughnut chart of expenses by category with custom legend.
 * Colors are driven entirely by the `categories` prop — nothing hardcoded.
 *
 * Props:
 *   transactions {Array}   full transaction list from useTransactions
 *   categories   {Array}   settings.categories — [{ name, color, icon }]
 *   start        {string}  YYYY-MM-DD range start
 *   end          {string}  YYYY-MM-DD range end
 *   rangeLabel   {string}  display label shown in the card caption
 */
window.CategoryDonut = ({ transactions = [], categories = [], start, end, rangeLabel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeStart = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const activeEnd   = end   || today;

  const canvasRef = React.useRef(null);

  // ─── Build per-category totals ──────────────────────────────────────────────
  const slices = React.useMemo(() => {
    const colorMap = {};
    categories.forEach(c => { colorMap[c.name] = c.color; });

    const totals = {};
    transactions
      .filter(t => t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd)
      .forEach(t => {
        const cat = t.category || 'Misc';
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount);
      });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
        color:  colorMap[name] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, activeStart, activeEnd, categories]);

  // ─── Chart lifecycle ────────────────────────────────────────────────────────
  useChart(canvasRef, () => {
    if (!slices.length) return null;
    const t = ChartTheme.read();
    return {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.name),
        datasets: [{
          data:             slices.map(s => s.amount),
          backgroundColor:  slices.map(s => `${s.color}cc`),
          borderColor:      slices.map(s => s.color),
          borderWidth:      1.5,
          hoverBorderWidth: 2,
          hoverOffset:      4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend:  { display: false },
          tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed)}` }),
        },
      },
    };
  }, [slices]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold">Spending by Category</Heading>
          <Caption>{rangeLabel || 'This Month'}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        {slices.length === 0 ? (
          <EmptyState
            icon="PieChart"
            title="No spending data"
            description="No expenses recorded for this period."
          />
        ) : (
          <VStack gap="gap-5">
            {/* Donut canvas with centred total */}
            <div className="relative h-48 flex items-center justify-center">
              <canvas ref={canvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Caption>Total</Caption>
                <Text className="text-base font-bold font-mono text-fg">
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
                      <Text className="text-xs text-muted truncate">{s.name}</Text>
                    </HStack>
                    <HStack gap="gap-3" className="items-center shrink-0">
                      <Caption>{pct}%</Caption>
                      <Text className="text-xs font-mono text-fg w-20 text-right">
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

// ─── RecurringDonut ───────────────────────────────────────────────────────────
/**
 * Shared doughnut chart for Bills and Subscriptions chart views.
 * Accepts pre-computed, pre-sorted slices so each page controls its own data.
 *
 * Props:
 *   slices        {Array<{label, amount, color}>}
 *   centerLabel   {string}  caption above the total (default: "Total")
 *   tooltipSuffix {string}  appended to tooltip value (e.g. "/mo")
 */
window.RecurringDonut = ({ slices = [], centerLabel = 'Total', tooltipSuffix = '' }) => {
  const canvasRef = React.useRef(null);

  useChart(canvasRef, () => {
    if (!slices.length) return null;
    const t = ChartTheme.read();
    return {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.label),
        datasets: [{
          data:            slices.map(s => s.amount),
          backgroundColor: slices.map(s => `${s.color}cc`),
          borderColor:     slices.map(s => s.color),
          borderWidth:     1.5,
          hoverOffset:     4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend:  { display: false },
          tooltip: ChartTheme.tooltip(t, {
            label: ctx => `  ${Formatters.currency(ctx.parsed)}${tooltipSuffix}`,
          }),
        },
      },
    };
  }, [slices]);

  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Card>
      <CardBody>
        <VStack gap="gap-6">
          <div className="relative h-64 flex items-center justify-center">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Caption>{centerLabel}</Caption>
              <Text className="text-lg font-bold font-mono text-fg">
                {Formatters.currency(total)}
                {tooltipSuffix && (
                  <span className="text-sm font-normal text-muted">{tooltipSuffix}</span>
                )}
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
                    <Text className="text-xs text-muted truncate">{s.label}</Text>
                  </HStack>
                  <HStack gap="gap-3" className="items-center shrink-0">
                    <Caption>{pct}%</Caption>
                    <Text className="text-xs font-mono text-fg w-20 text-right">
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
};
