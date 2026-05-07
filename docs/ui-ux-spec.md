# Dashboard UI/UX Design Specification

> **Purpose:** This document is the design reference for Rocket Claude — a personal finance dashboard built with React 19, TypeScript, and Tailwind CSS v4. It covers colors, typography, spacing, borders, shadows, component anatomy, layout, and interaction patterns.

---

## 0. Project Context

| Property | Value |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Icons | Lucide React |
| Fonts | DM Sans (UI), JetBrains Mono (code) — loaded from Google Fonts |
| Data | DuckDB WASM querying local CSV files |

**Tailwind token naming:** Design tokens are defined in `@theme` inside `src/styles.css`. The token-to-utility mapping is:

| CSS Variable | Tailwind Utility |
|---|---|
| `--color-canvas` | `bg-canvas` |
| `--color-sidebar` | `bg-sidebar` |
| `--color-hover` | `bg-hover`, `hover:bg-hover` |
| `--color-surface` | `bg-surface` |
| `--color-border` | `border-border` |
| `--color-text` | `text-text` |
| `--color-muted` | `text-muted` |
| `--color-subtle` | `text-subtle` |
| `--color-brand` | `bg-brand`, `text-brand` |
| `--color-success` | `text-success` |
| `--color-success-bg` | `bg-success-bg` |
| `--color-success-border` | `border-success-border` |
| `--color-warning` | `text-warning` |
| `--color-warning-bg` | `bg-warning-bg` |
| `--color-warning-border` | `border-warning-border` |
| `--color-error` | `text-error` |
| `--color-error-bg` | `bg-error-bg` |
| `--color-row-hover` | `hover:bg-row-hover` (table rows only) |

Dark mode is driven by `@media (prefers-color-scheme: dark)` — CSS variables update automatically, no `dark:` prefixes needed on custom token classes.

---

## 1. Design Philosophy

This design system is built around **calm clarity**. The aesthetic is:

- **Neutral-forward**: Warm off-whites and soft grays dominate. Color is used sparingly as accent, never decoration.
- **Content-first**: The chrome of the dashboard (sidebar, topbar) recedes. The main content panel commands attention.
- **Softly rounded**: Everywhere — inputs, cards, buttons, avatars. Hard corners are absent.
- **Low-contrast chrome, high-contrast text**: UI surfaces are muted; readable text is always sharp.
- **Generous breathing room**: Padding and whitespace are consistently generous, especially inside content panels and cards.

---

## 2. Color Palette

All values are from the light theme (default). A dark theme exists and inverts appropriately.

### 2.1 Base / Neutral Scale

```
Background (app shell):       #F7F5F2   /* warm off-white, slight cream */
Background (sidebar):         #F0EDE8   /* slightly deeper warm gray */
Background (hover states):    #E8E4DF   /* subtle hover fill */
Surface (cards, modals):      #FFFFFF
Divider / Border:             #E2DDD8   /* warm light gray */
```

### 2.2 Text

```
Text Primary:                 #1A1915   /* near-black, warm undertone */
Text Secondary:               #6B6862   /* muted warm gray */
Text Tertiary / Placeholder:  #9E9B96   /* light muted gray */
Text on Dark:                 #FFFFFF
Text Link:                    #C96B2E   /* warm amber-orange */
```

### 2.3 Brand / Accent

```
Brand Orange (primary CTA):   #D4622A   /* copper-orange */
Brand Orange Hover:           #B8521F
Brand Orange Light (bg):      #FDF0E8   /* tinted wash for highlights */
Accent Highlight (badge):     #E8A87C   /* lighter orange accent */
```

> **Customization:** Replace the Brand Orange family with your own primary color. All brand-dependent tokens reference `--color-brand`, `--color-brand-hover`, `--color-brand-active`, and `--color-brand-light` — swap those four variables to re-theme the entire system.

### 2.4 Semantic Colors

```
Success Green:                #2D7D46
Success Background:           #F0FAF4
Success Border:               #B8E4C8
Warning Amber:                #B45309
Warning Background:           #FEF9EC
Warning Border:               #F9D78A
Error Red:                    #C0392B
Error Background:             #FEF2F1
Error Border:                 #F0C0BC
Info Blue:                    #1D6FA4
Info Background:              #EEF6FC
Info Border:                  #A8D4F0
```

### 2.5 Code Block Colors

```
Code Block Background:        #282C34   /* near-black */
Code Block Border:            #3A3F4B
Code Text Default:            #ABB2BF
Code Keyword:                 #C678DD   /* purple */
Code String:                  #98C379   /* green */
Code Number:                  #D19A66   /* amber */
Code Comment:                 #5C6370   /* muted gray */
Code Function:                #61AFEF   /* blue */
```

