'use client'

import { TraceSopStepsResponseDto } from '@/lib/api-client'
import { EmptyStateMessage } from '@/components/ui/EmptyStateMessage'
import { AnalysisGraphView } from './AnalysisGraphView'

interface TraceSopStepsResultsProps {
  results: TraceSopStepsResponseDto
}

export function TraceSopStepsResults({ results }: TraceSopStepsResultsProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-medium text-foreground">
          Trace Results: {results.sop.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click on a step to expand and view its details
        </p>
      </div>

      {results.stepAnalyses.length === 0 ? (
        <div className="p-6">
          <EmptyStateMessage message="No step traces found for this SOP." />
        </div>
      ) : (
        /* Graph View - uses shared DAG graph component */
        <div className="p-4">
          <AnalysisGraphView results={results} />
        </div>
      )}
    </div>
  )
}
