import { useRef, useMemo } from 'react'
import type { Transaction, CategoryConfig } from '../../../types'
import { Card } from '../data-display/Card'
import { CardHeader } from '../data-display/Card'
import { CardBody } from '../data-display/Card'
import { HStack } from '../layout/HStack'
import { VStack } from '../layout/VStack'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'
import { Caption } from '../typography/Caption'
import { EmptyState } from '../other/EmptyState'
import { useChart } from './useChart'
import { ChartTheme } from './ChartTheme'
import { Formatters } from '../../../utils/formatters'

interface CategoryDonutProps {
  transactions?: Transaction[]
  categories?:   CategoryConfig[]
  start?:        string
  end?:          string
  rangeLabel?:   string
}

export function CategoryDonut({ transactions = [], categories = [], start, end, rangeLabel }: CategoryDonutProps) {
  const today       = new Date().toISOString().slice(0, 10)
  const activeStart = start ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const activeEnd   = end   ?? today

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const slices = useMemo(() => {
    const colorMap: Record<string, string> = {}
    categories.forEach(c => { colorMap[c.name] = c.color })

    const totals: Record<string, number> = {}
    transactions
      .filter(t => t.amount < 0 && t.date && t.date >= activeStart && t.date <= activeEnd)
      .forEach(t => {
        const cat = t.category || 'Misc'
        totals[cat] = (totals[cat] || 0) + Math.abs(t.amount)
      })

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
        color:  colorMap[name] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, activeStart, activeEnd, categories])

  useChart(canvasRef, () => {
    if (!slices.length) return null
    const t = ChartTheme.read()
    return {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.name),
        datasets: [{
          data:             slices.map(s => s.amount),
          backgroundColor:  slices.map(s => `${s.color}cc`),
          borderColor:      slices.map(s => s.color),
          borderWidth:      1.5,
          hoverBorderWidth: 2,
          hoverOffset:      4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend:  { display: false },
          tooltip: ChartTheme.tooltip(t, { label: ctx => `  ${Formatters.currency(ctx.parsed)}` }),
        },
      },
    }
  }, [slices])

  const total = slices.reduce((sum, s) => sum + s.amount, 0)

  return (
    <Card>
      <CardHeader>
        <HStack className="items-center justify-between">
          <Heading level={3} className="text-sm font-semibold">Spending by Category</Heading>
          <Caption>{rangeLabel ?? 'This Month'}</Caption>
        </HStack>
      </CardHeader>
      <CardBody>
        {slices.length === 0 ? (
          <EmptyState
            icon="PieChart"
            title="No spending data"
            description="No expenses recorded for this period."
          />
        ) : (
          <VStack gap="gap-5">
            <div className="relative h-48 flex items-center justify-center">
              <canvas ref={canvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Caption>Total</Caption>
                <Text className="text-base font-bold font-mono text-fg">
                  {Formatters.currency(total)}
                </Text>
              </div>
            </div>
            <VStack gap="gap-1.5">
              {slices.map(s => {
                const pct = total > 0 ? ((s.amount / total) * 100).toFixed(1) : '0.0'
                return (
                  <HStack key={s.name} className="items-center justify-between">
                    <HStack gap="gap-2" className="items-center min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <Text className="text-xs text-muted truncate">{s.name}</Text>
                    </HStack>
                    <HStack gap="gap-3" className="items-center shrink-0">
                      <Caption>{pct}%</Caption>
                      <Text className="text-xs font-mono text-fg w-20 text-right">
                        {Formatters.currency(s.amount)}
                      </Text>
                    </HStack>
                  </HStack>
                )
              })}
            </VStack>
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