---

## 3. Typography

### 3.1 Font Families

```css
--font-sans: "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

**Google Fonts import (in `index.html`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

> **Why DM Sans:** Humanist proportions, optical sizing axis, and clean geometric forms make it a strong neutral UI font with more character than system defaults. It pairs naturally with the warm neutral palette.

### 3.2 Type Scale

| Role | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display / H1 | 2rem (32px) | 600 | 1.25 | -0.02em |
| Heading / H2 | 1.5rem (24px) | 600 | 1.3 | -0.015em |
| Subheading / H3 | 1.25rem (20px) | 500 | 1.35 | -0.01em |
| Body (default) | 1rem (16px) | 400 | 1.65 | 0 |
| Body Small | 0.875rem (14px) | 400 | 1.55 | 0 |
| Caption / Meta | 0.75rem (12px) | 400 | 1.4 | 0.01em |
| Code Inline | 0.875rem (14px) | 400 | 1.5 | 0 |
| Code Block | 0.8125rem (13px) | 400 | 1.6 | 0 |
| Button | 0.875rem (14px) | 500 | 1 | 0.005em |
| Label / Badge | 0.75rem (12px) | 500 | 1 | 0.02em |

### 3.3 Rich Text / Prose Content

When a content panel renders long-form or Markdown content:

- `h1` — 1.5rem, weight 600, bottom margin 0.75rem
- `h2` — 1.25rem, weight 600, bottom margin 0.5rem
- `h3` — 1.125rem, weight 600, bottom margin 0.375rem
- `p` — bottom margin 0.875rem
- `ul / ol` — padding-left 1.5rem, row gap 0.25rem
- `li` — line-height 1.65
- `strong` — weight 600
- `em` — font-style italic
- `a` — color `#C96B2E`, underline on hover
- `blockquote` — left border 3px solid `#E2DDD8`, padding-left 1rem, color `#6B6862`
- `hr` — border-color `#E2DDD8`, margin-block 1.25rem
- `table` — full-width, border-collapse collapse; `th` has bottom border 2px `#E2DDD8`; `td` has 1px `#E2DDD8` borders; alternating row tint `#FAF9F7`

---

## 4. Spacing System

Uses an **8px base grid** with a 4px sub-unit for fine adjustments.

```
--space-0:   0px
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
```

### Key Spacing Usages

| Location | Value |
|---|---|
| Input field padding (horizontal) | 14px |
| Input field padding (vertical) | 10px |
| Content panel padding | 24px |
| Card padding | 20px 24px |
| Card gap (grid) | 16px |
| Sidebar nav item padding | 8px 12px |
| Sidebar section gap | 24px |
| Modal padding | 24px |
| Button padding (sm) | 6px 12px |
| Button padding (md) | 8px 16px |
| Button padding (lg) | 12px 20px |
| Page section gap | 16px |
| Avatar size (sm) | 28px × 28px |
| Avatar size (md) | 36px × 36px |
| FAB size | 56px × 56px |

---

## 5. Border Radius

Maps to Tailwind v4 utilities:

```
4px  → rounded      /* tags, badges, inline code */
8px  → rounded-lg   /* input fields, buttons */
12px → rounded-xl   /* cards, panels */
16px → rounded-2xl  /* large cards, drawers */
24px → rounded-3xl  /* hero cards, large panels */
9999px → rounded-full /* pills, avatars, toggles */
```

---

## 6. Shadows & Elevation

Shadows are subtle and warm-tinted (no cool blue box shadows). Defined in `@theme` as `--shadow-*` tokens.

```css
--shadow-xs:  0 1px 2px rgba(26, 25, 21, 0.05);
--shadow-sm:  0 1px 3px rgba(26, 25, 21, 0.08), 0 1px 2px rgba(26, 25, 21, 0.04);
--shadow-md:  0 4px 6px rgba(26, 25, 21, 0.06), 0 2px 4px rgba(26, 25, 21, 0.04);
--shadow-lg:  0 10px 15px rgba(26, 25, 21, 0.07), 0 4px 6px rgba(26, 25, 21, 0.04);
--shadow-xl:  0 20px 25px rgba(26, 25, 21, 0.08), 0 8px 10px rgba(26, 25, 21, 0.04);
```

