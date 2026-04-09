'use client'

import { useMemo, useCallback, useState } from 'react'
import { TraceSopStepsResponseDto, StepAnalysisDto } from '@/lib/api-client'
import {
  DagGraphView,
  StepAccessors,
} from '@/components/graph-nodes/DagGraphView'
import {
  transformToGraphFormat,
  extractLogLineData,
  getStepAnalysisById,
  StepLogLineData,
} from '@/lib/utils/analysis-transforms'
import { DurationInput } from '@/lib/utils/duration-utils'
import { AnalysisStepFooter } from './AnalysisStepFooter'
import { AnalysisStepExpandedContent } from './AnalysisStepExpandedContent'

// Step accessors for StepAnalysisDto (flat structure)
const analysisStepAccessors: StepAccessors<StepAnalysisDto> = {
  getId: (step) => step.id,
  getName: (step) => step.name,
  getDetails: (step) => step.details,
  getNodeType: (step) => step.nodeType,
  getIsFork: (step) => step.isFork,
  getIsJoin: (step) => step.isJoin,
  getActorRoleTitle: (step) => step.actorRoleTitle,
}

interface AnalysisGraphViewProps {
  results: TraceSopStepsResponseDto
  className?: string
}

export function AnalysisGraphView({
  results,
  className,
}: AnalysisGraphViewProps) {
  // State for step selection
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)

  // Transform response to graph format (SopAnalysisDto)
  const sopAnalysis = useMemo(() => {
    return transformToGraphFormat(results)
  }, [results])

  // Extract log line data for all steps
  const logLineDataMap = useMemo(() => {
    return extractLogLineData(results.stepAnalyses)
  }, [results.stepAnalyses])

  // Get step analysis by ID (for expanded content)
  const getStepAnalysis = useCallback(
    (stepId: string): StepAnalysisDto | undefined => {
      return getStepAnalysisById(results, stepId)
    },
    [results]
  )

  // Get log line data for a step
  const getLogLineDataForStep = useCallback(
    (stepId: string): StepLogLineData[] => {
      return logLineDataMap.get(stepId) || []
    },
    [logLineDataMap]
  )

  // Calculate totals for a step
  const getStepTotals = useCallback(
    (
      stepId: string
    ): {
      eventCount: number
      logLineCount: number
      stepDuration?: DurationInput
    } => {
      const stepAnalysis = getStepAnalysis(stepId)
      if (!stepAnalysis) {
        return { eventCount: 0, logLineCount: 0 }
      }

      const eventCount = stepAnalysis.matchingActivityEvents.length
      const logLineData = getLogLineDataForStep(stepId)
      const logLineCount = logLineData.reduce(
        (sum, d) => sum + d.totalLogLines,
        0
      )

      return {
        eventCount,
        logLineCount,
        stepDuration: stepAnalysis.stepDuration,
      }
    },
    [getStepAnalysis, getLogLineDataForStep]
  )

  // Render collapsed footer (badges with counts)
  const renderCollapsedFooter = useCallback(
    (step: StepAnalysisDto) => {
      const { eventCount, logLineCount, stepDuration } = getStepTotals(step.id)

      return (
        <AnalysisStepFooter
          eventCount={eventCount}
          logLineCount={logLineCount}
          stepDuration={stepDuration}
        />
      )
    },
    [getStepTotals]
  )

  // Render expanded content
  const renderExpandedContent = useCallback(
    (step: StepAnalysisDto) => {
      const stepAnalysis = getStepAnalysis(step.id)
      const logLineData = getLogLineDataForStep(step.id)

      return (
        <AnalysisStepExpandedContent
          step={step}
          stepAnalysis={stepAnalysis}
          logLineData={logLineData}
        />
      )
    },
    [getStepAnalysis, getLogLineDataForStep]
  )

  // Handle step select/expand
  const handleStepSelect = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId)
  }, [])

  const handleStepExpand = useCallback((stepId: string | null) => {
    setExpandedStepId(stepId)
  }, [])

  return (
    <DagGraphView
      steps={sopAnalysis.steps}
      edges={sopAnalysis.edges}
      stepAccessors={analysisStepAccessors}
      renderCollapsedFooter={renderCollapsedFooter}
      renderExpandedContent={renderExpandedContent}
      selectedStepId={selectedStepId}
      expandedStepId={expandedStepId}
      onStepSelect={handleStepSelect}
      onStepExpand={handleStepExpand}
      showStats={true}
      emptyMessage="No step analyses found for this SOP."
      graphHeight="h-[900px]"
      title="SOP Analysis Results"
      className={className}
    />
  )
}
