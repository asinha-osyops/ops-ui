import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { CircleDot, GitBranch, GitMerge, Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { DagStepNodeData } from '@/lib/hooks/useDagLayoutGeneric'
import type { StepDto } from '@/lib/api-client'

/** Extended step fields available from trace/analysis data */
interface AnalysisFields {
  matchingActivityEvents?: {
    activityEvent: { name: string }
    matchingLogCount: number
  }[]
  firstLogTimestamp?: string | null
  lastLogTimestamp?: string | null
  stepDuration?: number | null
}

function formatDurationShort(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function StepNodeComponent({
  data,
  selected,
}: NodeProps<DagStepNodeData<StepDto>>) {
  const step = data.step
  const analysis = step as unknown as AnalysisFields

  const totalLogLines =
    analysis.matchingActivityEvents?.reduce(
      (sum, ae) => sum + (ae.matchingLogCount || 0),
      0
    ) ?? 0
  const activityEventCount = analysis.matchingActivityEvents?.length ?? 0
  const hasAnalysis = activityEventCount > 0 || analysis.stepDuration

  return (
    <div
      className={cn(
        'group relative bg-orange-50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-800 border-l-4',
        'rounded-lg shadow-sm',
        'transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        step.isFork
          ? 'border-l-blue-500 dark:border-l-blue-400'
          : step.isJoin
            ? 'border-l-purple-500 dark:border-l-purple-400'
            : 'border-l-orange-500',
        selected && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
      )}
      style={{ width: 260 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-orange-500 !border-none"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <CircleDot className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
          {step.name}
        </p>
        {step.isFork && (
          <span className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0">
            <GitBranch className="w-2.5 h-2.5" />
            Fork
          </span>
        )}
        {step.isJoin && (
          <span className="flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full shrink-0">
            <GitMerge className="w-2.5 h-2.5" />
            Join
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        {step.details && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
            {step.details}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {step.actorRoleTitle && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {step.actorRoleTitle}
            </Badge>
          )}
          {step.matchingEmployeesForRoleTitle &&
            step.matchingEmployeesForRoleTitle.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {step.matchingEmployeesForRoleTitle.length} employee
                {step.matchingEmployeesForRoleTitle.length !== 1 ? 's' : ''}
              </span>
            )}
        </div>

        {/* Analysis row — only when trace data is present */}
        {hasAnalysis && (
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border">
            {activityEventCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Activity className="w-3 h-3" />
                {activityEventCount} event{activityEventCount !== 1 ? 's' : ''}
                {totalLogLines > 0 && (
                  <span className="text-muted-foreground/60">
                    ({totalLogLines} log{totalLogLines !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
            )}
            {analysis.stepDuration && analysis.stepDuration > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                <Clock className="w-3 h-3" />
                {formatDurationShort(analysis.stepDuration)}
              </span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-orange-500 !border-none"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)
