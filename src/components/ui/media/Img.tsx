import { useState } from 'react'
import type { ImgHTMLAttributes, ReactNode } from 'react'

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: ReactNode
}

export function Img({ src, alt = '', className = '', fallback = null, ...props }: ImgProps) {
  const [errored, setErrored] = useState(false)
  if (errored && fallback) return <>{fallback}</>
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  )
}
