import { createContext, useContext, type ReactNode } from 'react'
import { HStack } from '../layout/HStack'

// ─── TabsContext — avoids cloneElement underscore-prop injection ──────────────

interface TabsContextValue {
  active:   string
  onChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface TabsProps {
  value:      string
  onChange:   (value: string) => void
  children?:  ReactNode
  className?: string
}

export function Tabs({ value, onChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ active: value, onChange }}>
      <HStack gap="gap-1" className={`border-b border-rim ${className}`}>
        {children}
      </HStack>
    </TabsContext.Provider>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

interface TabProps {
  value:      string
  children?:  ReactNode
  className?: string
}

export function Tab({ value, children, className = '' }: TabProps) {
  const ctx = useContext(TabsContext)
  const isActive = ctx?.active === value
  return (
    <button
      onClick={() => ctx?.onChange(value)}
      className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer
        ${isActive
          ? 'border-[#10b981] text-fg'
          : 'border-transparent text-muted hover:text-fg'}
        ${className}`}
    >
      {children}
    </button>
  )
}

// ─── TabPanel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  value:      string
  active:     string
  children?:  ReactNode
  className?: string
}

export function TabPanel({ value, active, children, className = '' }: TabPanelProps) {
  if (value !== active) return null
  return <div className={className}>{children}</div>
}
