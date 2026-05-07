import { CreditCard, Settings2, Wallet, type LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
};

export const navItems: NavItem[] = [
  {
    label: 'Transactions',
    icon: CreditCard,
    path: '/transactions',
  },
  {
    label: 'Accounts',
    icon: Wallet,
    path: '/accounts',
  },
  {
    label: 'Manage Accounts',
    icon: Settings2,
    path: '/account-management',
  },
];
