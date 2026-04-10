# rocket-claude

A Claude Code–powered personal finance dashboard. No build step. No compile. Open `index.html` and go.

React 18 + Tailwind CSS + Chart.js + PapaParse, all via CDN. `data/transactions.csv` is the only database. `settings.json` is the only config.

---

## Data Flow

```
Bank PDFs / CSVs  →  Claude Code Skill  →  data/transactions.csv  →  index.html (React UI)
```

→ Full constraints: [docs/data-flow.md](docs/data-flow.md)

---

## Key Conventions

- **No `import`/`export`** — no module bundler. All utilities assigned to `window.*`. Components are global by declaration.
- **Script load order = dependency graph** — UI library → utils → hooks → components → pages → App. See [docs/file-structure.md](docs/file-structure.md).
- **`React.useState` not `useState`** — no destructured imports. Always use the full `React.*` namespace.
- **Tailwind only, no inline styles** — `bg-[#hex]` for custom colors. Two exceptions documented in [docs/coding-guide.md](docs/coding-guide.md#inline-style-exceptions).
- **All amounts in `font-mono`** — JetBrains Mono for every currency value rendered in the UI.
- **All categories and colors from `settings.json`** — never hardcode category names or hex values in components.

---

## UI Library

`src/components/ui/` is a custom component library — **no external UI framework**.
Every primitive is a thin Tailwind wrapper assigned to `window.*`.

**Always use these primitives. Never write raw `<div>`, `<button>`, `<input>` etc. directly in page or component files.**

| File | Globals |
|------|---------|
| `layout.jsx` | `Box`, `VStack`, `HStack`, `Center`, `Grid`, `Spacer`, `Container`, `Divider` |
| `typography.jsx` | `Text`, `Heading`, `Label`, `Caption` |
| `media.jsx` | `Icon`, `Img`, `Avatar` |
| `forms.jsx` | `Button`, `Input`, `Select`, `Textarea`, `Switch`, `Checkbox` |
| `feedback.jsx` | `Spinner`, `Skeleton`, `Progress`, `Alert` |
| `data-display.jsx` | `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Badge`, `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` |
| `overlay.jsx` | `Portal`, `Modal`, `AlertDialog`, `Tooltip`, `Popover`, `Menu`, `MenuItem` |
| `disclosure.jsx` | `Accordion`, `AccordionItem`, `Collapsible`, `Tabs`, `Tab`, `TabPanel` |
| `other.jsx` | `EmptyState`, `PageHeader`, `Stat` |

Full reference with props and when-to-use notes: **[docs/ui-library.md](docs/ui-library.md)**

### Most-used primitives at a glance

```jsx
// Layout
<Box className="p-5">…</Box>
<VStack gap="gap-2">…</VStack>
<HStack gap="gap-3" className="justify-between">…</HStack>
<Center className="h-screen">…</Center>
<Grid cols={4} gap="gap-5">…</Grid>

// Typography
<Text className="text-sm text-[#9090b0]">label</Text>
<Heading level={3} className="text-sm">Card title</Heading>
<Label>Field label</Label>
<Caption>Muted metadata</Caption>

// Icons  (name is always a string from settings.json or a known Lucide name)
<Icon name="TrendingUp" size={16} className="text-emerald-400" />
<Icon name={cat.icon} size={14} style={{ color: cat.color }} />  // dynamic hex = style ok

// Data display
<Card><CardHeader>…</CardHeader><CardBody>…</CardBody></Card>
<Badge color={cat.color}>{cat.name}</Badge>   // hex from settings only

// Forms
<Button variant="primary">Save</Button>
<Input label="Search" value={q} onChange={e => setQ(e.target.value)} />
<Select label="Category">…</Select>
<Switch checked={on} onChange={setOn} label="Notifications" />

// Feedback
<Spinner />
<Skeleton className="h-4 w-32" />
<Progress value={spent} max={budget} />
<Alert variant="warning" title="5 items need review" />

// Overlay
<Modal isOpen={open} onClose={() => setOpen(false)} title="Edit">…</Modal>
<AlertDialog isOpen={open} onClose={…} onConfirm={…} title="Delete?" />
<Tooltip label="Edit notes"><Button>…</Button></Tooltip>
<Menu trigger={<Button>…</Button>}><MenuItem>…</MenuItem></Menu>

// Disclosure
<Tabs value={tab} onChange={setTab}><Tab value="all">All</Tab></Tabs>
<TabPanel value="all" active={tab}>…</TabPanel>
<AccordionItem title="Advanced">…</AccordionItem>

// Composed helpers
<EmptyState icon="Inbox" title="No data" description="…" />
<PageHeader title="Transactions" subtitle="87 rows" />
<Stat label="Total Spent" value="$3,412" delta="-8%" deltaPositive={false} />
```

---

## Notes for Claude Code

- **Never use `import` or `export`** — no module bundler. All utilities and components are global `window.*`.
- **Script load order in `index.html` is the dependency graph** — see [docs/file-structure.md](docs/file-structure.md) for the full annotated tree.
- **JSX works via Babel standalone** — use `<script type="text/babel" src="...">` for all `.jsx` files.
- **Tailwind via CDN** — full utility set available. `bg-[#hex]` for custom colors.
- **Serve over HTTP, never `file://`** — run `npx serve .` from the project root and open `http://localhost:3000`. Opening `index.html` directly triggers CORS errors on every local file fetch (JSX, CSV, JSON).
- **Lucide icons via `window.lucide`** — the CDN loads the vanilla `lucide` package (not `lucide-react`). Always use the `Icon` primitive; never reference `window.lucide` or `LucideReact` directly in components.
- **Chart.js UMD build auto-registers** — `Chart.register()` is not needed. The UMD bundle (`chart.umd.min.js`) registers all controllers, elements, and scales automatically.
- **Chart.js lifecycle** — always create/destroy via `useRef` + `useEffect`; destroy before re-creating to avoid "canvas already in use". See [docs/coding-guide.md](docs/coding-guide.md#chartjs-lifecycle-pattern).
- **`settings.json` is the source for all categories, colors, budget limits, and user preferences** — never hardcode these in components.
- **The `id` field is the stable React key** — always use `key={transaction.id}` in transaction lists.
- **`needs_review` normalization** — PapaParse with `dynamicTyping: true` parses it as boolean `true`; the hook normalizes this. Filter with `t.needs_review === true`.
- **Inline styles** — only two legitimate exceptions exist (Progress bar width, dynamic hex color on Icon). Everything else must be Tailwind.

---

## Active Work Queue

**[docs/task-list.md](docs/task-list.md)** — 30 tasks across 5 phases

**Workflow:** Commit all changes after each task is complete before moving to the next.

---

## Reference Docs

| Area                    | File                                                   |
|-------------------------|--------------------------------------------------------|
| Project Overview        | [docs/overview.md](docs/overview.md)                   |
| Data Flow & Constraints | [docs/data-flow.md](docs/data-flow.md)                 |
| CSV Schema & Categories | [docs/csv-schema.md](docs/csv-schema.md)               |
| Features — v1 Scope     | [docs/features-v1.md](docs/features-v1.md)             |
| Styling Guide           | [docs/styling-guide.md](docs/styling-guide.md)         |
| Coding Guide            | [docs/coding-guide.md](docs/coding-guide.md)           |
| File Structure          | [docs/file-structure.md](docs/file-structure.md)       |
| **UI Library**          | **[docs/ui-library.md](docs/ui-library.md)**           |
| Task List               | [docs/task-list.md](docs/task-list.md)                 |
