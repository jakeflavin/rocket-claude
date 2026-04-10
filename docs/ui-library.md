# UI Library

`src/components/ui/` is a set of thin Tailwind wrappers that replace any need
for an external component library. No Gluestack, no Chakra, no MUI — everything
is a plain function component assigned to `window.*`.

Files load in this order (each depends on the ones above it):

```
layout.jsx       → Box, VStack, HStack, Center, Grid, Spacer, Container, Divider
typography.jsx   → Text, Heading, Label, Caption
media.jsx        → Icon, Img, Avatar
forms.jsx        → Button, Input, Select, Textarea, Switch, Checkbox
feedback.jsx     → Spinner, Skeleton, Progress, Alert
data-display.jsx → Card, CardHeader, CardBody, CardFooter, Badge, Table, Thead, Tbody, Tr, Th, Td
overlay.jsx      → Portal, Modal, AlertDialog, Tooltip, Popover, Menu, MenuItem
disclosure.jsx   → Accordion, AccordionItem, Collapsible, Tabs, Tab, TabPanel
other.jsx        → EmptyState, PageHeader, Stat
```

---

## layout.jsx

### `Box`
Generic `<div>` wrapper. Use when you need a div with className but no flex
behaviour of its own.
```jsx
<Box className="p-5 bg-[#12121a]">…</Box>
```

### `VStack`
Vertical flex column. Default `gap-4`; override with `gap` prop.
```jsx
<VStack gap="gap-2" className="items-center">…</VStack>
```
**Use for**: stacking any vertical sequence of elements.

### `HStack`
Horizontal flex row, vertically centered (`items-center` built-in). Default `gap-4`.
```jsx
<HStack gap="gap-2" className="justify-between">…</HStack>
```
**Use for**: icon + label pairs, label + action rows, any side-by-side layout.

### `Center`
Flex container centering both axes. Good for empty states, full-screen loaders.
```jsx
<Center className="h-screen">…</Center>
```

### `Grid`
CSS grid with 1–4 fixed columns. Use `cols` and `gap` props.
```jsx
<Grid cols={4} gap="gap-5">…</Grid>   // KPI row
<Grid cols={2} gap="gap-6">…</Grid>   // two-column dashboard layout
```
> Note: `cols` only supports 1–4. Dynamic values beyond that need raw Tailwind.

### `Spacer`
`flex-1` div that pushes siblings apart in a flex row/column.
```jsx
<HStack><Text>Left</Text><Spacer /><Button>Right</Button></HStack>
```

### `Container`
`max-w-7xl mx-auto w-full` wrapper for page-level max-width constraint.

### `Divider`
Horizontal `<hr>` (default) or vertical `w-px` line.
```jsx
<Divider />                            // horizontal rule
<Divider orientation="vertical" />    // vertical separator in HStack
```

---

## typography.jsx

### `Text`
Generic text node. Defaults to `<span>`; use `as` prop for semantic tags.
```jsx
<Text className="text-sm text-[#9090b0]">label</Text>
<Text as="p" className="text-sm">paragraph</Text>
```
**Do not** use for headings (use `Heading`) or labels (use `Label`).

### `Heading`
`h1`–`h4` with preset sizes and `text-[#f0f0fa] font-semibold`. Override size via `className`.
```jsx
<Heading level={2}>Section title</Heading>
<Heading level={3} className="text-sm">Card title</Heading>
```

### `Label`
Uppercase, muted, small — for form field labels and data table column names.
Renders a `<label>` element; pass `htmlFor` to link it to an input.
```jsx
<Label htmlFor="name-input">Name</Label>
<Label>Total Spent</Label>
```

### `Caption`
De-emphasised helper or metadata text (`text-xs text-[#555575]`).
```jsx
<Caption>Last updated 3 days ago</Caption>
<Caption className="text-rose-400">Over budget</Caption>
```

---

## media.jsx

### `Icon`
Lucide React wrapper. Pass the icon name as a string; logs a warning for unknown names.
```jsx
<Icon name="TrendingUp" size={16} className="text-emerald-400" />
```
**Always use this** instead of `React.createElement(LucideReact.X, ...)` directly —
except inside overlay.jsx internals that can't depend on themselves.

