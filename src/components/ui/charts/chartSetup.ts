/**
 * chartSetup.ts — Run Chart.js registration and global defaults once.
 * Imported by src/main.tsx before the app renders.
 */
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

Chart.defaults.color = '#9090b0'
Chart.defaults.borderColor = '#2a2a3d'
Chart.defaults.backgroundColor = 'transparent'
