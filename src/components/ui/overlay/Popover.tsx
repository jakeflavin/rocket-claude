import { useState, useRef, useEffect, type ReactNode } from 'react'

interface PopoverProps {
  trigger?:   ReactNode
  children?:  ReactNode
  align?:     'left' | 'right'
  className?: string
}

export function Popover({ trigger, children, align = 'right', className = '' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const alignClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 top-full mt-2 ${alignClass} bg-card border border-rim rounded-xl shadow-2xl p-4 min-w-56`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
