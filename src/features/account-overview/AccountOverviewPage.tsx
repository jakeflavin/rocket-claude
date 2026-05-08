import { useMemo, useState } from 'react';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Drawer } from '../../shared/components/Drawer';
import { SegmentedControl } from '../../shared/components/SegmentedControl';
import { useAccountManagement } from '../account-management/useAccountManagement';
import { AccountEditPanel } from '../account-management/AccountEditPanel';
import { AccountDetailPanel } from './AccountDetailPanel';
import { AccountMergeDrawer } from './AccountMergeDrawer';
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
  isChecked,
  showCheckbox,
  onSelect,
  onCheck,
}: {
  account: Account;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  onSelect: () => void;
  onCheck: () => void;
}) {
  const isCredit = account.type === 'credit';
  const displayBalance = isCredit ? Math.abs(account.balance) : account.balance;
  const balanceLabel = isCredit ? 'Owed' : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[100ms] hover:bg-hover ${
        isSelected ? 'bg-hover' : ''
      }`}
    >
      <div
        className={showCheckbox || isChecked ? 'block' : 'hidden group-hover:block'}
        onClick={(e) => { e.stopPropagation(); onCheck(); }}
        role="presentation"
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheck}
          onClick={(e) => e.stopPropagation()}
          className="accent-brand h-4 w-4 cursor-pointer rounded"
          aria-label={`Select ${account.name}`}
        />
      </div>
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
  multiSelected,
  onSelect,
  onCheck,
}: {
  group: AccountGroup;
  selectedId: string | null;
  multiSelected: Set<string>;
  onSelect: (account: Account) => void;
  onCheck: (id: string) => void;
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
            isChecked={multiSelected.has(account.id)}
            showCheckbox={multiSelected.size > 0}
            onSelect={() => {
              if (multiSelected.size > 0) {
                onCheck(account.id);
              } else {
                onSelect(account);
              }
            }}
            onCheck={() => onCheck(account.id)}
          />
        ))}
      </div>
    </Card>
  );
}

type DrawerTab = 'Details' | 'Edit';

export function AccountOverviewPage({ onNavigate }: Props) {
  const {
    accounts,
    loading,
    error,
    refresh,
    multiSelected,
    toggleMultiSelect,
    clearMultiSelect,
  } = useAccountManagement();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('Details');
  const [mergeOpen, setMergeOpen] = useState(false);

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

  const multiSelectedAccounts = useMemo(
    () => accounts.filter((a) => multiSelected.has(a.id)),
    [accounts, multiSelected],
  );

  function handleSelectAccount(account: Account) {
    setSelectedAccount(account);
    setDrawerTab('Details');
  }

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
        {multiSelected.size >= 2 && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
            <span className="text-sm text-text">{multiSelected.size} accounts selected</span>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearMultiSelect}>Clear</Button>
              <Button variant="secondary" size="sm" onClick={() => setMergeOpen(true)}>Merge</Button>
            </div>
          </div>
        )}

        {grouped.length === 0 ? (
          <p className="text-sm text-muted">No accounts found.</p>
        ) : (
          grouped.map((group) => (
            <AccountGroupSection
              key={group.subtype}
              group={group}
              selectedId={selectedAccount?.id ?? null}
              multiSelected={multiSelected}
              onSelect={handleSelectAccount}
              onCheck={toggleMultiSelect}
            />
          ))
        )}
      </div>

      <Drawer
        open={selectedAccount !== null}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.name ?? ''}
      >
        {selectedAccount && (
          <>
            <div className="px-4 py-3 border-b border-border">
              <SegmentedControl
                segments={[
                  { value: 'Details', label: 'Details' },
                  { value: 'Edit', label: 'Edit' },
                ]}
                value={drawerTab}
                onChange={setDrawerTab}
              />
            </div>
            {drawerTab === 'Details' ? (
              <AccountDetailPanel
                account={selectedAccount}
                onNavigateToTransactions={(id) => {
                  setSelectedAccount(null);
                  onNavigate(`/transactions?account=${id}`);
                }}
              />
            ) : (
              <AccountEditPanel
                account={selectedAccount}
                onSaved={() => {
                  setDrawerTab('Details');
                  refresh();
                }}
              />
            )}
          </>
        )}
      </Drawer>

      <AccountMergeDrawer
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        accounts={multiSelectedAccounts}
        onConfirm={() => {
          clearMultiSelect();
          setMergeOpen(false);
          refresh();
        }}
      />
    </>
  );
}
