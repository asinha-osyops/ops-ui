'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'UP' | 'DOWN' | undefined
  loading?: boolean
  className?: string
}

export function StatusBadge({ status, loading, className }: StatusBadgeProps) {
  if (loading) {
    return (
      <Badge variant="secondary" className={cn('text-xs gap-1', className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking
      </Badge>
    )
  }

  if (status === 'UP') {
    return (
      <Badge
        className={cn(
          'bg-green-500/20 text-green-700 dark:text-green-400 text-xs gap-1',
          className
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        UP
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'bg-red-500/20 text-red-700 dark:text-red-400 text-xs gap-1',
        className
      )}
    >
      <XCircle className="h-3 w-3" />
      DOWN
    </Badge>
  )
}
