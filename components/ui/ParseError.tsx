import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, X } from 'lucide-react'

interface ParseErrorProps {
  message?: string
  className?: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ParseError({
  message = 'Failed to parse analysis content',
  className,
  onRetry,
  onDismiss,
}: ParseErrorProps) {
  const hasActions = onRetry || onDismiss

  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{message}</AlertTitle>
      {hasActions && (
        <AlertDescription>
          <div className="flex items-center gap-2 mt-1">
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
        </AlertDescription>
      )}
    </Alert>
  )
}
