import { cn } from '@/lib/utils'
import { ParseError } from '@/components/ui/ParseError'

interface AnalysisResultCardProps<T> {
  analysis: T | null
  children: React.ReactNode
  className?: string
  errorMessage?: string
  onRetry?: () => void
}

/**
 * Wrapper component for analysis result displays.
 * Handles null analysis state with consistent error display.
 * Provides consistent styling for analysis content.
 *
 * @example
 * <AnalysisResultCard analysis={sopAnalysis}>
 *   <SopAnalysisContent analysis={sopAnalysis} />
 * </AnalysisResultCard>
 */
export function AnalysisResultCard<T>({
  analysis,
  children,
  className,
  errorMessage = 'Failed to parse analysis content',
  onRetry,
}: AnalysisResultCardProps<T>) {
  if (!analysis) {
    return <ParseError message={errorMessage} onRetry={onRetry} />
  }

  return (
    <div className={cn('bg-secondary/50 rounded-lg p-4', className)}>
      {children}
    </div>
  )
}
