import { useRef, useEffect, type RefObject, type DependencyList } from 'react'
import { Chart, type ChartConfiguration } from 'chart.js'

/**
 * Chart.js lifecycle hook — creates/destroys on deps change.
 *
 * Usage:
 *   const canvasRef = useRef<HTMLCanvasElement>(null)
 *   useChart(canvasRef, () => {
 *     if (!data.length) return null   // return null to skip creation
 *     return { type: 'line', data: {...}, options: {...} }
 *   }, [data])
 */
export function useChart(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  buildConfig: () => ChartConfiguration | null,
  deps: DependencyList
) {
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

    const cfg = buildConfig()
    if (!cfg) return

    chartRef.current = new Chart(canvasRef.current, cfg)

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return chartRef
}
