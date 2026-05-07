type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  subLabel?: string;
};

function defaultColor(value: number): string {
  if (value >= 1.0) return 'var(--color-error)';
  if (value >= 0.75) return 'var(--color-warning)';
  return 'var(--color-success)';
}

export function RadialProgressChart({
  value,
  size = 80,
  strokeWidth = 8,
  color,
  label,
  subLabel,
}: Props) {
  const clamped = Math.min(value, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const arcColor = color ?? defaultColor(value);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {/* Center text — counter-rotate so text reads upright */}
      {(label || subLabel) && (
        <g style={{ transform: `rotate(90deg) translate(0, -${size}px)` }}>
          {label && (
            <text
              x={cx}
              y={subLabel ? cy - 6 : cy + 5}
              textAnchor="middle"
              fontSize={size * 0.18}
              fontWeight="600"
              fill="var(--color-text)"
            >
              {label}
            </text>
          )}
          {subLabel && (
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fontSize={size * 0.13}
              fill="var(--color-text-muted)"
            >
              {subLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