| Usage | Token |
|---|---|
| Card (resting) | `shadow-xs` |
| Card (hover) | `shadow-sm` |
| Input (focused) | `shadow-sm` |
| Dropdown / Popover | `shadow-md` |
| Modal / Dialog | `shadow-lg` |
| FAB | `shadow-lg` |
| Drawer | `shadow-xl` |

---

## 7. Layout & Structure

### 7.1 App Shell

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (260px)  │          Main Area (flex-1)           │
│                   │                                       │
│  [Logo]           │    [Top Bar / Breadcrumb]             │
│  ─────────────    │    ─────────────────────────────────  │
│  [Nav Section]    │                                       │
│    > Transactions │    ┌─────────────────────────────┐    │
│    > (future)     │    │   Page Content              │    │
│                   │    │   (scrollable, p-6)         │    │
│                   │    │                             │    │
│  ─────────────    │    └─────────────────────────────┘    │
│  [Collapse Btn]   │                                       │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Responsive Breakpoints

```
Mobile:   < 768px    — sidebar hidden; hamburger menu opens a drawer
Tablet:   768–1024px — sidebar collapsible (icon-only or off-canvas)
Desktop:  > 1024px   — sidebar always visible at 260px
Wide:     > 1440px   — content panel max-width: 1200px, centered
```

### 7.3 Content Panel Container

```css
main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
```

### 7.4 Page Grid

Most pages use a **12-column grid** at desktop width. Common patterns:

```
Full width:      12 cols  — tables, full-width data views
Two thirds:      8 cols   — main content + 4-col sidebar
Half / Half:     6 + 6    — split panels
Card grid:       4 cols each — stat cards (3 across), auto-fill at smaller sizes
```

---

## 8. Core Components

### 8.1 Sidebar

```
Width:              260px (desktop), 72px (collapsed)
Background:         bg-sidebar (#F0EDE8 light / #111110 dark)
Border-right:       1px solid border-border
Padding:            8px (p-2)
```

**Logo Area**
```
Height:             52px (matches top bar)
Padding:            0 12px
Border-bottom:      1px solid border-border
Logo text:          text-sm font-semibold text-text
```

**Nav Item**
```
Height:             36px (h-9)
Border-radius:      6px (rounded-[6px])
Padding:            8px 12px (px-3 py-2)
Font-size:          14px (text-sm)
Font-weight:        400 (normal)
Color:              text-muted
Transition:         colors 100ms

Icon:               20px, currentColor

:hover              { bg-hover; text-text; }

Active / Current:
  background:       bg-hover
  color:            text-text
  font-weight:      500 (font-medium)
  icon color:       text-brand
```

**Collapse Button**
```
Same styling as nav item
Shows "Collapse" label + ChevronLeft icon (expanded)
Shows ChevronRight icon only (collapsed)
Border-top:         1px solid border-border
```

---

### 8.2 Top Bar (Header)

```
Height:             52px (h-[52px])
Background:         bg-canvas
Border-bottom:      1px solid border-border
Padding:            0 24px (px-6)
Position:           sticky, top 0 (via flex shrink-0)
```

**Breadcrumb (left side)**
```
Font-size:          14px (text-sm)
Separator:          "/" — color text-subtle
Current page:       font-semibold text-text
Ancestor pages:     text-subtle
```

---

### 8.3 Cards

**Standard Card**
```
Background:         bg-surface
Border:             1px solid border-border
Border-radius:      12px (rounded-xl)
Padding:            20px 24px (py-5 px-6)
Box-shadow:         shadow-xs

:hover (if interactive): shadow-sm
```

**Stat Card**
```
Background:         bg-surface
Border:             1px solid border-border
Border-radius:      12px (rounded-xl)
Padding:            20px (p-5)
Box-shadow:         shadow-xs

Label:              text-xs font-medium text-muted uppercase tracking-[0.04em]
Value:              text-[28px] font-semibold text-text leading-tight mt-1
Delta (positive):   text-sm text-success font-medium
Delta (negative):   text-sm text-error font-medium
```

---

### 8.4 Data Table

```
Container:
  bg-surface border border-border rounded-xl overflow-hidden

thead:
  bg-canvas border-b-2 border-border

th:
  px-4 py-[10px] text-xs font-medium text-muted uppercase tracking-[0.04em] text-left

td:
  px-4 py-3 text-sm text-text border-b border-border

tr:last-child td:
  border-bottom: none

tbody tr:hover:
  bg-row-hover (#FAF9F7 light / #2A2826 dark)

Sort indicator active:
  text-brand
```

---

### 8.5 Floating Action Button (FAB)

The FAB is fixed to the **bottom-right corner** of the viewport for primary page actions.

