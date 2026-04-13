'use client'

import { ReactFlowProvider } from 'reactflow'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SopGraphNewContent } from './SopGraphNewContent'
import { useDagEditing } from '@/lib/hooks/useDagEditing'
import type { SopDto } from '@/lib/api-client'

function GraphErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 p-6 text-center bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <h3 className="font-semibold text-destructive text-sm">
          Graph Rendering Error
        </h3>
        {error instanceof Error && error.message && (
          <p className="text-xs text-muted-foreground">{error.message}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Try Again
      </Button>
    </div>
  )
}

interface SopGraphNewProps {
  sop: SopDto
  className?: string
  graphHeight?: string
  isEditable?: boolean
  onSopUpdate?: () => void
}

export function SopGraphNew({
  sop,
  className,
  graphHeight,
  isEditable = false,
  onSopUpdate,
}: SopGraphNewProps) {
  const editing = useDagEditing({
    sopId: sop.id,
    onSopUpdate,
  })

  if (!sop.steps || sop.steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
        No steps to display. Add steps to see the graph.
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={GraphErrorFallback}>
      <ReactFlowProvider>
        <SopGraphNewContent
          sop={sop}
          className={className}
          graphHeight={graphHeight}
          isEditable={isEditable}
          editing={editing}
        />
      </ReactFlowProvider>
    </ErrorBoundary>
  )
}
