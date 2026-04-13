'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { RoleTitle } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'

export interface EmployeeNodeData {
  employeeId: string
  name: string
  email?: string
  roleTitle?: RoleTitle
  hasDirectReports: boolean
  hasManager: boolean
  isExpandedDown: boolean
  isExpandedUp: boolean
  isLoading: boolean
  onExpandDown: (employeeId: string) => void
  onExpandUp: (employeeId: string) => void
}

export const EmployeeNode = memo(({ data }: NodeProps<EmployeeNodeData>) => {
  const handleExpandUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (!data.isLoading && data.hasManager && !data.isExpandedUp) {
        data.onExpandUp(data.employeeId)
      }
    },
    [data]
  )

  const handleExpandDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (!data.isLoading && data.hasDirectReports && !data.isExpandedDown) {
        data.onExpandDown(data.employeeId)
      }
    },
    [data]
  )

  const showUpButton = data.hasManager && !data.isExpandedUp
  const showDownButton = data.hasDirectReports && !data.isExpandedDown

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        {/* Up button for manager chain - inside node bounds */}
        <div className="h-7 flex items-center justify-center">
          {showUpButton && (
            <button
              type="button"
              className="nodrag nopan h-6 w-6 rounded-full bg-card border border-chart-green-2 hover:bg-chart-green-2/10 flex items-center justify-center cursor-pointer disabled:opacity-50"
              style={{ pointerEvents: 'auto' }}
              onClickCapture={handleExpandUp}
              onMouseDownCapture={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
              disabled={data.isLoading}
            >
              {data.isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-chart-green-2" />
              ) : (
                <ChevronUp className="h-3 w-3 text-chart-green-2" />
              )}
            </button>
          )}
        </div>

        {/* Main node card */}
        <div className="relative">
          {/* Target handle for incoming edge from manager */}
          <Handle
            type="target"
            position={Position.Top}
            className="!bg-chart-green-2 !w-3 !h-3"
            id="target"
          />

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'bg-chart-green-2/10 border-2 rounded-lg p-3 shadow-md',
                  'transition-all duration-300 ease-in-out w-[180px]',
                  'border-chart-green-2/50 hover:border-chart-green-2 hover:shadow-lg'
                )}
              >
                {/* Employee Name */}
                <div className="text-sm font-medium text-foreground mb-2 line-clamp-1 text-center">
                  {data.name}
                </div>

                {/* Role Title Badge */}
                {data.roleTitle && (
                  <div className="flex justify-center">
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal max-w-full truncate"
                    >
                      {formatEnumTitleCase(data.roleTitle || '')}
                    </Badge>
                  </div>
                )}

                {/* Loading indicator overlay */}
                {data.isLoading && (
                  <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-chart-green-2" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {data.email && (
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm font-semibold mb-1">{data.name}</p>
                <p className="text-xs text-muted-foreground">{data.email}</p>
                {data.roleTitle && (
                  <p className="text-xs mt-1">
                    {formatEnumTitleCase(data.roleTitle || '')}
                  </p>
                )}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Source handle for outgoing edges to reports */}
          <Handle
            type="source"
            position={Position.Bottom}
            className="!bg-chart-green-2 !w-3 !h-3"
            id="source"
          />
        </div>

        {/* Down button for direct reports - inside node bounds */}
        <div className="h-7 flex items-center justify-center">
          {showDownButton && (
            <button
              type="button"
              className="nodrag nopan h-6 w-6 rounded-full bg-card border border-chart-green-2 hover:bg-chart-green-2/10 flex items-center justify-center cursor-pointer disabled:opacity-50"
              style={{ pointerEvents: 'auto' }}
              onClickCapture={handleExpandDown}
              onMouseDownCapture={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
              disabled={data.isLoading}
            >
              {data.isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-chart-green-2" />
              ) : (
                <ChevronDown className="h-3 w-3 text-chart-green-2" />
              )}
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
})

EmployeeNode.displayName = 'EmployeeNode'
