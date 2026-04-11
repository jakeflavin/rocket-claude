import { useState, type ReactNode } from 'react'
import { HStack } from '../layout/HStack'
import { Text } from '../typography/Text'
import { Icon } from '../media/Icon'

interface AccordionProps {
  children?:  ReactNode
  className?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={`divide-y divide-rim ${className}`}>{children}</div>
}

interface AccordionItemProps {
  title?:       string
  children?:    ReactNode
  defaultOpen?: boolean
  className?:   string
}

export function AccordionItem({ title, children, defaultOpen = false, className = '' }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={className}>
      <HStack
        className="py-3 cursor-pointer hover:text-fg transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <Text className="flex-1 text-sm font-medium text-fg">{title}</Text>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-faint shrink-0" />
      </HStack>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}
