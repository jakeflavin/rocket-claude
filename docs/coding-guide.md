# Coding Guide

## Architecture Principles

1. **No build step** — everything runs from `index.html` via CDN scripts and Babel standalone. JSX is transformed in the browser.
2. **Single HTML entry point** — `index.html` loads all CDN dependencies and mounts the React app.
3. **Component files via `<script type="text/babel" src="...">` tags** — each component is its own `.jsx` file, loaded in dependency order.
4. **No `import`/`export`** — use global variables and `window.*` assignment pattern since there is no module bundler.
5. **CSV is the database** — no localStorage, no IndexedDB, no fetch to a server. PapaParse reads the file.
6. **settings.json is loaded via `fetch('./settings.json')`** at app startup.

## File Loading Pattern

```html
<!-- index.html load order -->
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>

<!-- App scripts — order matters, no module system -->
<script type="text/babel" src="src/utils/formatters.js"></script>
<script type="text/babel" src="src/utils/csvParser.js"></script>
<script type="text/babel" src="src/utils/categorizer.js"></script>
<script type="text/babel" src="src/context/SettingsContext.jsx"></script>
<script type="text/babel" src="src/hooks/useTransactions.js"></script>
<script type="text/babel" src="src/components/Sidebar.jsx"></script>
<script type="text/babel" src="src/components/StatCard.jsx"></script>
<!-- ... remaining components ... -->
<script type="text/babel" src="src/pages/Dashboard.jsx"></script>
<!-- ... remaining pages ... -->
<script type="text/babel" src="src/App.jsx"></script>
```

## Global Variable Pattern (no import/export)

```javascript
// utils/formatters.js
window.Formatters = {
  currency: (amount, symbol = '$') => { ... },
  date: (dateStr) => { ... },
  percent: (value) => { ... }
};

// components/StatCard.jsx
const StatCard = ({ label, value, delta, deltaPositive }) => {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5">
      ...
    </div>
  );
};
// No export needed — StatCard is used globally by other components
```

## React Context (SettingsContext)

```javascript
// context/SettingsContext.jsx
const SettingsContext = React.createContext(null);

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    fetch('./settings.json')
      .then(r => r.json())
      .then(setSettings);
  }, []);

  if (!settings) return <div>Loading...</div>;

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

const useSettings = () => React.useContext(SettingsContext);
```

## useTransactions Hook

```javascript
// hooks/useTransactions.js
const useTransactions = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    Papa.parse('./data/transactions.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data }) => {
        setTransactions(data.filter(row => row.id)); // drop empty rows
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, []);

  // Derived views
  const expenses      = transactions.filter(t => t.amount < 0);
  const income        = transactions.filter(t => t.amount > 0);
  const needsReview   = transactions.filter(t => t.needs_review === true || t.needs_review === 'true');
  const subscriptions = transactions.filter(t => t.category === 'Subscriptions');
  const bills         = transactions.filter(t =>
    t.category === 'Utilities' || t.category === 'Housing'
  );

  return { transactions, expenses, income, needsReview, subscriptions, bills, loading, error };
};
```

## Tab-Based Navigation (no router)

```javascript
// App.jsx
const PAGES = ['dashboard', 'transactions', 'subscriptions', 'bills', 'settings'];

const App = () => {
  const [activePage, setActivePage] = React.useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':      return <Dashboard />;
      case 'transactions':   return <Transactions />;
      case 'subscriptions':  return <Subscriptions />;
      case 'bills':          return <Bills />;
      case 'settings':       return <Settings />;
      default:               return <Dashboard />;
    }
  };

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0fa] overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </SettingsProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

## Currency Formatting

Always use the locale and symbol from `settings.json`:

```javascript
// Correct
Formatters.currency(Math.abs(transaction.amount), settings.user.currencySymbol)

// Amount color rule
const amountClass = transaction.amount < 0 ? 'text-rose-400' : 'text-emerald-400';
const amountDisplay = transaction.amount < 0
  ? `-${Formatters.currency(Math.abs(transaction.amount))}`
  : `+${Formatters.currency(transaction.amount)}`;
```

## Coding Standards

- Use `React.useState`, `React.useEffect`, etc. (no destructured imports — no module system)
- Functional components only. No class components.
- Props must be explicitly typed via JSDoc comments (no TypeScript, but document shapes)
- One component per file
- No inline styles — Tailwind classes only. Use `className` not `style` unless absolutely necessary
- All monetary amounts rendered in `font-mono` (JetBrains Mono)
- Handle `loading` and `error` states in every component that fetches data
- Empty states: every list must render a meaningful empty state message
- Never hardcode category names or colors — always derive from `settings.json`
