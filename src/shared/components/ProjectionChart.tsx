import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

type Props = {
  historicalData: { label: string; value: number }[];
  projectionData: { label: string; value: number }[];
  targetValue?: number;
  height?: number;
  valueFormatter?: (v: number) => string;
  emptyMessage?: string;
};

type FlatPoint = { label: string; hist?: number; proj?: number };

function mergeData(
  historical: { label: string; value: number }[],
  projection: { label: string; value: number }[],
): FlatPoint[] {
  const map = new Map<string, FlatPoint>();
  const order: string[] = [];

  for (const p of historical) {
    if (!map.has(p.label)) { map.set(p.label, { label: p.label }); order.push(p.label); }
    map.get(p.label)!.hist = p.value;
  }
  for (const p of projection) {
    if (!map.has(p.label)) { map.set(p.label, { label: p.label }); order.push(p.label); }
    map.get(p.label)!.proj = p.value;
  }

  return order.map((l) => map.get(l)!);
}

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipProps<number, string> & { valueFormatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  const fmt = valueFormatter ?? ((v: number) => String(v));
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-text mb-1">{label}</p>
      {payload.map((entry) => {
        if (entry.value == null) return null;
        const isProj = entry.dataKey === 'proj';
        return (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {isProj ? 'Projected' : 'Actual'}: {fmt(entry.value as number)}
          </p>
        );
      })}
    </div>
  );
}

export function ProjectionChart({
  historicalData,
  projectionData,
  targetValue,
  height = 200,
  valueFormatter,
  emptyMessage = 'No data available.',
}: Props) {
  if (historicalData.length === 0 && projectionData.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted" style={{ height }}>
        {emptyMessage}
      </div>
    );
  }

  const data = mergeData(historicalData, projectionData);
  const allValues = [...historicalData, ...projectionData].map((p) => p.value);
  const maxVal = Math.max(...allValues, targetValue ?? 0);
  const yMax = maxVal * 1.1;

  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, yMax]}
          tickFormatter={(v) => fmt(v)}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />

        {targetValue != null && (
          <ReferenceLine
            y={targetValue}
            stroke="var(--color-success)"
            strokeDasharray="4 3"
            label={{ value: 'Target', position: 'insideTopRight', fontSize: 10, fill: 'var(--color-success)' }}
          />
        )}

        {/* Historical — solid area */}
        <Area
          type="monotone"
          dataKey="hist"
          stroke="var(--color-brand)"
          strokeWidth={2}
          fill="var(--color-brand)"
          fillOpacity={0.15}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />

        {/* Projection — dashed line only */}
        <Line
          type="monotone"
          dataKey="proj"
          stroke="var(--color-success)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
