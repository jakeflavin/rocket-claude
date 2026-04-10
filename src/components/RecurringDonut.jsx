/**
 * RecurringDonut — shared Chart.js doughnut for recurring items (bills or subscriptions).
 *
 * Props:
 *   slices        {Array<{label, amount, color}>}  Pre-computed, pre-sorted slices.
 *   centerLabel   {string}  Caption above the total (e.g. "Monthly", "Est. Monthly").
 *   tooltipSuffix {string}  Appended to tooltip amount (e.g. "/mo" or "").
 */
function RecurringDonut({ slices, centerLabel = 'Total', tooltipSuffix = '' }) {
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

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
            callbacks: { label: ctx => `  ${Formatters.currency(ctx.parsed)}${tooltipSuffix}` },
          },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
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
              <Text className="text-lg font-bold font-mono text-[#f0f0fa]">
                {Formatters.currency(total)}
                {tooltipSuffix && (
                  <span className="text-sm font-normal text-[#9090b0]">{tooltipSuffix}</span>
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

window.RecurringDonut = RecurringDonut;
