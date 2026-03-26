import { memo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Brain } from 'lucide-react'
import type { StepDto } from '@/lib/api-client'

interface NodeHoverCardProps {
  step: StepDto
  x: number
  y: number
}

function NodeHoverCardComponent({ step, x, y }: NodeHoverCardProps) {
  return (
    <div
      className="absolute z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: x + 10,
        top: y,
        maxWidth: 340,
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
