import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from 'recharts';

export type GroupedBarChartSeries = {
  key: string;
  label: string;
  color: string;
  data: { label: string; value: number }[];
};

type Props = {
  series: GroupedBarChartSeries[];
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
}: TooltipProps<number, string> & {
  series: GroupedBarChartSeries[];
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2 shadow-md text-sm min-w-[160px]">
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

function CustomLegend({ series }: { series: GroupedBarChartSeries[] }) {
  return (
    <div className="flex items-center justify-center gap-5 pt-2">
      {series.map((s) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
          <span className="text-xs text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function GroupedBarChart({
  series,
  height = 260,
  valueFormatter,
  emptyMessage = 'No data available.',
}: Props) {
  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  // Merge all series into flat points keyed by label
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
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={flatData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={3}>
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
            width={56}
          />
          <Tooltip content={<CustomTooltip series={series} valueFormatter={valueFormatter} />} cursor={{ fill: 'var(--color-hover)' }} />
          <Legend content={<CustomLegend series={series} />} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={40} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
