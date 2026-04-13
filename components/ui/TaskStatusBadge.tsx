import { ProcessingStatus } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
  status?: ProcessingStatus
  showIcon?: boolean
  className?: string
  isLevel2?: boolean // Apply red/destructive styling for Level 2 tasks
}

function getStatusVariant(
  status?: ProcessingStatus,
  isLevel2?: boolean
): 'outline' | 'secondary' | 'default' | 'destructive' {
  // Level 2 tasks always use destructive (red) variant
  if (isLevel2) {
    return 'destructive'
  }

  switch (status) {
    case ProcessingStatus.COMPLETED:
      return 'default'
    case ProcessingStatus.FAILED:
      return 'destructive'
    case ProcessingStatus.PROCESSING:
      return 'secondary'
    case ProcessingStatus.PENDING:
    default:
      return 'outline'
  }
}

function StatusIcon({ status }: { status?: ProcessingStatus }) {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return <Check className="h-3 w-3 mr-1" />
    case ProcessingStatus.FAILED:
      return <X className="h-3 w-3 mr-1" />
    case ProcessingStatus.PROCESSING:
      return <Loader2 className="h-3 w-3 mr-1 animate-spin" />
    case ProcessingStatus.PENDING:
    default:
      return <Clock className="h-3 w-3 mr-1" />
  }
}

/**
 * Reusable component for displaying task processing status.
 * Shows a badge with an optional icon indicating the current status.
 *
 * @param isLevel2 - If true, applies red/destructive styling for Level 2 (LogLine matching) tasks
 */
export function TaskStatusBadge({
  status,
  showIcon = true,
  className,
  isLevel2,
}: TaskStatusBadgeProps) {
  const variant = getStatusVariant(status, isLevel2)

  return (
    <Badge variant={variant} className={cn('flex items-center', className)}>
      {showIcon && <StatusIcon status={status} />}
      {status || 'PENDING'}
    </Badge>
  )
}
