import type { SubscriptionGroup } from '../../../types'

export interface ChartSlice {
  label:  string
  amount: number
  color:  string
}

export const ChartHelpers = {
  /**
   * Generate donut slices from subscription groups using a hue-rotated color
   * palette derived from a single base hex color.
   */
  hueRotatedSlices(groups: SubscriptionGroup[], baseHex: string): ChartSlice[] {
    const r = parseInt(baseHex.slice(1, 3), 16)
    const g = parseInt(baseHex.slice(3, 5), 16)
    const b = parseInt(baseHex.slice(5, 7), 16)

    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const lit = (max + min) / 2
    const sat = max === min ? 0 : lit > 0.5
      ? (max - min) / (2 - max - min)
      : (max - min) / (max + min)
    let hue = 0
    if (max !== min) {
      if (max === rn)      hue = ((gn - bn) / (max - min) + 6) % 6
      else if (max === gn) hue = (bn - rn) / (max - min) + 2
      else                 hue = (rn - gn) / (max - min) + 4
      hue = hue * 60
    }

    const hslToHex = (hh: number, ss: number, ll: number): string => {
      const a = ss * Math.min(ll, 1 - ll)
      const f = (n: number) => {
        const k = (n + hh / 30) % 12
        return ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      }
      return '#' + ([f(0), f(8), f(4)] as number[])
        .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
        .join('')
    }

    return groups
      .filter(g => g.monthlyAmount !== 0)
      .map((g, i) => ({
        label:  g.merchant,
        amount: parseFloat(Math.abs(g.monthlyAmount).toFixed(2)),
        color:  hslToHex((hue + i * 37) % 360, Math.max(0.4, sat), Math.max(0.4, lit)),
      }))
      .sort((a, b) => b.amount - a.amount)
  },
}
