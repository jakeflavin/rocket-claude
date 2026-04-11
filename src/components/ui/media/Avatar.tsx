import { useState } from 'react'

interface AvatarProps {
  name?:      string
  src?:       string
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP: Record<string, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ name = '', src = '', size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const [imgErrored, setImgErrored] = useState(false)

  return (
    <div
      className={`rounded-full bg-[#1a1a26] border border-[#2a2a3d] flex items-center justify-center overflow-hidden shrink-0 ${SIZE_MAP[size] ?? SIZE_MAP.md} ${className}`}
    >
      {src && !imgErrored ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgErrored(true)}
        />
      ) : (
        <span className="font-medium text-[#9090b0]">{initials}</span>
      )}
    </div>
  )
}
