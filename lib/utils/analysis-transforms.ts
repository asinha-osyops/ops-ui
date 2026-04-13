/**
 * Utility functions for transforming analysis data for graph display
 */

import {
  TraceSopStepsResponseDto,
  StepAnalysisDto,
  ActivityEventAnalysisDto,
  SopAnalysisDto,
  LogMatchDto,
  LogLineDto,
  LoggingSource,
} from '@/lib/api-client'
import { ANALYSIS_CONSTANTS, formatLogIdForDisplay } from './analysis-constants'

// Re-export calculateTotalLogLines from format-helpers as the canonical function
export { calculateTotalLogLines } from './format-helpers'

/**
 * Simplified activity event info for display
 */
interface ActivityEventInfo {
  id: string
  name: string
  description: string | null
}

/**
 * Extract activity event info from ActivityEventAnalysisDto
 */
function getActivityEventInfo(ae: ActivityEventAnalysisDto): ActivityEventInfo {
  return {
    id: ae.activityEvent.id,
    name: ae.activityEvent.name,
    description: ae.activityEvent.description ?? null,
  }
}

/**
 * Transform TraceSopStepsResponseDto to SopAnalysisDto format for graph display
 * StepAnalysisDto is already flat, so minimal transformation needed
 */
export function transformToGraphFormat(
  response: TraceSopStepsResponseDto
): SopAnalysisDto {
  return {
    id: response.sop.id,
    companyId: response.sop.companyId,
    companyName: response.sop.companyName,
    name: response.sop.name,
    basicDescription: response.sop.basicDescription,
    steps: response.stepAnalyses,
    edges: response.edges || response.sop.edges || [],
  }
}

/**
 * Aggregated log line data for a step
 * Used for displaying counts and detailed log line lists
 */
export interface StepLogLineData {
  stepId: string
  activityEventId: string
  activityEventName: string
  logMatches: LogMatchDto[]
  totalLogLines: number
}

/**
 * Extract log line data from step analyses
 * Groups log lines by activity event for display
 */
export function extractLogLineData(
  stepAnalyses: StepAnalysisDto[]
): Map<string, StepLogLineData[]> {
  const result = new Map<string, StepLogLineData[]>()

  stepAnalyses.forEach((stepAnalysis) => {
    const stepId = stepAnalysis.id
    const logLineDataList: StepLogLineData[] = []

    ;(stepAnalysis.matchingActivityEvents || []).forEach(
      (ae: ActivityEventAnalysisDto) => {
        const logMatches = ae.logLineAnalysis?.matchingLogs || []
        const totalLogLines = logMatches.reduce(
          (sum, m) => sum + m.matchCount,
          0
        )
        const eventInfo = getActivityEventInfo(ae)

        if (logMatches.length > 0) {
          logLineDataList.push({
            stepId,
            activityEventId: eventInfo.id,
            activityEventName: eventInfo.name,
            logMatches,
            totalLogLines,
          })
        }
      }
    )

    result.set(stepId, logLineDataList)
  })

  return result
}

/**
 * Get step analysis by ID from response
 */
export function getStepAnalysisById(
  response: TraceSopStepsResponseDto,
  stepId: string
): StepAnalysisDto | undefined {
  return response.stepAnalyses.find((sa) => sa.id === stepId)
}
