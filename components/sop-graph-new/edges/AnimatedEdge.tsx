import { memo } from 'react'
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from 'reactflow'

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
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
      {/* Base path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeOpacity={0.3}
        className="text-muted-foreground transition-all duration-200"
        markerEnd={markerEnd}
      />

      {/* Animated dash overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.6}
        strokeDasharray="8 4"
        className="text-muted-foreground edge-flow-animation"
      />

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute bg-card border border-border rounded-full px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm pointer-events-none"
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

export const AnimatedEdge = memo(AnimatedEdgeComponent)
