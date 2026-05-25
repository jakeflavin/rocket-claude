import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const VARIANT_CLS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active disabled:bg-border disabled:text-subtle',
  secondary: 'border border-border bg-transparent text-text hover:bg-hover',
  ghost: 'border border-border bg-transparent text-muted hover:bg-hover hover:text-text',
  destructive: 'border border-error-border bg-error text-white hover:bg-error-bg',
  icon: 'bg-transparent text-muted hover:bg-hover hover:text-text',
};

const SIZE_CLS: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

const ICON_SIZE_CLS: Record<ButtonSize, string> = {
  sm: 'h-7 w-7 p-1.5',
  md: 'h-8 w-8 p-2',
  lg: 'h-9 w-9 p-2.5',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon';
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-[100ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLS[variant],
        isIcon ? ICON_SIZE_CLS[size] : SIZE_CLS[size],
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
