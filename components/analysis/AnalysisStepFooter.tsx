'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Clock } from 'lucide-react'
import { formatDuration, DurationInput } from '@/lib/utils/duration-utils'

interface AnalysisStepFooterProps {
  eventCount: number
  logLineCount: number
  stepDuration?: DurationInput // Duration object or ISO-8601 string
}

/**
 * Footer component for collapsed analysis step nodes
 * Shows count badges for activity events, log lines, and step duration
 */
export function AnalysisStepFooter({
  eventCount,
  logLineCount,
  stepDuration,
}: AnalysisStepFooterProps) {
  const formattedDuration = stepDuration ? formatDuration(stepDuration) : null

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <Badge variant="secondary" className="text-xs flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {eventCount} event{eventCount !== 1 ? 's' : ''}
      </Badge>
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        <FileText className="h-3 w-3" />
        {logLineCount} line{logLineCount !== 1 ? 's' : ''}
      </Badge>
      {formattedDuration && formattedDuration !== 'N/A' && (
        <Badge
          variant="outline"
          className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
        >
          <Clock className="h-3 w-3" />
          {formattedDuration}
        </Badge>
      )}
    </div>
  )
}
