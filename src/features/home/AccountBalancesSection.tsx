import { Card } from '../../shared/components/Card';
import { Sparkline } from '../../shared/components/Sparkline';
import type { DashboardAccountRow } from './types';

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

function balanceColor(balance: number): string {
  if (balance > 0) return 'text-success';
  if (balance < 0) return 'text-error';
  return 'text-muted';
}

function sparklineColor(type: string): string {
  if (type === 'credit') return 'var(--color-error)';
  return 'var(--color-brand)';
}

const TYPE_ORDER = ['depository', 'investment', 'credit'];
const TYPE_LABEL: Record<string, string> = {
  depository: 'Bank Accounts',
  investment: 'Investment',
  credit: 'Credit Cards',
};

type Props = {
  accounts: DashboardAccountRow[];
  loading: boolean;
  onNavigate: (path: string) => void;
};

export function AccountBalancesSection({ accounts, loading, onNavigate }: Props) {
  if (loading) {
    return <div className="h-48 rounded-xl bg-surface animate-pulse" />;
  }

  const grouped = new Map<string, DashboardAccountRow[]>();
  for (const acc of accounts) {
    const group = grouped.get(acc.type) ?? [];
    group.push(acc);
    grouped.set(acc.type, group);
  }

  const orderedTypes = TYPE_ORDER.filter((t) => grouped.has(t));
  for (const t of [...grouped.keys()]) {
    if (!orderedTypes.includes(t)) orderedTypes.push(t);
  }

  if (accounts.length === 0) {
    return (
      <Card className="p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-text mb-4">Accounts</h2>
        <p className="text-sm text-muted text-center py-4">No accounts found.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-text mb-4">Accounts</h2>
      <div className="flex flex-col gap-4">
        {orderedTypes.map((type) => (
          <div key={type}>
            <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted mb-2">
              {TYPE_LABEL[type] ?? type}
            </p>
            <div className="flex flex-col">
              {(grouped.get(type) ?? []).map((acc) => (
                <button
                  key={acc.id}
                  className="flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-lg hover:bg-hover transition-colors text-left w-full"
                  onClick={() => onNavigate('/accounts')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{acc.name}</p>
                    <p className="text-xs text-muted">{acc.institution}</p>
                  </div>
                  {acc.sparklineData.length >= 2 && (
                    <Sparkline
                      data={acc.sparklineData}
                      color={sparklineColor(acc.type)}
                      width={64}
                      height={24}
                    />
                  )}
                  <p className={`text-sm font-semibold tabular-nums ${balanceColor(acc.balance)}`}>
                    {fmt(acc.balance)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
