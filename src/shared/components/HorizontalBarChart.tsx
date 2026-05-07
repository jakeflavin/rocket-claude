import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts';

export type HorizontalBarChartItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: HorizontalBarChartItem[];
  height?: number;
  valueFormatter?: (v: number) => string;
  onBarClick?: (id: string) => void;
  selectedId?: string | null;
  emptyMessage?: string;
};

function CustomTooltip({
  active,
  payload,
  valueFormatter,
}: TooltipProps<number, string> & { valueFormatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-text">{item.name}</p>
      <p className="text-muted mt-0.5">
        {valueFormatter ? valueFormatter(item.value as number) : item.value}
      </p>
    </div>
  );
}

const DEFAULT_COLOR = 'var(--color-brand)';
const MUTED_OPACITY = 0.35;

export function HorizontalBarChart({
  data,
  height = 280,
  valueFormatter,
  onBarClick,
  selectedId,
  emptyMessage = 'No data available.',
}: Props) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>
    );
  }

  const hasSelection = selectedId != null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          tick={{ fontSize: 13, fill: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={<CustomTooltip valueFormatter={valueFormatter} />}
          cursor={{ fill: 'var(--color-hover)' }}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          onClick={(entry) => onBarClick?.(entry.id)}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          {data.map((entry) => {
            const isSelected = selectedId === entry.id;
            const opacity = hasSelection && !isSelected ? MUTED_OPACITY : 1;
            return (
              <Cell
                key={entry.id}
                fill={entry.color ?? DEFAULT_COLOR}
                opacity={opacity}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
