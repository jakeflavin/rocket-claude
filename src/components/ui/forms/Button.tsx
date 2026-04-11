import type { ButtonHTMLAttributes, ReactNode } from 'react'

const VARIANTS: Record<string, string> = {
  primary:   'bg-[#10b981] text-white hover:bg-emerald-400 border border-transparent',
  secondary: 'bg-raised text-fg border border-rim hover:bg-rim',
  ghost:     'bg-transparent text-muted border border-transparent hover:bg-raised hover:text-fg',
  danger:    'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25',
}

const SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'ghost' | 'danger'
  size?:     'sm' | 'md' | 'lg'
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.secondary}
        ${SIZES[size] ?? SIZES.md}
        ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
