import { type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={[
        'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text',
        'placeholder:text-subtle',
        'focus:border-link focus:outline-none focus:ring-[3px] focus:ring-brand/[0.12]',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  );
}
