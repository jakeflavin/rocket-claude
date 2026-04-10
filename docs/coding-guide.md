# Coding Guide

## Architecture Principles

1. **No build step** — everything runs from `index.html` via CDN scripts and Babel standalone. JSX is transformed in the browser.
2. **Single HTML entry point** — `index.html` loads all CDN dependencies and mounts the React app.
3. **Component files via `<script type="text/babel" src="...">` tags** — each component is its own `.jsx` file, loaded in dependency order.
4. **No `import`/`export`** — use global variables and `window.*` assignment pattern since there is no module bundler.
5. **CSV is the database** — no localStorage, no IndexedDB, no fetch to a server. PapaParse reads the file.
6. **`settings.json` is loaded via `fetch('./settings.json')`** at app startup via `SettingsContext`.

---

## File Loading Pattern

```html
<!-- index.html load order -->
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5/papaparse.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

<!-- UI library — layout and typography first, everything else depends on them -->
<script type="text/babel" src="src/components/ui/layout.jsx"></script>
<script type="text/babel" src="src/components/ui/typography.jsx"></script>
<script type="text/babel" src="src/components/ui/media.jsx"></script>
<script type="text/babel" src="src/components/ui/forms.jsx"></script>
<script type="text/babel" src="src/components/ui/feedback.jsx"></script>
<script type="text/babel" src="src/components/ui/data-display.jsx"></script>
<script type="text/babel" src="src/components/ui/overlay.jsx"></script>
<script type="text/babel" src="src/components/ui/disclosure.jsx"></script>
<script type="text/babel" src="src/components/ui/other.jsx"></script>

<!-- Utils, context, hooks, components, pages, App — in dependency order -->
```

Full load order with per-file dependency notes: [docs/file-structure.md](file-structure.md)

---

## Global Variable Pattern (no import/export)

```javascript
// utils/formatters.js
window.Formatters = {
  currency: (amount, symbol = '$') => { … },
  date: (dateStr) => { … },
  percent: (value) => { … }
};

// components/StatCard.jsx
window.StatCard = ({ label, value, delta, deltaPositive, icon }) => {
  return (
    <Card className="p-5">…</Card>
  );
};
// No export — StatCard is used as a global by everything loaded after it
```

---

## UI Primitives

`src/components/ui/` provides a full component library as globals. **Always use
these instead of raw HTML elements** for consistency.

Full reference with props and usage examples: [docs/ui-library.md](ui-library.md)

### Quick reference

| Need | Use |
|------|-----|
| Generic div | `Box` |
| Vertical stack | `VStack gap="gap-2"` |
| Horizontal row | `HStack gap="gap-3"` |
| Both-axes centre | `Center` |
| 2–4 column grid | `Grid cols={2}` |
| Push siblings apart | `Spacer` |
| Max-width page wrapper | `Container` |
| Horizontal/vertical rule | `Divider` |
| Body text | `Text` |
| Section title | `Heading level={2}` |
| Form field label | `Label` |
| Muted metadata | `Caption` |
| Lucide icon | `Icon name="TrendingUp" size={16}` |
| Image with fallback | `Img` |
| User avatar | `Avatar name="…"` |
| Action button | `Button variant="primary"` |
| Text input | `Input label="…"` |
| Dropdown | `Select label="…"` |
| Multi-line input | `Textarea label="…"` |
| Boolean toggle | `Switch checked={…} onChange={…}` |
| Multi-select option | `Checkbox checked={…} onChange={…}` |
| Loading spinner | `Spinner size="md"` |
| Loading placeholder | `Skeleton className="h-4 w-32"` |
| Budget/progress bar | `Progress value={spent} max={budget}` |
| Status banner | `Alert variant="warning"` |
| Surface container | `Card` + `CardHeader/Body/Footer` |
| Category pill | `Badge color={cat.color}` |
| Data table | `Table` + `Thead/Tbody/Tr/Th/Td` |
| Hover tooltip | `Tooltip label="…"` |
| Click popover | `Popover trigger={…}` |
| Dropdown menu | `Menu trigger={…}` + `MenuItem` |
| Confirm dialog | `AlertDialog isOpen onClose onConfirm` |
| Full modal | `Modal isOpen onClose title` |
| Collapse/expand | `AccordionItem title="…"` |
| External state collapse | `Collapsible isOpen={…}` |
| Tab navigation | `Tabs` + `Tab` + `TabPanel` |
| Zero-result placeholder | `EmptyState icon title description` |
| Page title row | `PageHeader title subtitle` |
| KPI metric block | `Stat label value delta` |

---

## Lucide Icons

The CDN loads the vanilla `lucide` package (not `lucide-react`), which exposes
`window.lucide`. **Never reference `window.lucide` or `LucideReact` directly in
components** — always use the `Icon` primitive, which wraps the API and warns on
unknown names.

```jsx
// Correct — always use the Icon primitive
<Icon name="TrendingUp" size={16} className="text-emerald-400" />

// Dynamic hex color from settings.json — use style prop (legitimate exception)
<Icon name={cat.icon} size={14} style={{ color: cat.color }} />
```

Icon names come from `settings.json` categories — never hardcode them.

---

## React Context (SettingsContext)