For dynamic hex colors that can't be Tailwind classes, use `style={{ color: hex }}`.

### `Img`
`<img>` with an automatic grey placeholder on error.
```jsx
<Img src={url} alt="description" className="w-10 h-10 rounded" />
```

### `Avatar`
Circular avatar — shows image if `src` provided, otherwise renders initials.
Sizes: `sm` (24px), `md` (32px, default), `lg` (40px).
```jsx
<Avatar name="Alice Smith" size="md" />
<Avatar src="/avatars/alice.jpg" name="Alice Smith" size="lg" />
```

---

## forms.jsx

### `Button`
Four variants × three sizes. Always prefer this over raw `<button>`.

| Variant     | When to use |
|-------------|-------------|
| `primary`   | The one main call-to-action per view |
| `secondary` | Secondary actions, default |
| `ghost`     | Tertiary / icon-only buttons |
| `danger`    | Destructive actions (delete, clear) |

```jsx
<Button variant="primary" size="md" onClick={save}>Save</Button>
<Button variant="ghost" size="sm"><Icon name="X" size={14} /></Button>
```

### `Input`
Text input with optional `label` (renders a linked `<Label>`) and `error` string.
```jsx
<Input label="Merchant" value={q} onChange={e => setQ(e.target.value)} />
<Input label="Amount" error="Must be a number" />
```

### `Select`
Styled `<select>` with optional label.
```jsx
<Select label="Category" value={cat} onChange={e => setCat(e.target.value)}>
  <option value="">All</option>
  {settings.categories.map(c => <option key={c.name}>{c.name}</option>)}
</Select>
```

### `Textarea`
Multi-line input. `rows` prop (default 3). Same label/error pattern as `Input`.
```jsx
<Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
```

### `Switch`
Toggle for boolean settings. Calls `onChange(newBooleanValue)`.
```jsx
<Switch checked={enabled} onChange={setEnabled} label="Email alerts" />
```

### `Checkbox`
Checkbox with optional label. Same `checked`/`onChange` pattern as `Switch`.
```jsx
<Checkbox checked={selected} onChange={setSelected} label="Needs review" />
```

---

## feedback.jsx

### `Spinner`
Animated loading indicator. Sizes: `sm`, `md` (default), `lg`.
```jsx
<Spinner size="sm" />
```

### `Skeleton`
Pulsing placeholder. Size it via `className`.
```jsx
<Skeleton className="h-4 w-32" />   // text placeholder
<Skeleton className="h-48 w-full" /> // chart placeholder
```

### `Progress`
Horizontal bar. Color auto-shifts: emerald → amber at 75% → rose at 90%.
```jsx
<Progress value={spent} max={budget} />
<Progress value={75} max={100} showLabel />
```
> The bar width uses an inline `style` — the only legitimate exception in this codebase.

### `Alert`
Inline status banner with icon. Variants: `info`, `success`, `warning`, `error`.
Pass `onClose` to show a dismiss button.
```jsx
<Alert variant="warning" title="5 transactions need review">
  <button …>Review now →</button>
</Alert>
```

---

## data-display.jsx

### `Card` / `CardHeader` / `CardBody` / `CardFooter`
Dark surface container. Compose with sub-parts as needed.
```jsx
<Card>
  <CardHeader><Heading level={3}>Title</Heading></CardHeader>
  <CardBody>…content…</CardBody>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```
For simple cards (StatCard, etc.) skip the sub-parts and use `<Card className="p-5">` directly.

### `Badge`
Coloured pill for categories and status labels. Pass a hex `color` from
`settings.json` — background is auto-computed at ~15% opacity (`${color}26`).
```jsx
<Badge color={category.color}>{category.name}</Badge>
<Badge color="#f59e0b" size="sm">Due Soon</Badge>
```
**Never** pass hardcoded color strings that aren't from `settings.json`.

### `Table` / `Thead` / `Tbody` / `Tr` / `Th` / `Td`
Full table family. `Table` wraps in an `overflow-x-auto` div.
```jsx
<Table>
  <Thead><Tr><Th>Date</Th><Th>Merchant</Th><Th>Amount</Th></Tr></Thead>
  <Tbody>
    {rows.map(r => (
      <Tr key={r.id}>
        <Td>{r.date}</Td>
        <Td>{r.merchant}</Td>
        <Td className="font-mono">{Formatters.currency(r.amount)}</Td>
      </Tr>
    ))}
  </Tbody>
</Table>
```

