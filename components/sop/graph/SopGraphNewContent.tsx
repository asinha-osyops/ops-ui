'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ArrowDownUp, Pencil, PencilOff, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AccessibleGraphControls } from '@/components/graph-nodes/AccessibleGraphControls'
import { DagValidationPanel } from '@/components/sop/DagValidationPanel'
import { StartNode } from './nodes/StartNode'
import { StepNode } from './nodes/StepNode'
import { EndNode } from './nodes/EndNode'
import { NodeHoverCard } from './nodes/NodeHoverCard'
import { SopEdge } from './edges/SopEdge'
import { useSopGraphLayout } from './hooks/useSopGraphLayout'
import { useNodeHover } from './hooks/useNodeHover'
import type {
  SopDto,
  StepDto,
  StepNodeType,
  EdgeDto,
  DagValidationResultDto,
} from '@/lib/api-client'
import type { UseDagEditingReturn } from '@/lib/hooks/useDagEditing'
import {
  formatEdgeDuration,
  isDurationOverThreshold,
} from '@/lib/utils/duration-utils'
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
  sopEdge: SopEdge,
}

interface SopGraphNewContentProps {
  sop: SopDto
  className?: string
  graphHeight?: string
  isEditable?: boolean
  editing?: UseDagEditingReturn
}

export function SopGraphNewContent({
  sop,
  className,
  graphHeight = 'h-[900px]',
  isEditable = false,
  editing,
}: SopGraphNewContentProps) {
  const [direction, setDirection] = useState<LayoutDirection>('TB')
  const { hoveredNodeId, onNodeMouseEnter, onNodeMouseLeave } = useNodeHover()
  const graphContainerRef = useRef<HTMLDivElement>(null)

  // Edge deletion confirmation
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null)

  // Use editing's selectedNodeId when available, otherwise local state
  const selectedStepId = editing?.selectedNodeId ?? null

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

  // Add edge labels (transition durations when available) with color-coding
  const labeledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const dto = edgeDtoMap.get(edge.id)
        const duration = dto?.transitionDuration
        const label = duration ? formatEdgeDuration(duration) : undefined
        const isOverThreshold = duration
          ? isDurationOverThreshold(duration)
          : false
        return {
          ...edge,
          type: 'sopEdge',
          data: { ...edge.data, label, isOverThreshold },
        }
      }),
    [edges, edgeDtoMap]
  )

  // Hover card position (set via mouse events)
  const [hoverPos, setHoverPos] = useState<{
    x: number
    y: number
  } | null>(null)

  const hoveredStep = useMemo(() => {
    if (!hoveredNodeId) return null
    const node = nodes.find((n) => n.id === hoveredNodeId)
    return node?.data.step ?? null
  }, [hoveredNodeId, nodes])

  // Node click — handles both selection and edge creation
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (editing?.isEditMode && editing.edgeCreationState !== 'idle') {
        // During edge creation, clicks select source/target
        editing.handleNodeClickForEdge(node.id)
      } else if (editing) {
        // Toggle selection
        editing.selectNode(editing.selectedNodeId === node.id ? null : node.id)
      }
    },
    [editing]
  )

  // Edge click — delete edge in edit mode
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      if (editing?.isEditMode) {
        setEdgeToDelete(edge.id)
      }
    },
    [editing?.isEditMode]
  )

  const handleConfirmDeleteEdge = useCallback(async () => {
    if (edgeToDelete && editing) {
      await editing.deleteEdge(edgeToDelete)
      setEdgeToDelete(null)
    }
  }, [edgeToDelete, editing])

  // Suppress hover card when a node is selected or during edge creation
  const suppressHover =
    !!selectedStepId || editing?.edgeCreationState !== 'idle'
  const showHoverCard = !suppressHover && hoveredStep && hoverPos

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

  // Keyboard navigation: Escape to deselect/cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing?.edgeCreationState !== 'idle') {
          editing?.cancelEdgeCreation()
        } else if (selectedStepId) {
          editing?.selectNode(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editing, selectedStepId])

  // Stats
  const stepCount = sop.steps.length
  const edgeCount = sop.edges.length
  const forkCount = sop.steps.filter((s) => s.isFork).length
  const joinCount = sop.steps.filter((s) => s.isJoin).length

  // Find selected step for node type change
  const selectedStep = useMemo(() => {
    if (!selectedStepId) return null
    return sop.steps.find((s) => s.id === selectedStepId) ?? null
  }, [selectedStepId, sop.steps])

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
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

        <div className="flex items-center gap-2">
          {/* Edit mode controls */}
          {isEditable && editing && (
            <>
              {editing.isEditMode && (
                <>
                  {/* Edge creation controls */}
                  {editing.edgeCreationState === 'idle' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={editing.startEdgeCreation}
                      disabled={editing.isLoading}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Edge
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs animate-pulse"
                      >
                        {editing.edgeCreationState === 'selecting-source'
                          ? 'Select source node...'
                          : 'Select target node...'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={editing.cancelEdgeCreation}
                        className="gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Node type selector when a node is selected */}
                  {selectedStep && editing.edgeCreationState === 'idle' && (
                    <Select
                      value={selectedStep.nodeType}
                      onValueChange={(value) =>
                        editing.changeNodeType(
                          selectedStep.id,
                          value as StepNodeType
                        )
                      }
                      disabled={editing.isChangingNodeType}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="START">Start</SelectItem>
                        <SelectItem value="STEP">Step</SelectItem>
                        <SelectItem value="END">End</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}

              {/* Edit mode toggle */}
              <Button
                variant={editing.isEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={editing.toggleEditMode}
                className="gap-1.5"
              >
                {editing.isEditMode ? (
                  <>
                    <PencilOff className="h-3.5 w-3.5" />
                    Done
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </>
                )}
              </Button>
            </>
          )}

          {/* Loading indicator */}
          {editing?.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

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
          onEdgeClick={onEdgeClick}
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
          edgesUpdatable={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--muted-foreground) / 0.15)"
          />
          <AccessibleGraphControls position="bottom-right" />
        </ReactFlow>

        {/* Hover card — suppressed when a node is selected */}
        {showHoverCard && (
          <NodeHoverCard step={hoveredStep} x={hoverPos.x} y={hoverPos.y} />
        )}
      </div>

      {/* Validation panel — shows when editable */}
      {isEditable && (
        <DagValidationPanel
          validation={
            editing?.validation ?? {
              valid: sop.dagValid ?? true,
              errors: sop.validationErrors ?? [],
              warnings: sop.validationWarnings ?? [],
            }
          }
          steps={sop.steps}
          onNodeClick={(nodeId) => editing?.selectNode(nodeId)}
          className="mt-3"
        />
      )}

      {/* Edge deletion confirmation */}
      <ConfirmDialog
        open={edgeToDelete !== null}
        onOpenChange={(open) => !open && setEdgeToDelete(null)}
        title="Delete Edge"
        description="Are you sure you want to delete this edge? This may affect the graph validation."
        confirmText="Delete"
        onConfirm={handleConfirmDeleteEdge}
        destructive={true}
      />
    </div>
  )
}
