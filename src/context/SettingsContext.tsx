import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings, SettingsContextValue } from '../types'
import { Center } from '../components/ui/layout/Center'
import { VStack } from '../components/ui/layout/VStack'
import { Text } from '../components/ui/typography/Text'

const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsProviderProps {
  children?: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [error, setError]            = useState<string | null>(null)

  useEffect(() => {
    fetch('/settings.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — could not load settings.json`)
        return res.json() as Promise<Settings>
      })
      .then(data => {
        const savedTheme = localStorage.getItem('rocket-theme') as Settings['user']['theme'] | null
        if (savedTheme) {
          data = { ...data, user: { ...data.user, theme: savedTheme } }
        }
        setSettingsState(data)
      })
      .catch(err => setError((err as Error).message))
  }, [])

  const setSettings = useCallback((updater: Settings | ((prev: Settings) => Settings)) => {
    setSettingsState(prev => {
      if (!prev) return prev
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (next?.user?.theme && next.user.theme !== prev?.user?.theme) {
        localStorage.setItem('rocket-theme', next.user.theme)
      }
      return next
    })
  }, [])

  if (error) {
    return (
      <Center className="h-screen bg-surface">
        <VStack gap="gap-3" className="items-center text-center px-6">
          <Text className="text-rose-400 font-semibold text-sm">Failed to load settings</Text>
          <Text className="text-faint text-xs max-w-xs">{error}</Text>
          <Text className="text-faint text-xs">
            Make sure <span className="font-mono text-muted">settings.json</span> exists
            and the app is served via HTTP.
          </Text>
        </VStack>
      </Center>
    )
  }

  if (!settings) {
    return (
      <Center className="h-screen bg-surface">
        <Text className="text-faint text-sm font-mono">loading settings…</Text>
      </Center>
    )
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

/**
 * Return a memoized { categoryName → hexColor } map from settings.categories.
 */
export function useCategoryColorMap(): Record<string, string> {
  const { settings } = useSettings()
  return useMemo(() => {
    const map: Record<string, string> = {}
    settings.categories.forEach(c => { map[c.name] = c.color })
    return map
  }, [settings.categories])
}
