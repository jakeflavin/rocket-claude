import { CreditCard, LayoutDashboard, PiggyBank, Target, Wallet, type LucideIcon } from 'lucide-react';

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
    label: 'Home',
    icon: LayoutDashboard,
    path: '/home',
  },
  {
    label: 'Budgets',
    icon: PiggyBank,
    path: '/budgets',
  },
  {
    label: 'Goals',
    icon: Target,
    path: '/goals',
  },
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
      { label: 'Spending Analytics', path: '/spending-analytics' },
    ],
  },
];
