import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

export type LineAreaChartDataPoint = {
  label: string;
  value: number;
};

export type LineAreaChartSeries = {
  key: string;
  label: string;
  color: string;
  data: LineAreaChartDataPoint[];
};

type Props = {
  series: LineAreaChartSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
  emptyMessage?: string;
};

type FlatPoint = { label: string } & Record<string, number>;

function CustomTooltip({
  active,
  payload,
  label,
  series,
  valueFormatter,
}: TooltipProps<number, string> & { series: LineAreaChartSeries[]; valueFormatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2 shadow-md text-sm min-w-[140px]">
      <p className="text-xs text-muted mb-1.5">{label}</p>
      {payload.map((entry) => {
        const s = series.find((s) => s.key === entry.dataKey);
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted">{s?.label ?? entry.dataKey}</span>
            </div>
            <span className="font-medium text-text tabular-nums">
              {valueFormatter ? valueFormatter(entry.value as number) : entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LineAreaChart({ series, height = 240, valueFormatter, emptyMessage = 'No data available.' }: Props) {
  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  // Merge series into a single flat array keyed by label
  const labelSet = new Set<string>();
  for (const s of series) s.data.forEach((d) => labelSet.add(d.label));
  const labels = Array.from(labelSet);

  const flatData: FlatPoint[] = labels.map((label) => {
    const point: FlatPoint = { label };
    for (const s of series) {
      const match = s.data.find((d) => d.label === label);
      point[s.key] = match?.value ?? 0;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={flatData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
          width={52}
        />
        <Tooltip content={<CustomTooltip series={series} valueFormatter={valueFormatter} />} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, fill: s.color, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
