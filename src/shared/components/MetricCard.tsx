import { Card } from './Card';

type MetricCardProps = {
  label: string;
  value: number | string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="p-5 shadow-xs">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-tight text-text">{value}</p>
    </Card>
  );
}
