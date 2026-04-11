import { HStack, Icon } from './ui'

type View = 'list' | 'chart' | 'calendar'

interface ViewToggleProps {
  view:     View
  onChange: (view: View) => void
}

const VIEWS: { value: View; icon: string; label: string }[] = [
  { value: 'list',     icon: 'List',        label: 'List'     },
  { value: 'chart',    icon: 'PieChart',     label: 'Chart'    },
  { value: 'calendar', icon: 'CalendarDays', label: 'Calendar' },
]

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <HStack gap="gap-0" className="bg-raised rounded-lg p-1">
      {VIEWS.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
            view === value ? 'bg-rim text-fg' : 'text-muted hover:text-fg'
          }`}
        >
          <Icon name={icon} size={13} />
          {label}
        </button>
      ))}
    </HStack>
  )
}
