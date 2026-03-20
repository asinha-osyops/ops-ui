import { cn } from '@/lib/utils'

interface EmptyStateMessageProps {
  message: string
  className?: string
}

/**
 * Consistent empty state message component.
 * Used when a list or section has no items to display.
 *
 * @example
 * <EmptyStateMessage message="No items found." />
 * <EmptyStateMessage message="No matching activity events found for this step." />
 */
export function EmptyStateMessage({
  message,
  className,
}: EmptyStateMessageProps) {
  return (
    <p className={cn('text-sm text-muted-foreground italic', className)}>
      {message}
    </p>
  )
}
