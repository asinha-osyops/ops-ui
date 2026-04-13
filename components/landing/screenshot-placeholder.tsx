'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ScreenshotPlaceholderProps {
  className?: string
  label?: string
  src?: string
  alt?: string
}

export function ScreenshotPlaceholder({
  className,
  label = '[Screenshot]',
  src,
  alt = 'Product screenshot',
}: ScreenshotPlaceholderProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex flex-col items-center relative z-[101]">
      <div
        className={cn(
          'w-full border border-foreground bg-white rounded-lg flex items-center justify-center overflow-hidden isolate mix-blend-normal',
          className
        )}
        style={{
          maxWidth: 'var(--bento-card-width)',
          minHeight: 'var(--bento-card-height)',
        }}
      >
        {src && !imageError ? (
          // Using native img to avoid Next.js Image optimization issues
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-muted-foreground text-sm">{label}</span>
        )}
      </div>
      <span className="text-muted-foreground text-xs mt-2">
        [Early product preview]
      </span>
    </div>
  )
}
