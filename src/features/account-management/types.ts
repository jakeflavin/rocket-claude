export type { Account, AccountGroup } from '../account-overview/types';
import type { Account } from '../account-overview/types';

export type AccountPatch = Partial<
  Pick<
    Account,
    | 'name'
    | 'institution'
    | 'type'
    | 'subtype'
    | 'currency'
    | 'balance'
    | 'available_balance'
    | 'credit_limit'
    | 'is_hidden'
  >
>;

export type MergePreview = {
  primary: Account;
  merging: Account[];
  combinedBalance: number;
  transactionCount: number;
  recurringCount: number;
};
