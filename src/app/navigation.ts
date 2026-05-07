import { CreditCard, type LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
};

export const navItems: NavItem[] = [
  {
    label: 'Transactions',
    icon: CreditCard,
    href: '#transactions',
    active: true,
  },
];
