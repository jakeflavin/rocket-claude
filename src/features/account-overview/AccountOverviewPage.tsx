import { useMemo, useState } from 'react';
import { GitMerge } from 'lucide-react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Drawer } from '../../shared/components/Drawer';
import { useAccountManagement } from '../account-management/useAccountManagement';
import { AccountPanel } from './AccountPanel';
import { AccountMergeWizard } from './AccountMergeWizard';
import { GROUPED_SUBTYPES, SUBTYPE_GROUP_LABEL, type Account, type AccountGroup } from './types';

type Props = { onNavigate: (path: string) => void };

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function balanceColor(account: Account): string {
  if (account.balance > 0) return 'text-success';
  if (account.balance < 0) return 'text-error';
  return 'text-subtle';
}

function AccountRow({
  account,
  isSelected,
  onClick,
}: {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isCredit = account.type === 'credit';
  const displayBalance = isCredit ? Math.abs(account.balance) : account.balance;
  const balanceLabel = isCredit ? 'Owed' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[100ms] hover:bg-hover ${
        isSelected ? 'bg-hover' : ''
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${
        account.balance > 0 ? 'bg-success' : account.balance < 0 ? 'bg-error' : 'bg-border'
      }`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{account.name}</p>
        <p className="truncate text-xs text-muted">{account.institution}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${balanceColor(account)}`}>
          {formatCurrency(displayBalance, account.currency)}
          {balanceLabel && <span className="ml-1 text-xs font-normal text-muted">{balanceLabel}</span>}
        </p>
        {account.available_balance != null && (
          <p className="text-xs text-subtle">
            {formatCurrency(account.available_balance, account.currency)} avail.
          </p>
        )}
      </div>
    </button>
  );
}

function AccountGroupSection({
  group,
  selectedId,
  onSelect,
}: {
  group: AccountGroup;
  selectedId: string | null;
  onSelect: (account: Account) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-text">{group.label}</span>
        <Badge variant="default">{group.accounts.length}</Badge>
      </div>
      <div className="divide-y divide-border">
        {group.accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            isSelected={selectedId === account.id}
            onClick={() => onSelect(account)}
          />
        ))}
      </div>
    </Card>
  );
}

export function AccountOverviewPage({ onNavigate }: Props) {
  const { accounts, loading, error, refresh } = useAccountManagement();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [mergeWizardOpen, setMergeWizardOpen] = useState(false);

  const visibleAccounts = useMemo(
    () => accounts.filter((a) => !a.is_hidden && !a.is_closed),
    [accounts],
  );

  const grouped = useMemo<AccountGroup[]>(() => {
    return GROUPED_SUBTYPES
      .map((subtype) => ({
        label: SUBTYPE_GROUP_LABEL[subtype],
        subtype,
        accounts: visibleAccounts.filter((a) => a.subtype === subtype),
      }))
      .filter((g) => g.accounts.length > 0);
  }, [visibleAccounts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 animate-pulse rounded-xl bg-surface border border-border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error-border bg-error-bg p-6 text-sm text-error">
        Failed to load accounts: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {grouped.length === 0 ? (
          <p className="text-sm text-muted">No accounts found.</p>
        ) : (
          grouped.map((group) => (
            <AccountGroupSection
              key={group.subtype}
              group={group}
              selectedId={selectedAccount?.id ?? null}
              onSelect={setSelectedAccount}
            />
          ))
        )}

        {visibleAccounts.length >= 2 && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setMergeWizardOpen(true)}>
              <GitMerge size={14} />
              Merge Accounts
            </Button>
          </div>
        )}
      </div>

      <Drawer
        open={selectedAccount !== null}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.name ?? ''}
      >
        {selectedAccount && (
          <AccountPanel
            account={selectedAccount}
            onNavigateToTransactions={(id) => {
              setSelectedAccount(null);
              onNavigate(`/transactions?account=${id}`);
            }}
            onUpdated={refresh}
          />
        )}
      </Drawer>

      <AccountMergeWizard
        open={mergeWizardOpen}
        onClose={() => setMergeWizardOpen(false)}
        accounts={visibleAccounts}
        onComplete={() => {
          setMergeWizardOpen(false);
          refresh();
        }}
      />
    </>
  );
}
