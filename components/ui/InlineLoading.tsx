import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface InlineLoadingProps {
  message?: string
  className?: string
}

export function InlineLoading({
  message = 'Loading...',
  className,
}: InlineLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className
      )}
    >
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