---

## overlay.jsx

### `Portal`
Renders children into `document.body` — use when a parent's `overflow: hidden`
would clip a floating element. `Modal` and `Tooltip` use it internally.

### `Modal`
Centered dialog. Closes on Escape key or backdrop click. Locks body scroll.
Sizes: `sm`, `md` (default), `lg`, `xl`.
```jsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Transaction" size="md">
  …form…
</Modal>
```

### `AlertDialog`
Confirmation dialog for destructive actions — wraps `Modal`.
```jsx
<AlertDialog
  isOpen={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Delete transaction?"
  description="This cannot be undone."
  confirmLabel="Delete"
  confirmVariant="danger"
/>
```

### `Tooltip`
Hover label. Placements: `top` (default), `bottom`, `left`, `right`.
```jsx
<Tooltip label="Edit notes" placement="top">
  <Button variant="ghost" size="sm"><Icon name="Pencil" size={14} /></Button>
</Tooltip>
```

### `Popover`
Click-triggered floating panel; closes on outside click.
```jsx
<Popover trigger={<Button variant="ghost">Filter</Button>} align="right">
  …filter controls…
</Popover>
```

### `Menu` / `MenuItem`
Dropdown context menu; closes automatically when an item is clicked.
```jsx
<Menu trigger={<Button variant="ghost"><Icon name="MoreHorizontal" size={16} /></Button>}>
  <MenuItem icon="Pencil" onClick={edit}>Edit</MenuItem>
  <MenuItem icon="Trash2" onClick={remove}>Delete</MenuItem>
</Menu>
```

---

## disclosure.jsx

### `Accordion` / `AccordionItem`
Collapsible sections with dividers. `defaultOpen` shows section expanded on mount.
```jsx
<Accordion>
  <AccordionItem title="Advanced filters" defaultOpen={false}>
    …content…
  </AccordionItem>
</Accordion>
```

### `Collapsible`
Simple show/hide with no header — for progressive disclosure controlled externally.
```jsx
<Collapsible isOpen={showDetails}>
  …secondary content…
</Collapsible>
```

### `Tabs` / `Tab` / `TabPanel`
Controlled horizontal tab bar. Pair `Tabs`+`Tab` for the bar, `TabPanel` for content.
```jsx
const [tab, setTab] = React.useState('all');

<Tabs value={tab} onChange={setTab}>
  <Tab value="all">All</Tab>
  <Tab value="streaming">Streaming</Tab>
</Tabs>

<TabPanel value="all" active={tab}>…</TabPanel>
<TabPanel value="streaming" active={tab}>…</TabPanel>
```

---

## other.jsx

### `EmptyState`
Friendly placeholder for zero-result lists. Always add one to every list component.
```jsx
<EmptyState
  icon="Inbox"
  title="No transactions"
  description="Import a CSV to get started."
  action={<Button variant="primary">Import</Button>}
/>
```

### `PageHeader`
Consistent title row for every page — title, optional subtitle, optional right-side actions.
```jsx
<PageHeader title="Transactions" subtitle="87 transactions">
  <Button variant="primary"><Icon name="Upload" size={14} /> Import</Button>
</PageHeader>
```

### `Stat`
KPI block: label, large mono value, optional delta with trend icon.
Used inside `StatCard` for the Dashboard. Can also be used standalone.
```jsx
<Stat label="Total Spent" value="$3,412.00" delta="-8%" deltaPositive={false} />
```

---

## Inline Style Exceptions

Two components use `style={{}}` where Tailwind cannot help:

| Component | Prop | Reason |
|-----------|------|--------|
| `Progress` | `style={{ width: '${pct}%' }}` | Dynamic percentage — no static Tailwind class |
| `BudgetProgress`, `CategoryDonut` | `style={{ color: hex }}` on `Icon` / legend dot | Dynamic hex from settings — cannot be a Tailwind class |

All other components use Tailwind exclusively.
