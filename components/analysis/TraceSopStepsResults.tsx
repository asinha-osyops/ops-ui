'use client'

import { TraceSopStepsResponseDto } from '@/lib/api-client'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AnalysisGraphView } from './AnalysisGraphView'

interface TraceSopStepsResultsProps {
  results: TraceSopStepsResponseDto
}

export function TraceSopStepsResults({ results }: TraceSopStepsResultsProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">
          Trace Results: {results.sop.name}
        </CardTitle>
        <CardDescription>
          Click on a step to expand and view its details
        </CardDescription>
      </CardHeader>

      {results.stepAnalyses.length === 0 ? (
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No step traces found</EmptyTitle>
              <EmptyDescription>
                No step traces were found for this SOP.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      ) : (
        <CardContent className="p-4">
          <AnalysisGraphView results={results} />
        </CardContent>
      )}
    </Card>
  )
}
