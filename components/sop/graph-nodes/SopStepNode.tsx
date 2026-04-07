'use client'

import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { StepDto } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { DetailField } from '@/components/ui/DetailField'
import { Separator } from '@/components/ui/separator'
import { StepNodeBase } from '@/components/graph-nodes/StepNodeBase'

export interface SopStepNodeData {
  stepId: string
  step: StepDto
  isExpanded: boolean
  isSelected: boolean
}

/**
 * SOP-specific expanded content showing step details,
 * actor role, matching employees, and documentation.
 */
export function SopExpandedContent({ step }: { step: StepDto }) {
  return (
    <div className="space-y-4">
      {/* Details */}
      <DetailField
        label="Details"
        value={step.details || 'No details provided'}
      />

      {/* Actor Role */}
      {step.actorRoleTitle && (
        <DetailField
          label="Actor Role"
          value={<Badge variant="outline">{step.actorRoleTitle}</Badge>}
        />
      )}

      {/* Matching Employees */}
      {step.matchingEmployeesForRoleTitle &&
        step.matchingEmployeesForRoleTitle.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              Suggested Employees
            </h4>
            <div className="flex flex-wrap gap-1">
              {step.matchingEmployeesForRoleTitle.map((emp) => (
                <Badge key={emp.id} variant="secondary" className="text-xs">
                  {emp.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {/* Post-Step Documentation */}
      {step.postStepDocumentation && (
        <DetailField
          label="Post-Step Documentation"
          value={step.postStepDocumentation}
        />
      )}

      {/* Monitoring Requirements */}
      {step.monitoringRequirements && (
        <DetailField
          label="Monitoring Requirements"
          value={step.monitoringRequirements}
        />
      )}

      {/* Inferred Fields (AI-detected from step text) */}
      {(step.inferredEventCategories?.length ||
        step.inferredResourceType ||
        step.inferredResourceTitle) && (
        <>
          <Separator className="my-3" />
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              AI-Inferred Context
            </h4>
            <div className="space-y-2">
              {step.inferredEventCategories &&
                step.inferredEventCategories.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Event Categories:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.inferredEventCategories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {step.inferredResourceType && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Resource Type:
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {step.inferredResourceType}
                  </Badge>
                </div>
              )}
              {step.inferredResourceTitle && (
                <div>
                  <span className="text-xs text-muted-foreground">
                    Resource Title:
                  </span>
                  <p className="text-sm text-foreground mt-0.5">
                    {step.inferredResourceTitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * SOP Step Node for ReactFlow graph view.
 * Uses shared StepNodeBase for consistent visual styling.
 */
export const SopStepNode = memo(({ data }: NodeProps<SopStepNodeData>) => {
  const { step, isExpanded, isSelected } = data

  return (
    <StepNodeBase
      stepId={data.stepId}
      stepName={step.name}
      details={step.details}
      nodeType={step.nodeType || 'STEP'}
      isFork={step.isFork}
      isJoin={step.isJoin}
      isExpanded={isExpanded}
      isSelected={isSelected}
      actorRoleTitle={step.actorRoleTitle}
      expandedContent={<SopExpandedContent step={step} />}
    />
  )
})

SopStepNode.displayName = 'SopStepNode'
