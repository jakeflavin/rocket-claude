# Styling Guide

## Theme

Dark-first. All components default to dark mode. No light mode toggle in v1.

## Color Palette

```css
--color-bg-primary:    #0a0a0f;   /* page background */
--color-bg-surface:    #12121a;   /* cards, sidebar */
--color-bg-elevated:   #1a1a26;   /* inputs, hover states */
--color-bg-border:     #2a2a3d;   /* dividers, borders */

--color-text-primary:  #f0f0fa;   /* headings, primary text */
--color-text-secondary:#9090b0;   /* labels, metadata */
--color-text-muted:    #555575;   /* placeholders, disabled */

--color-accent:        #10b981;   /* emerald — income, success, CTA */
--color-danger:        #f43f5e;   /* rose — expenses, errors, over-budget */
--color-warning:       #f59e0b;   /* amber — due soon, approaching limit */
--color-info:          #3b82f6;   /* blue — neutral info, transportation */

--color-chart-1:       #10b981;
--color-chart-2:       #f59e0b;
--color-chart-3:       #3b82f6;
--color-chart-4:       #8b5cf6;
--color-chart-5:       #06b6d4;
--color-chart-6:       #ec4899;
--color-chart-7:       #f97316;
--color-chart-8:       #84cc16;
```

## Typography

- **Display / Headings**: `'DM Sans'` — loaded via Google Fonts CDN
- **Body / UI**: `'DM Sans'` — same family, different weights
- **Monospace / Amounts**: `'JetBrains Mono'` — for all currency values

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing Scale (Tailwind)

Use Tailwind's default scale. Key values:

- Card padding: `p-5` or `p-6`
- Section gaps: `gap-5` or `gap-6`
- Sidebar width: `w-60` (240px)
- Content max-width: `max-w-7xl`

## Component Patterns

### Stat Card

```
bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5
Label: text-xs font-medium text-[#9090b0] uppercase tracking-wide
Value: text-2xl font-bold font-mono text-[#f0f0fa]
Delta: text-xs text-emerald-400 or rose-400
```

### Category Badge

```
inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
Background: category color at 15% opacity
Text: category color at full opacity
```

### Transaction Row

```
flex items-center justify-between py-3 border-b border-[#2a2a3d]
Merchant: text-sm font-medium text-[#f0f0fa]
Date + account: text-xs text-[#9090b0]
Amount (expense): text-sm font-mono font-medium text-rose-400
Amount (income): text-sm font-mono font-medium text-emerald-400
```

### Needs Review Badge

```
bg-amber-500/15 text-amber-400 border border-amber-500/30
rounded-lg px-3 py-2 text-sm
```

### Progress Bar (Budget)

```
< 75%:  bg-emerald-500
75–90%: bg-amber-500
> 90%:  bg-rose-500
Track:  bg-[#2a2a3d] rounded-full h-2
```

## Chart.js Dark Theme Defaults

Apply to every chart instance:

```javascript
Chart.defaults.color = '#9090b0';
Chart.defaults.borderColor = '#2a2a3d';
Chart.defaults.backgroundColor = 'transparent';

// Per-chart plugin config
plugins: {
  legend: { labels: { color: '#9090b0', font: { family: 'DM Sans' } } },
  tooltip: {
    backgroundColor: '#1a1a26',
    borderColor: '#2a2a3d',
    borderWidth: 1,
    titleColor: '#f0f0fa',
    bodyColor: '#9090b0',
    padding: 12,
  }
},
scales: {
  x: { grid: { color: '#2a2a3d' }, ticks: { color: '#9090b0' } },
  y: { grid: { color: '#2a2a3d' }, ticks: { color: '#9090b0' } }
}
```
