interface DividerProps {
  className?:   string
  orientation?: 'horizontal' | 'vertical'
  [key: string]: unknown
}

export function Divider({ className = '', orientation = 'horizontal', ...props }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-rim self-stretch ${className}`} {...props} />
  }
  return <hr className={`border-rim ${className}`} {...props} />
}
