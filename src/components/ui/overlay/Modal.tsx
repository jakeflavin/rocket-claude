import { useEffect, type ReactNode } from 'react'
import { Portal } from './Portal'
import { HStack } from '../layout/HStack'
import { Heading } from '../typography/Heading'
import { Icon } from '../media/Icon'

const MODAL_SIZES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

interface ModalProps {
  isOpen:   boolean
  onClose:  () => void
  title?:   string
  size?:    'sm' | 'md' | 'lg' | 'xl'
  children?: ReactNode
}

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div
          className={`relative bg-card border border-rim rounded-xl shadow-2xl w-full ${MODAL_SIZES[size] ?? MODAL_SIZES.md}`}
        >
          {title && (
            <HStack className="px-5 py-4 border-b border-rim justify-between">
              <Heading level={3} className="text-base">{title}</Heading>
              <button
                onClick={onClose}
                className="text-faint hover:text-fg transition-colors p-0.5 rounded"
              >
                <Icon name="X" size={18} />
              </button>
            </HStack>
          )}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </Portal>
  )
}