```
Position:           fixed, bottom 24px, right 24px, z-50
Size:               56px × 56px, rounded-full
Background:         bg-brand (#D4622A)
Color:              white
Shadow:             shadow-lg

:hover              { bg-brand-hover; shadow-xl; translateY(-1px) }
:active             { bg-brand-active; translateY(0); shadow-md }
```

**Extended FAB (icon + label)**
```
Width:              auto
Padding:            0 20px 0 16px
Border-radius:      rounded-full
Gap:                8px (icon + text)
Label:              text-sm font-medium
```

---

### 8.6 Buttons

**Primary Button**
```
bg-brand text-white rounded-lg px-4 py-2 text-sm font-medium
hover:bg-brand-hover
active:bg-brand-active
disabled: bg-border text-subtle cursor-not-allowed
```

**Secondary / Ghost Button**
```
bg-transparent text-text border border-border rounded-lg px-4 py-2 text-sm font-medium
hover:bg-hover
```

**Icon Button (toolbar / card actions)**
```
bg-transparent border-none rounded-[6px] p-1.5 text-muted w-8 h-8
hover:bg-hover hover:text-text
```

**Destructive Button**
```
bg-transparent text-error border border-error-border rounded-lg px-4 py-2 text-sm font-medium
hover:bg-error-bg
```

---

### 8.7 Badges & Pills

**Default Badge**
```
bg-hover text-muted rounded-full px-2 py-0.5 text-xs font-medium
```

**Brand / Highlight Pill**
```
bg-brand-light text-brand border border-[#F0C8A0] rounded-full px-2 py-0.5 text-xs font-medium
```

**Semantic Badges**
```
Success:   bg-success-bg text-success border border-success-border
Warning:   bg-warning-bg text-warning border border-warning-border
Error:     bg-error-bg text-error border border-error-border
Info:      bg-info-bg text-info border border-info-border
```

**Status Dot**
```
Width/Height:       6px, rounded-full, inline-block, mr-1.5

Active / Online:    text-success (bg-success)
Idle:               text-warning (bg-warning)
Offline:            text-subtle (bg-subtle)
Error:              text-error (bg-error)
```

---

### 8.8 Input Fields (Forms)

```
bg-surface border border-border rounded-lg px-[14px] py-[10px] text-sm text-text w-full

::placeholder       { color: text-subtle }

:focus              {
  outline: none
  border-color: text-link (#C96B2E)
  box-shadow: 0 0 0 3px rgba(212, 98, 42, 0.12)
}

Label:              text-[13px] font-medium text-text mb-1.5
Helper text:        text-xs text-muted mt-1
Error text:         text-xs text-error mt-1

Error state:
  border-color:     text-error
  box-shadow:       0 0 0 3px rgba(192, 57, 43, 0.1)
```

---

### 8.9 Toggle / Switch

```
Width: 36px, Height: 20px, rounded-full
Off:  bg-[#D0CBC4]
On:   bg-brand
Knob: 16px white circle, shadow-xs
```

---

### 8.10 Empty State

```
flex flex-col items-center p-12 text-center

Icon:       48px, text-subtle, mt-0
Heading:    text-base font-semibold text-text mt-4
Body:       text-sm text-muted max-w-xs mt-1.5
CTA:        primary or secondary button, mt-5
```

---

### 8.11 Skeleton / Loading State

```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #EDEAE5 25%, #F7F5F2 50%, #EDEAE5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: matches the element;
}
```

---

### 8.12 Modal / Dialog

```
Overlay:  rgba(26, 25, 21, 0.4), backdrop-blur-sm

Modal card:
  bg-surface rounded-2xl shadow-xl p-6 max-w-[480px] w-[calc(100%-2rem)] mx-auto

Header:   text-lg font-semibold text-text mb-2
Body:     text-sm text-muted leading-relaxed mb-6
Footer:   flex gap-2 justify-end
```

---

### 8.13 Toast / Notification

```
bg-[#1A1915] text-white rounded-[10px] px-4 py-3 text-sm shadow-lg max-w-[360px]
Fixed: bottom-6 right-6 (desktop); bottom-4 centered (mobile)
```

---

## 9. Iconography

- **Style:** Thin-stroke line icons (1.5px stroke). Never filled, except for active/selected states.
- **Library:** Lucide React (`import { IconName } from 'lucide-react'`)
- **Sizes:**
  - 14px — inline with small text
  - 16px — inline with body text, table actions, collapse button
  - 20px — nav items, card actions, buttons
  - 24px — FAB
  - 48px — empty state hero icons
