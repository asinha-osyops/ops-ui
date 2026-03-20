import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, X } from 'lucide-react'

interface ParseErrorProps {
  message?: string
  className?: string
  onRetry?: () => void
  onDismiss?: () => void
}

/**
 * Consistent error display component for parse/analysis failures.
 * Uses destructive styling to indicate an error state.
 * Optionally includes retry and dismiss action buttons.
 *
 * @example
 * <ParseError />
 * <ParseError message="Failed to load data" onRetry={() => refetch()} />
 * <ParseError message="Error" onRetry={handleRetry} onDismiss={handleDismiss} />
 */
export function ParseError({
  message = 'Failed to parse analysis content',
  className,
  onRetry,
  onDismiss,
}: ParseErrorProps) {
  const hasActions = onRetry || onDismiss

  return (
    <div
      className={cn(
        'text-sm text-destructive bg-destructive/10 rounded p-3',
        hasActions && 'flex items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {hasActions && (
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
