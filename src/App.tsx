import { useState, useEffect } from 'react'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Subscriptions } from './pages/Subscriptions'
import { Bills } from './pages/Bills'
import { Settings } from './pages/Settings'

type PageId = 'dashboard' | 'transactions' | 'subscriptions' | 'bills' | 'settings'

function renderPage(page: PageId, onNavigate: (page: string) => void) {
  switch (page) {
    case 'dashboard':     return <Dashboard onNavigate={onNavigate} />
    case 'transactions':  return <Transactions />
    case 'subscriptions': return <Subscriptions />
    case 'bills':         return <Bills />
    case 'settings':      return <Settings />
  }
}

function AppShell({ activePage, setActivePage }: { activePage: PageId; setActivePage: (p: PageId) => void }) {
  const { settings } = useSettings()

  useEffect(() => {
    const theme = settings.user.theme || 'system'
    const el = document.documentElement

    if (theme === 'light') {
      el.setAttribute('data-theme', 'light')
      return
    }

    if (theme === 'dark') {
      el.removeAttribute('data-theme')
      return
    }

    // system — follow prefers-color-scheme
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      if (mq.matches) el.setAttribute('data-theme', 'light')
      else el.removeAttribute('data-theme')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.user.theme])

  const navigate = (page: string) => setActivePage(page as PageId)

  return (
    <div className="flex h-screen bg-surface text-fg overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <main className="flex-1 overflow-y-auto">
        {renderPage(activePage, navigate)}
      </main>
    </div>
  )
}

export function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')

  return (
    <SettingsProvider>
      <AppShell activePage={activePage} setActivePage={setActivePage} />
    </SettingsProvider>
  )
}
