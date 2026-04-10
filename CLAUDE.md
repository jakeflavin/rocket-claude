# rocket-claude

A Claude Code–powered personal finance dashboard. No build step. No compile. Open `index.html` and go.

React 18 + Tailwind CSS + Chart.js + PapaParse, all via CDN. `data/transactions.csv` is the only database. `settings.json` is the only config.

---

## Data Flow

```
Bank PDFs / CSVs  →  Claude Code Skill  →  data/transactions.csv  →  index.html (React UI)
```

```
┌─────────────────────────┐
│  /statements folder     │  ← user drops files here
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  Claude Code Skill      │  ← normalizes, deduplicates (SHA-256 id), writes rows
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  data/transactions.csv  │  ← single source of truth
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  index.html (React UI)  │  ← PapaParse reads CSV, UI renders, user edits notes/flags
└─────────────────────────┘
```

→ Full constraints: [docs/data-flow.md](docs/data-flow.md)

---

## Key Conventions

- **No `import`/`export`** — no module bundler. All utilities are assigned to `window.*` (e.g. `window.Formatters`). Components are global by declaration.
- **Script load order = dependency graph** — utilities before hooks, hooks before components, components before pages, pages before App. See [docs/file-structure.md](docs/file-structure.md).
- **`React.useState` not `useState`** — no destructured imports. Always use the full `React.*` namespace.
- **Tailwind only, no inline styles** — use `bg-[#hex]` for custom colors. Never `style={{}}` unless absolutely unavoidable.
- **All amounts in `font-mono`** — JetBrains Mono for every currency value rendered in the UI.
- **All categories and colors from `settings.json`** — never hardcode category names or hex values in components.

→ Full guide: [docs/coding-guide.md](docs/coding-guide.md)

---

## Notes for Claude Code

- **Never use `import` or `export`** — there is no module bundler. All utilities and components are global.
- **Script load order in `index.html` is the dependency graph** — utilities before hooks, hooks before components, components before pages, pages before App.
- **JSX works via Babel standalone** — use `<script type="text/babel" src="...">` for all `.jsx` files.
- **Tailwind via CDN** — the full utility set is available. Use `bg-[#hex]` for custom colors.
- **PapaParse `download: true`** requires the file to be served — a local HTTP server (e.g. `python -m http.server 8080`) is needed if opening via `file://` protocol triggers CORS. Note this in README.
- **Chart.js must be registered** — call `Chart.register(...Chart.registerables)` once before any chart renders.
- **settings.json is the source for all categories, colors, budget limits, and user preferences** — never hardcode these values in components.
- **The `id` field is the stable React key** — always use `key={transaction.id}` in lists.
- **`needs_review` may be the string `"true"` or boolean `true`** after PapaParse parsing — normalize with `String(t.needs_review) === 'true'`.

---

## Active Work Queue

**[docs/task-list.md](docs/task-list.md)** — 30 tasks across 5 phases

---

## Reference Docs

| Area                   | File                                               |
|------------------------|----------------------------------------------------|
| Project Overview       | [docs/overview.md](docs/overview.md)               |
| Data Flow & Constraints| [docs/data-flow.md](docs/data-flow.md)             |
| CSV Schema & Categories| [docs/csv-schema.md](docs/csv-schema.md)           |
| Features — v1 Scope    | [docs/features-v1.md](docs/features-v1.md)         |
| Styling Guide          | [docs/styling-guide.md](docs/styling-guide.md)     |
| Coding Guide           | [docs/coding-guide.md](docs/coding-guide.md)       |
| File Structure         | [docs/file-structure.md](docs/file-structure.md)   |
| Task List              | [docs/task-list.md](docs/task-list.md)             |
