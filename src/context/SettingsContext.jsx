/**
 * SettingsContext — loads settings.json and makes it available app-wide.
 *
 * Globals exposed:
 *   SettingsContext   React context object
 *   SettingsProvider  Wrap the app root with this
 *   useSettings()     Hook to consume { settings, setSettings } in any component
 */

const SettingsContext = React.createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = React.useState(null);
  const [error, setError]       = React.useState(null);

  React.useEffect(() => {
    fetch('./settings.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — could not load settings.json`);
        return res.json();
      })
      .then(setSettings)
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <Center className="h-screen bg-surface">
        <VStack gap="gap-3" className="items-center text-center px-6">
          <Text className="text-rose-400 font-semibold text-sm">Failed to load settings</Text>
          <Text className="text-faint text-xs max-w-xs">{error}</Text>
          <Text className="text-faint text-xs">
            Make sure <span className="font-mono text-muted">settings.json</span> exists
            and the app is served via HTTP (not <span className="font-mono text-muted">file://</span>).
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!settings) {
    return (
      <Center className="h-screen bg-surface">
        <Text className="text-faint text-sm font-mono">loading settings…</Text>
      </Center>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Consume settings anywhere inside SettingsProvider.
 *
 * @returns {{ settings: Object, setSettings: Function }}
 */
const useSettings = () => {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};
