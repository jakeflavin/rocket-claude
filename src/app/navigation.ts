import { CreditCard, Wallet, type LucideIcon } from 'lucide-react';

export type NavChild = {
  label: string;
  path: string;
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [

  {
    label: 'Accounts',
    icon: Wallet,
    path: '/accounts',
    children: [
      { label: 'Settings', path: '/accounts/settings' },
    ],
  },
  {
    label: 'Transactions',
    icon: CreditCard,
    path: '/transactions',
    children: [
      { label: 'Categories', path: '/categories' },
      { label: 'Rules', path: '/categories/rules' },
      { label: 'Subscriptions & Bills', path: '/subscriptions' },
    ],
  },
];
