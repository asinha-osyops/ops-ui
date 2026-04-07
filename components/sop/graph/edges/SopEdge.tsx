import { memo } from 'react'
import { getSmoothStepPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow'
import { cn } from '@/lib/utils'

function SopEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const label = data?.label as string | undefined
  const isOverThreshold = data?.isOverThreshold as boolean | undefined

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-muted-foreground transition-all duration-200"
        markerEnd={markerEnd}
      />

      {/* Edge label (transition duration) with color-coding */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'absolute rounded-md px-2 py-0.5 text-[10px] shadow-sm pointer-events-none border',
              isOverThreshold
                ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-card border-border text-muted-foreground'
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const SopEdge = memo(SopEdgeComponent)
