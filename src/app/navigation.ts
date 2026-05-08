import { CalendarClock, CreditCard, LayoutDashboard, PiggyBank, Target, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';

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
    label: 'Spending',
    icon: TrendingUp,
    path: '/spending',
  },
  {
    label: 'Accounts',
    icon: Wallet,
    path: '/accounts',
  },
    {
    label: 'Reoccuring',
    icon: CalendarClock,
    path: '/subscriptions',
  },
  {
    label: 'Transactions',
    icon: CreditCard,
    path: '/transactions',
    children: [
      { label: 'Rules', path: '/categories/rules' },
    ],
  },
];


// calendar-clock
