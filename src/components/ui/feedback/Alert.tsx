import type { ReactNode } from 'react'
import { HStack } from '../layout/HStack'
import { VStack } from '../layout/VStack'
import { Text } from '../typography/Text'
import { Icon } from '../media/Icon'

interface AlertStyle {
  bg:     string
  border: string
  text:   string
  icon:   string
}

const ALERT_STYLES: Record<string, AlertStyle> = {
  info:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    icon: 'Info'          },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'CheckCircle'   },
  warning: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   icon: 'AlertTriangle' },
  error:   { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    icon: 'XCircle'       },
}

interface AlertProps {
  variant?:  'info' | 'success' | 'warning' | 'error'
  title?:    string
  children?: ReactNode
  onClose?:  () => void
  className?: string
}

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const s = ALERT_STYLES[variant] ?? ALERT_STYLES.info
  return (
    <HStack
      gap="gap-3"
      className={`${s.bg} border ${s.border} rounded-lg p-3 items-start ${className}`}
    >
      <Icon name={s.icon} size={16} className={`${s.text} mt-0.5 shrink-0`} />
      <VStack gap="gap-0.5" className="flex-1 min-w-0">
        {title && <Text className={`text-sm font-medium ${s.text}`}>{title}</Text>}
        {children && <Text as="p" className="text-xs text-muted">{children}</Text>}
      </VStack>
      {onClose && (
        <button
          onClick={onClose}
          className="text-faint hover:text-muted transition-colors shrink-0"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </HStack>
  )
}