```javascript
// Access anywhere inside SettingsProvider
const { settings } = useSettings();

// settings shape:
// settings.user            { name, currency, currencySymbol, locale }
// settings.categories      [{ name, color, icon }, …]
// settings.budgets         { CategoryName: limitAmount, … }
// settings.accounts        [{ name, type }, …]
// settings.dashboard       { recentTransactionsCount, upcomingBillsCount }
// settings.notifications   { needsReview, overBudget, … }
```

---

## useTransactions Hook

```javascript
const {
  transactions,       // All valid rows, sorted date desc
  expenses,           // amount < 0
  income,             // amount > 0
  needsReview,        // needs_review === true
  subscriptions,      // category === 'Subscriptions'
  bills,              // category is Utilities or Housing
  billGroups,         // Categorizer.getBills() output
  subscriptionGroups, // Categorizer.getSubscriptions() output
  loading,
  error,
  reload,             // re-fetches CSV from disk
} = useTransactions();
```

Always handle `loading` and `error` states in components that call this hook.

---

## Opening the App

The app must be served over HTTP. Open `index.html` via `file://` (double-clicking
it) will fail — the browser blocks XHR to local files, which breaks Babel's JSX
loading, PapaParse's CSV download, and the settings.json fetch.

```bash
# From the project root
npx serve .
# Open http://localhost:3000
```

## Chart.js Lifecycle Pattern

The CDN loads `chart.umd.min.js` which auto-registers all controllers, elements,
and scales — `Chart.register()` is not needed and should not be called.

Chart instances must be created and destroyed via `useRef` + `useEffect`.
Failing to destroy before re-creating causes a "canvas already in use" error.

```javascript
const canvasRef = React.useRef(null);
const chartRef  = React.useRef(null);

React.useEffect(() => {
  if (!canvasRef.current || !data.length) return;

  // Destroy previous instance before creating a new one
  if (chartRef.current) {
    chartRef.current.destroy();
    chartRef.current = null;
  }

  chartRef.current = new Chart(canvasRef.current, {
    type: 'line', // or 'doughnut', 'bar', etc.
    data: { … },
    options: {
      responsive: true,
      maintainAspectRatio: false,  // container div controls height
      plugins: {
        legend: { display: false }, // use custom legend
        tooltip: {
          backgroundColor: '#1a1a26',
          borderColor: '#2a2a3d',
          borderWidth: 1,
          titleColor: '#f0f0fa',
          bodyColor: '#9090b0',
          padding: 12,
        },
      },
      scales: {
        x: { grid: { color: '#2a2a3d' }, ticks: { color: '#9090b0' } },
        y: { grid: { color: '#2a2a3d' }, ticks: { color: '#9090b0' } },
      },
    },
  });

  // Cleanup on unmount or dependency change
  return () => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };
}, [data]); // re-run only when data changes
```

Always wrap the canvas in a container div with a fixed height and `relative`:
```jsx
<div className="relative h-56">
  <canvas ref={canvasRef} />
</div>
```

---

## Tab-Based Navigation (no router)

```javascript
// App.jsx
const App = () => {
  const [activePage, setActivePage] = React.useState('dashboard');
  return (
    <SettingsProvider>
      <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0fa] overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto">
          {_renderPage(activePage)}
        </main>
      </div>
    </SettingsProvider>
  );
};
```

Pages that need to trigger navigation (e.g. NeedsReviewBanner → Transactions)
receive `onNavigate` as a prop passed down from App.

---

## Currency Formatting

Always use `Formatters.currency()` — never format amounts inline.

```javascript
// Correct
Formatters.currency(Math.abs(transaction.amount))   // "$1,234.56"
Formatters.currency(0)                               // "$0.00"

// Amount color rule
const amountClass = t.amount < 0 ? 'text-rose-400' : 'text-emerald-400';
const display = t.amount < 0
  ? `-${Formatters.currency(Math.abs(t.amount))}`
  : `+${Formatters.currency(t.amount)}`;
```

All currency values must be wrapped in `font-mono` (JetBrains Mono).

---

## Inline Style Exceptions

`style={{}}` is otherwise banned — use Tailwind. Two legitimate exceptions exist:

| Location | Style used | Why |
|----------|-----------|-----|
| `Progress` bar fill div | `style={{ width: '${pct}%' }}` | Dynamic % — no static Tailwind class exists |
| `Icon` / legend dot with dynamic hex | `style={{ color: hex }}` | Dynamic hex from `settings.json` — can't be a Tailwind class |

When adding a new component, if you find yourself reaching for `style={{}}`,
reconsider — it's almost always avoidable.

---

## Coding Standards

- Use `React.useState`, `React.useEffect`, `React.useMemo`, `React.useRef`, etc. — no destructured imports
- Functional components only. No class components.
- One component per file. One `window.ComponentName =` assignment per file.
- Props documented via JSDoc `@prop` comments at the top of the file
- No inline styles except the two documented exceptions above
- All monetary amounts rendered in `font-mono`
- Handle `loading` and `error` states in every component that calls `useTransactions`
- Every list must render `EmptyState` when empty
- Never hardcode category names, colors, or icon names — always derive from `settings.json`
- Use `key={transaction.id}` (the stable SHA-256 id field) in all transaction lists