- **Color:** `currentColor` — inherits from parent via `className`. Never hardcode icon colors.
- **Active nav icon:** `text-brand`

---

## 10. Motion & Animation

```css
--ease-default: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--duration-fast: 100ms;
--duration-norm: 150ms;
--duration-slow: 250ms;
```

| Interaction | Duration | Easing |
|---|---|---|
| Button hover | 100ms | ease-default |
| Nav item hover | 100ms | ease-default |
| Dropdown open | 150ms | ease-default |
| Modal open | 250ms | ease-default |
| Sidebar open/close | 250ms | ease-default |
| Toast enter | 300ms | ease-default |
| Card hover shadow | 150ms | ease-out |

Use `transition-colors` for color-only transitions, `transition-[width]` for dimension changes.

---

## 11. Dark Theme

Dark mode activates via `@media (prefers-color-scheme: dark)`. CSS variables update automatically — no `dark:` prefixes needed for custom token classes.

```
--color-canvas:   #1A1917
--color-sidebar:  #111110
--color-hover:    #2A2826
--color-surface:  #242320
--color-border:   #2E2C29
--color-text:     #F0EDE8
--color-muted:    #8C8880
--color-subtle:   #5C5852
--color-row-hover: #2A2826

Brand Orange unchanged: #D4622A
Focus ring: rgba(212, 98, 42, 0.25)
```

---

## 12. CSS Custom Properties Reference

Full token list from `src/styles.css`. Light mode in `@theme`, dark mode overrides in `@media (prefers-color-scheme: dark) { :root { ... } }`.

```css
/* @theme block */
--font-sans: "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;

--color-canvas: #F7F5F2;
--color-sidebar: #F0EDE8;
--color-hover: #E8E4DF;
--color-surface: #FFFFFF;
--color-border: #E2DDD8;
--color-row-hover: #FAF9F7;

--color-text: #1A1915;
--color-muted: #6B6862;
--color-subtle: #9E9B96;

--color-brand: #D4622A;
--color-brand-hover: #B8521F;
--color-brand-active: #9A4418;
--color-brand-light: #FDF0E8;
--color-link: #C96B2E;

--color-success: #2D7D46;
--color-success-bg: #F0FAF4;
--color-success-border: #B8E4C8;
--color-warning: #B45309;
--color-warning-bg: #FEF9EC;
--color-warning-border: #F9D78A;
--color-error: #C0392B;
--color-error-bg: #FEF2F1;
--color-error-border: #F0C0BC;
--color-info: #1D6FA4;
--color-info-bg: #EEF6FC;
--color-info-border: #A8D4F0;

--shadow-xs: 0 1px 2px rgba(26,25,21,0.05);
--shadow-sm: 0 1px 3px rgba(26,25,21,0.08), 0 1px 2px rgba(26,25,21,0.04);
--shadow-md: 0 4px 6px rgba(26,25,21,0.06), 0 2px 4px rgba(26,25,21,0.04);
--shadow-lg: 0 10px 15px rgba(26,25,21,0.07), 0 4px 6px rgba(26,25,21,0.04);
--shadow-xl: 0 20px 25px rgba(26,25,21,0.08), 0 8px 10px rgba(26,25,21,0.04);

/* Dark mode overrides */
--color-canvas:   #1A1917;
--color-sidebar:  #111110;
--color-hover:    #2A2826;
--color-surface:  #242320;
--color-border:   #2E2C29;
--color-row-hover: #2A2826;
--color-text:     #F0EDE8;
--color-muted:    #8C8880;
--color-subtle:   #5C5852;
```

---

## 13. Accessibility Notes

- **Focus rings:** All interactive elements display a 3px brand-color ring (`rgba(212, 98, 42, 0.5)`) on keyboard focus. Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50`.
- **Color contrast:** All text pairings meet WCAG AA (4.5:1) minimum. Primary text on `#F7F5F2` achieves AAA.
- **Touch targets:** Minimum 44×44px on mobile for all tappable elements.
- **Semantic HTML:** Use `<nav>` for sidebar, `<main>` for content panel, `<button>` for all interactive actions (not `<div>`), `<table>` with `<thead>` / `<tbody>` for data tables.
- **ARIA:** Nav items use `aria-current="page"` for the active route. FAB should have `aria-label`. Modals use `role="dialog"` and `aria-modal="true"`. Toast notifications use `role="status"` or `aria-live="polite"`.
- **Reduced motion:** Wrap non-essential transitions in `@media (prefers-reduced-motion: no-preference) { ... }`.
