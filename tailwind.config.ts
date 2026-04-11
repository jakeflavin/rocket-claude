import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: 'var(--c-surface)',
        card:    'var(--c-card)',
        raised:  'var(--c-raised)',
        rim:     'var(--c-rim)',
        fg:      'var(--c-fg)',
        muted:   'var(--c-muted)',
        faint:   'var(--c-faint)',
      },
    },
  },
  plugins: [],
} satisfies Config
