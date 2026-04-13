'use client'

import { Alert, AlertTitle, AlertDescription } from './Alert'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import type { AlertState } from '@/lib/hooks/useActionAlert'

interface ActionAlertProps {
  alert: AlertState
  onClose: () => void
  renderDetails?: (details: any) => React.ReactNode
}

export function ActionAlert({
  alert,
  onClose,
  renderDetails,
}: ActionAlertProps) {
  if (!alert.show) return null

  const icons = {
    success: <CheckCircle2 className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
  }

  return (
    <Alert
      variant={
        alert.type === 'error' || alert.type === 'destructive'
          ? 'destructive'
          : 'default'
      }
      className={cn(
        'mb-6 relative',
        alert.type === 'destructive' &&
          'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
      )}
    >
      {icons[alert.type]}
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>
        <p>{alert.message}</p>
        {alert.details && renderDetails && (
          <div className="mt-3">{renderDetails(alert.details)}</div>
        )}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 md:top-3 md:right-3 h-6 w-6"
        onClick={onClose}
      >
        <X className="h-5 w-5 md:h-4 md:w-4" />
      </Button>
    </Alert>
  )
}
