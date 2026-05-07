import { type ReactNode } from 'react';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
};

const VARIANT_CLS: Record<BadgeVariant, string> = {
  default: 'bg-hover text-muted',
  brand: 'border border-[#F0C8A0] bg-brand-light text-brand',
  success: 'border border-success-border bg-success-bg text-success',
  warning: 'border border-warning-border bg-warning-bg text-warning',
  error: 'border border-error-border bg-error-bg text-error',
  info: 'border border-info-border bg-info-bg text-info',
};

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_CLS[variant],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
