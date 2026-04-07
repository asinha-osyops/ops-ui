import { memo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Brain, Activity, Clock, FileText } from 'lucide-react'
import type { StepDto } from '@/lib/api-client'

/** Analysis fields that may be present on enriched steps */
interface AnalysisFields {
  matchingActivityEvents?: {
    activityEvent: { name: string; description?: string }
    matchingLogCount: number
  }[]
  firstLogTimestamp?: string | null
  lastLogTimestamp?: string | null
  stepDuration?: number | null
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface NodeHoverCardProps {
  step: StepDto
  x: number
  y: number
}

function NodeHoverCardComponent({ step, x, y }: NodeHoverCardProps) {
  const analysis = step as unknown as AnalysisFields
  const activityEvents = analysis.matchingActivityEvents ?? []
  const totalLogLines = activityEvents.reduce(
    (sum, ae) => sum + (ae.matchingLogCount || 0),
    0
  )

  return (
    <div
      className="absolute z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: x,
        top: y,
        maxWidth: 360,
      }}
    >
      <Card className="shadow-lg border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {step.name}
            </h4>
            {step.actorRoleTitle && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {step.actorRoleTitle}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2.5">
          {/* Details */}
          {step.details && (
            <p className="text-xs text-muted-foreground line-clamp-6">
              {step.details}
            </p>
          )}

          {/* Employees */}
          {step.matchingEmployeesForRoleTitle &&
            step.matchingEmployeesForRoleTitle.length > 0 && (
              <>
                <Separator />
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    {step.matchingEmployeesForRoleTitle
                      .slice(0, 5)
                      .map((e) => e.name)
                      .join(', ')}
                    {step.matchingEmployeesForRoleTitle.length > 5 && (
                      <span className="text-muted-foreground/60">
                        {' '}
                        +{step.matchingEmployeesForRoleTitle.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

          {/* Analysis: Activity Events & Logs */}
          {activityEvents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {activityEvents.length} Activity Event
                    {activityEvents.length !== 1 ? 's' : ''}
                    {totalLogLines > 0 && (
                      <span className="normal-case tracking-normal font-normal">
                        {' '}
                        &middot; {totalLogLines} log line
                        {totalLogLines !== 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                </div>
                {activityEvents.slice(0, 3).map((ae, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 pl-5 text-xs text-muted-foreground"
                  >
                    <FileText className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                    <span className="line-clamp-1">
                      {ae.activityEvent.name}
                    </span>
                    {ae.matchingLogCount > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-3.5 shrink-0 ml-auto"
                      >
                        {ae.matchingLogCount}
                      </Badge>
                    )}
                  </div>
                ))}
                {activityEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground/60 pl-5">
                    +{activityEvents.length - 3} more
                  </p>
                )}
              </div>
            </>
          )}

          {/* Analysis: Duration & timestamps */}
          {(analysis.stepDuration || analysis.firstLogTimestamp) && (
            <>
              <Separator />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {analysis.stepDuration && analysis.stepDuration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(analysis.stepDuration)}
                  </span>
                )}
                {analysis.firstLogTimestamp && (
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatTimestamp(analysis.firstLogTimestamp)}
                    {analysis.lastLogTimestamp &&
                      analysis.lastLogTimestamp !==
                        analysis.firstLogTimestamp &&
                      ` → ${formatTimestamp(analysis.lastLogTimestamp)}`}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Post-step docs */}
          {step.postStepDocumentation && (
            <>
              <Separator />
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Post-Step Documentation
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {step.postStepDocumentation}
                </p>
              </div>
            </>
          )}

          {/* AI-inferred context */}
          {step.inferredEventCategories &&
            step.inferredEventCategories.length > 0 && (
              <>
                <Separator />
                <div className="flex items-start gap-2">
                  <Brain className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {step.inferredEventCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

export const NodeHoverCard = memo(NodeHoverCardComponent)
