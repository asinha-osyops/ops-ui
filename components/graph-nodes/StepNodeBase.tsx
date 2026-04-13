'use client'

import { memo, useCallback, ReactNode } from 'react'
import { Handle, Position } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GitBranch, GitMerge, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepNodeType, getNodeConfig } from './step-node-config'

export interface StepNodeBaseProps {
  // Core data
  stepId: string
  stepName: string
  details?: string

  // Visual config (from StepDto)
  nodeType: StepNodeType
  isFork?: boolean
  isJoin?: boolean

  // State
  isExpanded: boolean
  isSelected?: boolean

  // Optional display
  actorRoleTitle?: string | null

  // Render props for customization
  collapsedFooter?: ReactNode // e.g., event/log count badges
  expandedContent?: ReactNode // e.g., StepDetailCard or SOP details
}

/**
 * Shared base component for step nodes in ReactFlow graphs.
 * Provides consistent visual styling based on node type (START/STEP/END)
 * with fork/join indicators. Supports both collapsed and expanded views.
 *
 * Used by:
 * - SopStepNode (SOP graph view)
 * - StepNode (Analysis graph view)
 */
export const StepNodeBase = memo(
  ({
    stepName,
    details,
    nodeType,
    isFork,
    isJoin,
    isExpanded,
    isSelected,
    actorRoleTitle,
    collapsedFooter,
    expandedContent,
  }: StepNodeBaseProps) => {
    const config = getNodeConfig(nodeType)

    // Stop propagation on content clicks
    const handleContentClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
    }, [])

    // Stop wheel event propagation for scrolling
    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.stopPropagation()
    }, [])

    // Render node type icon
    const renderNodeTypeIcon = () => {
      if (!config.Icon) return null
      const IconComponent = config.Icon
      return <IconComponent className={cn('h-4 w-4', config.color)} />
    }

    // Render fork/join indicators
    const renderFlowIndicators = () => {
      const indicators = []

      if (isFork) {
        indicators.push(
          <Tooltip key="fork">
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <GitBranch className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Fork: Multiple outgoing paths
            </TooltipContent>
          </Tooltip>
        )
      }

      if (isJoin) {
        indicators.push(
          <Tooltip key="join">
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <GitMerge className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Join: Multiple incoming paths
            </TooltipContent>
          </Tooltip>
        )
      }

      return indicators.length > 0 ? (
        <div className="flex items-center gap-1">{indicators}</div>
      ) : null
    }

    // Expanded view - larger node with full details
    if (isExpanded) {
      return (
        <TooltipProvider>
          <div className="relative">
            <Handle
              type="target"
              position={Position.Left}
              className={cn('!w-3 !h-3', config.handleColor)}
              id="target"
            />

            <div
              className={cn(
                'w-[420px] bg-card border-2 rounded-lg shadow-lg',
                'ring-1 ring-offset-1 ring-offset-background',
                'transition-all duration-300 ease-in-out',
                config.borderColor,
                isSelected && 'ring-2 ring-primary'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-2">
                  {renderNodeTypeIcon()}
                  <span className="text-sm font-medium text-foreground truncate max-w-[280px]">
                    {stepName}
                  </span>
                  {renderFlowIndicators()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label="Close expanded view"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div
                className="nodrag nopan"
                onClick={handleContentClick}
                onWheelCapture={handleWheel}
              >
                <ScrollArea className="h-[440px]">
                  <div className="p-4">{expandedContent}</div>
                </ScrollArea>
              </div>
            </div>

            <Handle
              type="source"
              position={Position.Right}
              className={cn('!w-3 !h-3', config.handleColor)}
              id="source"
            />
          </div>
        </TooltipProvider>
      )
    }

    // Collapsed view - standard node
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'border-2 rounded-lg p-4 shadow-md',
                'transition-all duration-300 ease-in-out cursor-pointer w-[220px]',
                'hover:shadow-lg hover:scale-[1.02]',
                config.bgColor,
                config.borderColor,
                isSelected &&
                  'ring-2 ring-primary ring-offset-1 ring-offset-background'
              )}
            >
              <Handle
                type="target"
                position={Position.Left}
                className={cn('!w-3 !h-3', config.handleColor)}
                id="target"
              />

              {/* Header Row with Node Type */}
              <div className="flex items-center gap-2 mb-2">
                {renderNodeTypeIcon()}
                {renderFlowIndicators()}
              </div>

              {/* Step Name */}
              <div className="text-sm font-medium text-foreground mb-3 line-clamp-2">
                {stepName}
              </div>

              {/* Role Badge */}
              {actorRoleTitle && (
                <Badge variant="outline" className="text-xs mb-2">
                  {actorRoleTitle}
                </Badge>
              )}

              {/* Custom Footer (e.g., counts for analysis) */}
              {collapsedFooter}

              <Handle
                type="source"
                position={Position.Right}
                className={cn('!w-3 !h-3', config.handleColor)}
                id="source"
              />
            </div>
          </TooltipTrigger>
          {details && (
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm font-semibold mb-1">{stepName}</p>
              <p className="text-xs line-clamp-3">{details}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }
)

StepNodeBase.displayName = 'StepNodeBase'
