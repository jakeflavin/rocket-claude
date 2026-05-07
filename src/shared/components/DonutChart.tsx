import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, type TooltipProps } from 'recharts';

export type DonutChartItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: DonutChartItem[];
  size?: number;
  valueFormatter?: (v: number) => string;
  onItemClick?: (id: string) => void;
  selectedId?: string | null;
  emptyMessage?: string;
};

const DEFAULT_COLOR = 'var(--color-brand)';
const DIM_OPACITY = 0.25;

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

export function DonutChart({
  data,
  size = 180,
  valueFormatter,
  onItemClick,
  selectedId,
  emptyMessage = 'No data available.',
}: Props) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const hasSelection = selectedId != null;

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  const innerRadius = size * 0.3;
  const outerRadius = size * 0.46;

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            cx={size / 2 - 1}
            cy={size / 2 - 1}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="label"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color ?? DEFAULT_COLOR}
                opacity={hasSelection && selectedId !== entry.id ? DIM_OPACITY : 1}
                style={{ cursor: onItemClick ? 'pointer' : 'default', outline: 'none' }}
                onClick={() => onItemClick?.(entry.id)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
        </PieChart>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold text-text leading-tight">
            {valueFormatter ? valueFormatter(total) : total}
          </span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-0 space-y-1">
        {data.map((item) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick?.(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-[100ms] hover:bg-hover ${isSelected ? 'bg-hover' : ''} ${!onItemClick ? 'cursor-default' : ''}`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? DEFAULT_COLOR, opacity: hasSelection && !isSelected ? DIM_OPACITY : 1 }}
              />
              <span className={`flex-1 truncate text-sm ${isSelected ? 'font-medium text-text' : 'text-text'}`}>
                {item.label}
              </span>
              <span className="shrink-0 text-sm font-medium text-text tabular-nums">
                {valueFormatter ? valueFormatter(item.value) : item.value}
              </span>
              <span className="w-9 shrink-0 text-right text-xs text-muted tabular-nums">
                {Math.round(pct)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
