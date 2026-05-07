type Props = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export function Sparkline({
  data,
  color = 'var(--color-brand)',
  width = 80,
  height = 28,
  strokeWidth = 1.5,
}: Props) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1={0} y1={height / 2}
          x2={width} y2={height / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const pad = strokeWidth;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = range === 0
      ? pad + innerH / 2
      : pad + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
