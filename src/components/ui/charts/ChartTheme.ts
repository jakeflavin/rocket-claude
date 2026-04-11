import type { TooltipCallbacks } from 'chart.js'

export interface ThemeTokens {
  raised: string
  rim:    string
  fg:     string
  muted:  string
}

export const ChartTheme = {
  /** Return current theme token values from CSS custom properties. */
  read(): ThemeTokens {
    const cv = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    return {
      raised: cv('--c-raised'),
      rim:    cv('--c-rim'),
      fg:     cv('--c-fg'),
      muted:  cv('--c-muted'),
    }
  },

  /** Return a Chart.js tooltip config using the current theme tokens. */
  tooltip(t: ThemeTokens, callbacks: Partial<TooltipCallbacks<'bar' | 'line' | 'doughnut'>> = {}) {
    return {
      backgroundColor: t.raised,
      borderColor:     t.rim,
      borderWidth:     1,
      titleColor:      t.fg,
      bodyColor:       t.muted,
      padding:         12,
      callbacks,
    }
  },

  /** Return Chart.js x/y scales config for line and bar charts. */
  scales(t: ThemeTokens, yTickFn: (v: number | string) => string = v => String(v)) {
    const tick = { color: t.muted, font: { family: 'DM Sans', size: 11 } }
    return {
      x: { grid: { color: t.rim }, ticks: tick },
      y: {
        grid: { color: t.rim },
        beginAtZero: true,
        ticks: { ...tick, callback: yTickFn },
      },
    }
  },
}
