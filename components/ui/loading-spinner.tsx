'use client'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-12',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className
      )}
    >
      <Spinner className={sizeClasses[size]} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
