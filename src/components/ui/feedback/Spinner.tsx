interface SpinnerProps {
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${SIZE_MAP[size] ?? SIZE_MAP.md} border-rim border-t-[#10b981] rounded-full animate-spin ${className}`}
    />
  )
}
