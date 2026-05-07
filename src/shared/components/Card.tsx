import { type HTMLAttributes, type ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={['rounded-xl border border-border bg-surface', className ?? ''].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-border px-6 py-4">
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
