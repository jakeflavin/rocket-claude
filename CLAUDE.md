# Rocket Claude

Personal finance dashboard — React 19, TypeScript, Tailwind CSS v4, DuckDB WASM.

## Docs

Four reference documents live in `docs/`. Read the relevant one before starting any task.

### `docs/coding-standards.md`
Read this before writing any code. Covers the layer rule (Component → Hook → Query → DuckDB), the data access rule (never read or write CSV directly — always through DuckDB), component structure, hook patterns, query file conventions, error handling, and naming.

### `docs/ui-ux-spec.md`
Read this before building or modifying any UI. Covers the color palette and Tailwind design tokens, typography (DM Sans, JetBrains Mono), spacing and border conventions, component anatomy (cards, buttons, inputs, badges), layout patterns, and interaction states.

### `docs/data-models.md`
Read this before writing any query or working with data. Covers every table loaded from `/data/*.csv` — column names, types, relationships, and the amount sign convention (negative = expense, positive = income).

### `docs/coding-standards.md` — when to re-check
Come back to it if you are unsure whether logic belongs in a component, hook, or query function; if you are about to access the DB from outside the query layer; or if you are adding a new shared component.

## Feature Development 
When asked to complete a feature, find the corrisponding feature plan in `docs/features.md`. It should contain an overview and a list of tasks. 

### Task Execution 
Tasks are in priority order. Complete each task one by one. Do not start the next task until the one before it is complete. Mark the task as completed before continuing to the next task. 
