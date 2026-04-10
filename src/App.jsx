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
      <Text className="font-mono text-lg text-[#f0f0fa]">{name}</Text>
      <Caption>Coming soon</Caption>
    </VStack>
  </Center>
);

const _renderPage = (page, onNavigate) => {
  // Real page components will be swapped in here as T19–T23 are completed.
  // Check for the real component first, fall back to stub.
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

// ─── App ─────────────────────────────────────────────────────────────────────

const App = () => {
  const [activePage, setActivePage] = React.useState('dashboard');

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0fa] overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto">
          {_renderPage(activePage, setActivePage)}
        </main>
      </div>
    </SettingsProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
