'use client'

import { memo, useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StepAnalysisDto, LogLineDto, LoggingSource } from '@/lib/api-client'
import { StepLogLineData } from '@/lib/utils/analysis-transforms'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronDown,
  Calendar,
  FileText,
  User,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatDuration,
  formatTimestamp,
  isNegativeDuration,
} from '@/lib/utils/duration-utils'
import { formatDateTime } from '@/lib/utils/format-helpers'
import { getEventFromLogLine } from '@/lib/utils/logline-helpers'
import { useColorScheme } from '@/lib/hooks/useColorScheme'

// Threshold for when to use virtualization (avoid overhead for small lists)
const VIRTUALIZATION_THRESHOLD = 50
// Estimated height of each log line row in pixels
const LOG_LINE_ROW_HEIGHT = 32

interface AnalysisStepExpandedContentProps {
  step: StepAnalysisDto
  stepAnalysis?: StepAnalysisDto
  logLineData: StepLogLineData[]
}

/**
 * Reusable section header component for consistent styling
 */
interface SectionHeaderProps {
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

function SectionHeader({
  icon: Icon,
  children,
  className,
}: SectionHeaderProps) {
  return (
    <h4
      className={cn(
        'text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1',
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </h4>
  )
}

/**
 * Expanded content component for analysis step nodes
 * Shows step details, activity events, and grouped log lines
 */
export function AnalysisStepExpandedContent({
  step,
  stepAnalysis,
  logLineData,
}: AnalysisStepExpandedContentProps) {
  return (
    <div className="space-y-4">
      {/* Step Details */}
      <div>
        <SectionHeader>Details</SectionHeader>
        <p className="text-sm text-foreground">
          {step.details || 'No details provided'}
        </p>
      </div>

      {/* Actor Role */}
      {step.actorRoleTitle && (
        <div>
          <SectionHeader>Actor Role</SectionHeader>
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <User className="h-3 w-3" />
            {step.actorRoleTitle}
          </Badge>
        </div>
      )}

      {/* Step Timing Section */}
      {(step.firstLogTimestamp || step.stepDuration) && (
        <div>
          <SectionHeader icon={Clock} className="mb-2">
            Step Timing
          </SectionHeader>
          <div className="p-3 bg-muted/30 rounded-md space-y-2">
            {step.stepDuration && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">Duration:</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    isNegativeDuration(step.stepDuration) &&
                      'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  )}
                >
                  {formatDuration(step.stepDuration)}
                  {isNegativeDuration(step.stepDuration) && ' (concurrent)'}
                </Badge>
              </div>
            )}
            {step.firstLogTimestamp && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">
                  First Activity:
                </span>
                <span className="text-foreground">
                  {formatTimestamp(step.firstLogTimestamp)}
                </span>
              </div>
            )}
            {step.lastLogTimestamp && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">
                  Last Activity:
                </span>
                <span className="text-foreground">
                  {formatTimestamp(step.lastLogTimestamp)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Events Section */}
      <div>
        <SectionHeader icon={Calendar} className="mb-2">
          Activity Events ({step.matchingActivityEvents.length})
        </SectionHeader>
        {step.matchingActivityEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No matching activity events
          </p>
        ) : (
          <div className="space-y-2">
            {step.matchingActivityEvents.map((aeAnalysis) => (
              <div
                key={aeAnalysis.activityEvent.id}
                className="p-2 bg-muted/50 rounded-md border border-border"
              >
                <span className="text-sm font-medium">
                  {aeAnalysis.activityEvent.name}
                </span>
                {aeAnalysis.activityEvent.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {aeAnalysis.activityEvent.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Lines Section - Grouped by Activity Event, then by Log */}
      <div>
        <SectionHeader icon={FileText} className="mb-2">
          Matching Log Lines
        </SectionHeader>
        {logLineData.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No matching log lines
          </p>
        ) : (
          <div className="space-y-3">
            {logLineData.map((data) => (
              <ActivityEventLogSection key={data.activityEventId} data={data} />
            ))}
          </div>
        )}
      </div>

      {/* Post-Step Documentation */}
      {step.postStepDocumentation && (
        <div>
          <SectionHeader>Post-Step Documentation</SectionHeader>
          <p className="text-sm text-foreground">
            {step.postStepDocumentation}
          </p>
        </div>
      )}

      {/* Monitoring Requirements */}
      {step.monitoringRequirements && (
        <div>
          <SectionHeader>Monitoring Requirements</SectionHeader>
          <p className="text-sm text-foreground">
            {step.monitoringRequirements}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Collapsible section for log lines grouped by activity event
 * Uses shadcn Collapsible for accessibility and animations
 */
const ActivityEventLogSection = memo(function ActivityEventLogSection({
  data,
}: {
  data: StepLogLineData
}) {
  // Disable interaction if no log matches
  const isEmpty = data.logMatches.length === 0

  return (
    <Collapsible disabled={isEmpty}>
      <div
        className={cn(
          'border border-border rounded-lg overflow-hidden',
          isEmpty && 'opacity-60'
        )}
      >
        {/* Activity Event Header */}
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between p-2 bg-muted/30 transition-colors',
            !isEmpty && 'hover:bg-muted/50 cursor-pointer',
            isEmpty && 'cursor-default'
          )}
          disabled={isEmpty}
        >
          <div className="flex items-center gap-2 text-left">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
                '[&[data-state=closed]]:-rotate-90',
                isEmpty && 'invisible'
              )}
            />
            <span className="text-sm font-medium truncate">
              {data.activityEventName}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'text-xs shrink-0 ml-2',
              isEmpty && 'bg-muted text-muted-foreground'
            )}
          >
            {data.totalLogLines} line{data.totalLogLines !== 1 ? 's' : ''}
          </Badge>
        </CollapsibleTrigger>

        {/* Expanded Content - Log Groups */}
        <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="p-2 space-y-2 border-t border-border">
            {data.logMatches.map((logMatch) => (
              <LogMatchGroup key={logMatch.logId} logMatch={logMatch} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
})

/**
 * Collapsible group showing log lines from a single log source
 * Uses shadcn Collapsible for accessibility and animations
 * Uses virtualization for large lists to improve performance
 */
const LogMatchGroup = memo(function LogMatchGroup({
  logMatch,
}: {
  logMatch: {
    logId: string
    logName: string
    loggingSource: string
    matchingLogLines: LogLineDto[]
    matchCount: number
  }
}) {
  const { getLoggingSourceColor, getBadgeClasses } = useColorScheme()

  // Get color from centralized color scheme
  const sourceColor = getLoggingSourceColor(
    logMatch.loggingSource as LoggingSource
  )
  const badgeClasses = getBadgeClasses(sourceColor)

  // Disable if no log lines
  const isEmpty = logMatch.matchingLogLines.length === 0
  const useVirtualization =
    logMatch.matchingLogLines.length >= VIRTUALIZATION_THRESHOLD

  return (
    <Collapsible disabled={isEmpty}>
      <div
        className={cn(
          'border border-border/50 rounded-md overflow-hidden',
          isEmpty && 'opacity-60'
        )}
      >
        {/* Log Header */}
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between p-2 bg-background transition-colors',
            !isEmpty && 'hover:bg-muted/30 cursor-pointer',
            isEmpty && 'cursor-default'
          )}
          disabled={isEmpty}
        >
          <div className="flex items-center gap-2 text-left min-w-0">
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200',
                '[&[data-state=closed]]:-rotate-90',
                isEmpty && 'invisible'
              )}
            />
            <Badge
              variant="outline"
              className={cn('text-xs shrink-0', badgeClasses)}
            >
              {logMatch.loggingSource}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">
              {logMatch.logName}
            </span>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {logMatch.matchCount}
          </Badge>
        </CollapsibleTrigger>

        {/* Log Lines List */}
        <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="border-t border-border/50">
            {useVirtualization ? (
              <VirtualizedLogLineList logLines={logMatch.matchingLogLines} />
            ) : (
              <ScrollArea className="max-h-[150px]">
                <div className="p-2 space-y-1">
                  {logMatch.matchingLogLines.map((line, idx) => (
                    <LogLineRow key={idx} logLine={line} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
})

/**
 * Virtualized log line list for large datasets
 * Only renders visible items + buffer for smooth scrolling
 */
const VirtualizedLogLineList = memo(function VirtualizedLogLineList({
  logLines,
}: {
  logLines: LogLineDto[]
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: logLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LOG_LINE_ROW_HEIGHT,
    overscan: 5, // Render 5 items above/below viewport for smooth scrolling
  })

  return (
    <div ref={parentRef} className="max-h-[150px] overflow-auto p-2">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <LogLineRow logLine={logLines[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * Single log line display row
 * Memoized to prevent unnecessary re-renders in large lists
 */
const LogLineRow = memo(function LogLineRow({
  logLine,
}: {
  logLine: LogLineDto
}) {
  // Use centralized utilities for consistent formatting
  const eventName = getEventFromLogLine(logLine)
  const timestamp = logLine.date ? formatDateTime(logLine.date) : 'No timestamp'

  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded text-xs">
      <span className="text-muted-foreground shrink-0">{timestamp}</span>
      <span className="font-medium truncate">{eventName}</span>
      {logLine.actor && (
        <span className="text-muted-foreground truncate">
          by {logLine.actor}
        </span>
      )}
    </div>
  )
})
