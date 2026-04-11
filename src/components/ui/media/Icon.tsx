import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

interface IconProps extends LucideProps {
  name: string
}

export function Icon({ name, size = 16, className = '', color, strokeWidth = 2, ...props }: IconProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name]
  if (!IconComponent) {
    console.warn(`[Icon] Unknown Lucide icon: "${name}"`)
    return null
  }
  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    />
  )
}
