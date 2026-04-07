import { memo } from 'react'
import { getSmoothStepPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow'

function SolidEdgeComponent({
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

      {/* Edge label (transition duration) */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute bg-card border border-border rounded-md px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm pointer-events-none"
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

export const AnimatedEdge = memo(SolidEdgeComponent)
