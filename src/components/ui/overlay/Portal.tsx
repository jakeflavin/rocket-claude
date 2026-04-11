import { useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children?: ReactNode
}

export function Portal({ children }: PortalProps) {
  const elRef = useRef<HTMLDivElement | null>(null)
  if (!elRef.current) elRef.current = document.createElement('div')

  useEffect(() => {
    const el = elRef.current!
    document.body.appendChild(el)
    return () => { document.body.removeChild(el) }
  }, [])

  return createPortal(children, elRef.current)
}
