/**
 * App — root component. Wires Sidebar + page routing together.
 *
 * Replaces the temporary LoadingApp stub in index.html.
 *
 * Load order: must come after all components and pages.
 */

// ─── Page stubs (replaced by real pages in T19–T23) ──────────────────────────

const _PageStub = ({ name }) => (
  <Center className="h-full">
    <VStack gap="gap-2" className="items-center">
      <Text className="font-mono text-lg text-fg">{name}</Text>
      <Caption>Coming soon</Caption>
    </VStack>
  </Center>
);

const _renderPage = (page, onNavigate) => {
  if (page === 'dashboard'     && typeof Dashboard     !== 'undefined') return <Dashboard onNavigate={onNavigate} />;
  if (page === 'transactions'  && typeof Transactions  !== 'undefined') return <Transactions onNavigate={onNavigate} />;
  if (page === 'subscriptions' && typeof Subscriptions !== 'undefined') return <Subscriptions onNavigate={onNavigate} />;
  if (page === 'bills'         && typeof Bills         !== 'undefined') return <Bills onNavigate={onNavigate} />;
  if (page === 'settings'      && typeof Settings      !== 'undefined') return <Settings onNavigate={onNavigate} />;

  const labels = {
    dashboard:     'Dashboard',
    transactions:  'Transactions',
    subscriptions: 'Subscriptions',
    bills:         'Bills',
    settings:      'Settings',
  };
  return <_PageStub name={labels[page] || page} />;
};

// ─── AppShell — reads theme setting and applies data-theme ───────────────────

const AppShell = ({ activePage, setActivePage }) => {
  const { settings } = useSettings();

  React.useEffect(() => {
    const theme = settings.user.theme || 'system';
    const el = document.documentElement;

    if (theme === 'light') {
      el.setAttribute('data-theme', 'light');
      return;
    }

    if (theme === 'dark') {
      el.removeAttribute('data-theme');
      return;
    }

    // system — follow prefers-color-scheme
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      if (mq.matches) el.setAttribute('data-theme', 'light');
      else el.removeAttribute('data-theme');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.user.theme]);

  return (
    <div className="flex h-screen bg-surface text-fg overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        {_renderPage(activePage, setActivePage)}
      </main>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App = () => {
  const [activePage, setActivePage] = React.useState('dashboard');

  return (
    <SettingsProvider>
      <AppShell activePage={activePage} setActivePage={setActivePage} />
    </SettingsProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
