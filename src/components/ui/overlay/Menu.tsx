import { useState, useRef, useEffect, cloneElement, type ReactNode, type ReactElement, type ButtonHTMLAttributes } from 'react'
import { Icon } from '../media/Icon'

interface MenuProps {
  trigger?:   ReactNode
  children?:  ReactNode
  align?:     'left' | 'right'
  className?: string
}

export function Menu({ trigger, children, align = 'right', className = '' }: MenuProps) {
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
          className={`absolute z-40 top-full mt-1 ${alignClass} min-w-40 bg-raised border border-rim rounded-lg shadow-xl py-1`}
        >
          {Array.isArray(children)
            ? children.map((child, i) =>
                child
                  ? <MenuItemWrapper key={i} child={child} onClose={() => setOpen(false)} />
                  : null
              )
            : children
              ? <MenuItemWrapper child={children} onClose={() => setOpen(false)} />
              : null
          }
        </div>
      )}
    </div>
  )
}

function MenuItemWrapper({ child, onClose }: { child: ReactNode; onClose: () => void }) {
  if (!child || typeof child !== 'object' || !('props' in child)) return <>{child}</>
  const el = child as ReactElement<{ onClick?: () => void }>
  return (
    <>
      {typeof el.type === 'string'
        ? el
        : cloneElement(el, {
            onClick: () => { el.props.onClick?.(); onClose() },
          })
      }
    </>
  )
}

interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?:     string
  children?: ReactNode
}

export function MenuItem({ icon, className = '', children, ...props }: MenuItemProps) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm text-muted
        hover:bg-rim hover:text-fg transition-colors
        flex items-center gap-2 ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  )
}
