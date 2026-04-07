'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ArrowDownUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccessibleGraphControls } from '@/components/graph-nodes/AccessibleGraphControls'
import { StartNode } from './nodes/StartNode'
import { StepNode } from './nodes/StepNode'
import { EndNode } from './nodes/EndNode'
import { NodeHoverCard } from './nodes/NodeHoverCard'
import { AnimatedEdge } from './edges/AnimatedEdge'
import { useSopGraphLayout } from './hooks/useSopGraphLayout'
import { useNodeHover } from './hooks/useNodeHover'
import type { SopDto, StepDto, EdgeDto } from '@/lib/api-client'
import { formatEdgeDuration } from '@/lib/utils/duration-utils'
import type { LayoutDirection } from '@/lib/hooks/useDagLayoutGeneric'
import { REACTFLOW_FIT_VIEW_OPTIONS } from '@/lib/constants/graph-config'

// Module-level constants to avoid ReactFlow nodeTypes recreation warning
const nodeTypes: NodeTypes = {
  sopGraphNewNode: ({ data, selected, ...rest }: any) => {
    const step = data.step as StepDto
    switch (step.nodeType) {
      case 'START':
        return <StartNode data={data} selected={selected} {...rest} />
      case 'END':
        return <EndNode data={data} selected={selected} {...rest} />
      default:
        return <StepNode data={data} selected={selected} {...rest} />
    }
  },
}

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
}

interface SopGraphNewContentProps {
  sop: SopDto
  className?: string
  graphHeight?: string
}

export function SopGraphNewContent({
  sop,
  className,
  graphHeight = 'h-[600px]',
}: SopGraphNewContentProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [direction, setDirection] = useState<LayoutDirection>('TB')
  const { hoveredNodeId, onNodeMouseEnter, onNodeMouseLeave } = useNodeHover()
  const graphContainerRef = useRef<HTMLDivElement>(null)

  const { nodes, edges } = useSopGraphLayout(
    sop.steps,
    sop.edges,
    selectedStepId,
    direction
  )

  // Look up original EdgeDto by ID for transition durations
  const edgeDtoMap = useMemo(() => {
    const map = new Map<string, EdgeDto>()
    for (const e of sop.edges) map.set(e.id, e)
    return map
  }, [sop.edges])

  // Add edge labels (transition durations when available)
  const labeledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const dto = edgeDtoMap.get(edge.id)
        const duration = dto?.transitionDuration
        const label = duration ? formatEdgeDuration(duration) : undefined
        return {
          ...edge,
          type: 'animated',
          data: { ...edge.data, label },
        }
      }),
    [edges, edgeDtoMap]
  )

  // Hover card position (set via mouse events, not render-time ref access)
  const [hoverPos, setHoverPos] = useState<{
    x: number
    y: number
  } | null>(null)

  const hoveredStep = useMemo(() => {
    if (!hoveredNodeId) return null
    const node = nodes.find((n) => n.id === hoveredNodeId)
    return node?.data.step ?? null
  }, [hoveredNodeId, nodes])

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedStepId((prev) => (prev === node.id ? null : node.id))
  }, [])

  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (event, node) => {
      onNodeMouseEnter(node.id)
      if (graphContainerRef.current) {
        const rect = graphContainerRef.current.getBoundingClientRect()
        const target = (event.currentTarget || event.target) as HTMLElement
        const nodeRect = target.getBoundingClientRect()
        setHoverPos({
          x: nodeRect.right - rect.left + 10,
          y: nodeRect.top - rect.top,
        })
      }
    },
    [onNodeMouseEnter]
  )

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    onNodeMouseLeave()
    setHoverPos(null)
  }, [onNodeMouseLeave])

  const toggleDirection = useCallback(() => {
    setDirection((d) => (d === 'TB' ? 'LR' : 'TB'))
  }, [])

  // Stats
  const stepCount = sop.steps.length
  const edgeCount = sop.edges.length
  const forkCount = sop.steps.filter((s) => s.isFork).length
  const joinCount = sop.steps.filter((s) => s.isJoin).length

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {stepCount} step{stepCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {edgeCount} edge{edgeCount !== 1 ? 's' : ''}
          </Badge>
          {forkCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {forkCount} fork{forkCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {joinCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {joinCount} join{joinCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDirection}
          className="gap-1.5"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          {direction === 'TB' ? 'Top-Down' : 'Left-Right'}
        </Button>
      </div>

      {/* Graph */}
      <div
        ref={graphContainerRef}
        className={`${graphHeight} rounded-lg border border-border bg-background overflow-hidden relative`}
      >
        <ReactFlow
          nodes={nodes}
          edges={labeledEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          fitView
          fitViewOptions={REACTFLOW_FIT_VIEW_OPTIONS}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--muted-foreground) / 0.15)"
          />
          <AccessibleGraphControls position="bottom-right" />
        </ReactFlow>

        {/* Hover card positioned relative to graph container */}
        {hoveredStep && hoverPos && (
          <NodeHoverCard step={hoveredStep} x={hoverPos.x} y={hoverPos.y} />
        )}
      </div>
    </div>
  )
}
