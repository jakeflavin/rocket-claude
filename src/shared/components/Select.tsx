import { type ReactNode, type SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={[
        'h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text',
        'focus:border-link focus:outline-none focus:ring-[3px] focus:ring-brand/[0.12]',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
  );
}
