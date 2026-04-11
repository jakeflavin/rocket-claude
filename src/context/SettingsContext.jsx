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
      .then(data => {
        const savedTheme = localStorage.getItem('rocket-theme');
        if (savedTheme) {
          data = { ...data, user: { ...data.user, theme: savedTheme } };
        }
        setSettings(data);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleSetSettings = React.useCallback((updater) => {
    setSettings(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next?.user?.theme && next.user.theme !== prev?.user?.theme) {
        localStorage.setItem('rocket-theme', next.user.theme);
      }
      return next;
    });
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
    <SettingsContext.Provider value={{ settings, setSettings: handleSetSettings }}>
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

/**
 * Return a memoized { categoryName → hexColor } map from settings.categories.
 * Eliminates the repeated manual map-building pattern in components.
 *
 * @returns {Object} e.g. { "Groceries": "#84cc16", "Housing": "#8b5cf6", … }
 */
window.useCategoryColorMap = () => {
  const { settings } = useSettings();
  return React.useMemo(() => {
    const map = {};
    settings.categories.forEach(c => { map[c.name] = c.color; });
    return map;
  }, [settings.categories]);
};
