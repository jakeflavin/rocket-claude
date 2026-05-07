type ProgressBarProps = {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, max = 100, color, className = '', showLabel = false }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverBudget = value > max;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-hover">
        <div
          className="h-full rounded-full transition-all duration-[250ms]"
          style={{
            width: `${pct}%`,
            backgroundColor: color ?? (isOverBudget ? 'var(--color-error)' : 'var(--color-brand)'),
          }}
        />
      </div>
      {showLabel && (
        <span className={`w-9 shrink-0 text-right text-xs font-medium tabular-nums ${isOverBudget ? 'text-error' : 'text-muted'}`}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
