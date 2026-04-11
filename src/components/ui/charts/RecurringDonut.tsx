import { useRef } from 'react'
import type { ChartSlice } from './ChartHelpers'
import { Card } from '../data-display/Card'
import { CardBody } from '../data-display/Card'
import { HStack } from '../layout/HStack'
import { VStack } from '../layout/VStack'
import { Text } from '../typography/Text'
import { Caption } from '../typography/Caption'
import { useChart } from './useChart'
import { ChartTheme } from './ChartTheme'
import { Formatters } from '../../../utils/formatters'

interface RecurringDonutProps {
  slices?:        ChartSlice[]
  centerLabel?:   string
  tooltipSuffix?: string
}

export function RecurringDonut({ slices = [], centerLabel = 'Total', tooltipSuffix = '' }: RecurringDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useChart(canvasRef, () => {
    if (!slices.length) return null
    const t = ChartTheme.read()
    return {
      type: 'doughnut',
      data: {
        labels: slices.map(s => s.label),
        datasets: [{
          data:            slices.map(s => s.amount),
          backgroundColor: slices.map(s => `${s.color}cc`),
          borderColor:     slices.map(s => s.color),
          borderWidth:     1.5,
          hoverOffset:     4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend:  { display: false },
          tooltip: ChartTheme.tooltip(t, {
            label: ctx => `  ${Formatters.currency(ctx.parsed)}${tooltipSuffix}`,
          }),
        },
      },
    }
  }, [slices])

  const total = slices.reduce((sum, s) => sum + s.amount, 0)

  return (
    <Card>
      <CardBody>
        <VStack gap="gap-6">
          <div className="relative h-64 flex items-center justify-center">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Caption>{centerLabel}</Caption>
              <Text className="text-lg font-bold font-mono text-fg">
                {Formatters.currency(total)}
                {tooltipSuffix && (
                  <span className="text-sm font-normal text-muted">{tooltipSuffix}</span>
                )}
              </Text>
            </div>
          </div>
          <VStack gap="gap-2">
            {slices.map(s => {
              const pct = total > 0 ? ((s.amount / total) * 100).toFixed(1) : '0.0'
              return (
                <HStack key={s.label} className="justify-between">
                  <HStack gap="gap-2" className="items-center min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <Text className="text-xs text-muted truncate">{s.label}</Text>
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
      </CardBody>
    </Card>
  )
}
