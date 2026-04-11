import { Box, HStack, Divider, Icon, Text, Caption } from './ui'
import { Formatters } from '../utils/formatters'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: 'LayoutDashboard' },
  { id: 'transactions',  label: 'Transactions',  icon: 'ArrowLeftRight'  },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'RefreshCw'       },
  { id: 'bills',         label: 'Bills',         icon: 'Receipt'         },
  { id: 'settings',      label: 'Settings',      icon: 'Settings'        },
]

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <Box className="w-60 h-full bg-card border-r border-rim flex flex-col shrink-0">

      {/* Logo */}
      <Box className="p-5">
        <HStack gap="gap-2" className="items-center">
          <Text className="text-xl leading-none">🚀</Text>
          <Text className="font-semibold text-fg text-sm tracking-wide">Rocket Claude</Text>
        </HStack>
      </Box>

      <Divider />

      {/* Nav links */}
      <Box className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(item => {
          const isActive = item.id === activePage
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors cursor-pointer border-l-2
                ${isActive
                  ? 'bg-raised text-fg border-[#10b981]'
                  : 'text-muted hover:bg-raised hover:text-fg border-transparent'}
              `}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </div>
          )
        })}
      </Box>

      <Divider />

      {/* Footer */}
      <Box className="p-5">
        <Caption>{Formatters.monthYear(new Date().toISOString().slice(0, 7))}</Caption>
      </Box>

    </Box>
  )
}
