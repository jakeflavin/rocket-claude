import { useRef, useMemo } from 'react'
import type { Transaction } from '../../../types'
import { Card } from '../data-display/Card'
import { CardHeader } from '../data-display/Card'
import { CardBody } from '../data-display/Card'
import { HStack } from '../layout/HStack'
import { Heading } from '../typography/Heading'
import { Caption } from '../typography/Caption'
import { EmptyState } from '../other/EmptyState'
import { useChart } from './useChart'
import { ChartTheme } from './ChartTheme'
import { Formatters } from '../../../utils/formatters'

interface SpendingChartProps {
  transactions?: Transaction[]
  start?:        string
  end?:          string
  rangeLabel?:   string
}

export function SpendingChart({ transactions = [], start, end, rangeLabel }: SpendingChartProps) {
  const today       = new Date().toISOString().slice(0, 10)
  const activeStart = start ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const activeEnd   = end   ?? today

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { labels, data, isMultiMonth } = useMemo(() => {
    const rangeExpenses = transactions.filter(t =>
      t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd
    )

    const startDate = new Date(activeStart)
    const endDate   = new Date(activeEnd)
    const daysDiff  = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 31) {
      const dailyTotals: Record<string, number> = {}
      rangeExpenses.forEach(t => {
        dailyTotals[t.date] = (dailyTotals[t.date] || 0) + Math.abs(t.amount)
      })
      const labels: string[] = [], data: number[] = []
      let cumulative = 0
      const d = new Date(startDate)
      while (d <= endDate) {
        const key = d.toISOString().slice(0, 10)
        cumulative += dailyTotals[key] || 0
        labels.push(daysDiff <= 14 ? `${d.getMonth() + 1}/${d.getDate()}` : String(d.getDate()))
        data.push(parseFloat(cumulative.toFixed(2)))
        d.setDate(d.getDate() + 1)
      }
      return { labels, data, isMultiMonth: false }
    }

    const monthlyTotals: Record<string, number> = {}
    rangeExpenses.forEach(t => {
      const m = t.date.slice(0, 7)
      monthlyTotals[m] = (monthlyTotals[m] || 0) + Math.abs(t.amount)
    })
    const labels: string[] = [], data: number[] = []
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    while (d <= endMonth) {
      const key = d.toISOString().slice(0, 7)
      labels.push(d.toLocaleString('default', { month: 'short' }))
      data.push(parseFloat((monthlyTotals[key] || 0).toFixed(2)))
      d.setMonth(d.getMonth() + 1)
    }
    return { labels, data, isMultiMonth: true }
  }, [transactions, activeStart, activeEnd])

  useChart(canvasRef, () => {
    if (!labels.length) return null
    const t = ChartTheme.read()
    const scales = ChartTheme.scales(t, v => Formatters.currency(Number(v)))

    if (isMultiMonth) {
      return {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Spend',
            data,
            backgroundColor: 'rgba(16,185,129,0.5)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed.y ?? 0)}` }),
          },
          scales,
        },
      }
    }

    return {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cumulative Spend',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed.y ?? 0)} total` }),
        },
        scales,
      },
    }
  }, [labels, data, isMultiMonth])

  const hasData = data.length > 0 && data.some(v => v > 0)

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold">Spending Trend</Heading>
          <Caption>{rangeLabel ?? 'This Month'}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        <div className="relative h-56">
          {hasData ? (
            <canvas ref={canvasRef} />
          ) : (
            <EmptyState
              icon="TrendingUp"
              title="No spending data"
              description="No expenses recorded for this period."
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
