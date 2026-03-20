'use client'

import { useMemo, useCallback, useState, ReactNode, KeyboardEvent } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  NodeTypes,
  ReactFlowProvider,
  EdgeMouseHandler,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

import { EdgeDto } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import {
  useDagLayoutGeneric,
  DagStepNodeData,
  StepAccessors,
  EdgeAccessors,
  UseDagLayoutGenericOptions,
} from '@/lib/hooks/useDagLayoutGeneric'
import { StepNodeBase } from './StepNodeBase'
import { AccessibleGraphControls } from './AccessibleGraphControls'
import { Badge } from '@/components/ui/badge'
import { FullscreenGraphModal } from '@/components/ui/FullscreenGraphModal'
import { cn } from '@/lib/utils'
import {
  REACTFLOW_FIT_VIEW_OPTIONS,
  REACTFLOW_DEFAULT_VIEWPORT,
  REACTFLOW_PRO_OPTIONS,
  REACTFLOW_BACKGROUND_STYLE,
} from '@/lib/constants/graph-config'

/**
 * Error fallback component for graph rendering failures
 * Provides a reset button to attempt recovery
 */
function GraphErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="space-y-2">
        <h3 className="font-semibold text-destructive">
          Graph Rendering Error
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Failed to render the graph visualization. This may be due to invalid
          data or a rendering issue.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <p className="text-xs text-destructive/70 font-mono bg-destructive/10 p-2 rounded">
            {error.message}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

// Static generic node component - reads accessors and render functions from data
// This avoids recreating nodeTypes object which causes React Flow warnings
function GenericDagNode({ data }: { data: DagStepNodeData<unknown> }) {
  const {
    step,
    isExpanded,
    isSelected,
    stepAccessors,
    renderCollapsedFooter,
    renderExpandedContent,
  } = data

  return (
    <StepNodeBase
      stepId={stepAccessors.getId(step)}
      stepName={stepAccessors.getName(step)}
      details={stepAccessors.getDetails(step) || undefined}
      nodeType={stepAccessors.getNodeType(step)}
      isFork={stepAccessors.getIsFork(step)}
      isJoin={stepAccessors.getIsJoin(step)}
      isExpanded={isExpanded}
      isSelected={isSelected}
      actorRoleTitle={stepAccessors.getActorRoleTitle?.(step)}
      collapsedFooter={renderCollapsedFooter?.(step)}
      expandedContent={renderExpandedContent?.(step)}
    />
  )
}

// Static nodeTypes object - defined at module level to avoid recreation
const nodeTypes: NodeTypes = {
  dagStepNode: GenericDagNode,
}

// Props for the DagGraphView component
export interface DagGraphViewProps<TStep, TEdge = EdgeDto> {
  // Data
  steps: TStep[]
  edges: TEdge[]

  // Step data accessors
  stepAccessors: StepAccessors<TStep>

  // Edge data accessors (optional, defaults work for EdgeDto)
  edgeAccessors?: EdgeAccessors<TEdge>

  // Render props for customization
  renderCollapsedFooter?: (step: TStep) => ReactNode
  renderExpandedContent?: (step: TStep) => ReactNode

  // State (controlled)
  selectedStepId?: string | null
  expandedStepId?: string | null
  onStepSelect?: (stepId: string | null) => void
  onStepExpand?: (stepId: string | null) => void

  // Edit mode support (optional, for SOP editor)
  editMode?: boolean
  onEdgeClick?: (edgeId: string, edge: Edge) => void
  edgeCreationState?: 'idle' | 'selecting-source' | 'selecting-target'
  sourceNodeId?: string | null

  // Layout options
  layoutOptions?: UseDagLayoutGenericOptions

  // Styling
  className?: string
  showStats?: boolean
  emptyMessage?: string
  /** Height classes for the graph container. Supports responsive Tailwind classes. */
  graphHeight?: string
  /** Title for fullscreen modal header on mobile */
  title?: string
}

// Default edge accessors for EdgeDto
const defaultEdgeAccessors: EdgeAccessors<EdgeDto> = {
  getId: (edge) => edge.id,
  getFrom: (edge) => edge.from,
  getTo: (edge) => edge.to,
  getTransitionDuration: (edge) => edge.transitionDuration,
}

// Inner component with state management
function DagGraphViewContent<TStep, TEdge = EdgeDto>({
  steps,
  edges,
  stepAccessors,
  edgeAccessors = defaultEdgeAccessors as EdgeAccessors<TEdge>,
  renderCollapsedFooter,
  renderExpandedContent,
  selectedStepId: controlledSelectedId,
  expandedStepId: controlledExpandedId,
  onStepSelect,
  onStepExpand,
  editMode = false,
  onEdgeClick,
  edgeCreationState = 'idle',
  sourceNodeId,
  layoutOptions,
  className,
  showStats = true,
  emptyMessage = 'No steps defined. Add steps to visualize the workflow.',
  graphHeight = 'h-[350px] md:h-[450px] lg:h-[500px]',
  title = 'Graph View',
}: DagGraphViewProps<TStep, TEdge>) {
  // Internal state (used when uncontrolled)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  )
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(
    null
  )

  // Use controlled or internal state
  const selectedStepId = controlledSelectedId ?? internalSelectedId
  const expandedStepId = controlledExpandedId ?? internalExpandedId

  const handleSelectStep = useCallback(
    (stepId: string | null) => {
      if (onStepSelect) {
        onStepSelect(stepId)
      } else {
        setInternalSelectedId(stepId)
      }
    },
    [onStepSelect]
  )

  const handleExpandStep = useCallback(
    (stepId: string | null) => {
      if (onStepExpand) {
        onStepExpand(stepId)
      } else {
        setInternalExpandedId(stepId)
      }
    },
    [onStepExpand]
  )

  // Calculate layout - pass render functions through node data to avoid nodeTypes recreation
  const { nodes, edges: flowEdges } = useDagLayoutGeneric(
    steps,
    edges,
    stepAccessors,
    edgeAccessors,
    selectedStepId,
    expandedStepId,
    'dagStepNode',
    layoutOptions,
    renderCollapsedFooter,
    renderExpandedContent
  )

  // Calculate stats
  const stats = useMemo(() => {
    const startNodes = steps.filter(
      (s) => stepAccessors.getNodeType(s) === 'START'
    ).length
    const endNodes = steps.filter(
      (s) => stepAccessors.getNodeType(s) === 'END'
    ).length
    const forks = steps.filter((s) => stepAccessors.getIsFork(s)).length
    const joins = steps.filter((s) => stepAccessors.getIsJoin(s)).length
    return {
      startNodes,
      endNodes,
      forks,
      joins,
      totalSteps: steps.length,
      totalEdges: edges.length,
    }
  }, [steps, edges, stepAccessors])

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<DagStepNodeData<TStep>>) => {
      const stepId = node.data.stepId

      if (expandedStepId === stepId) {
        // Click on expanded node - collapse it
        handleExpandStep(null)
        handleSelectStep(null)
      } else {
        // Click on collapsed node - expand it
        handleExpandStep(stepId)
        handleSelectStep(stepId)
      }
    },
    [expandedStepId, handleExpandStep, handleSelectStep]
  )

  // Handle edge click (for edit mode)
  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      if (!editMode || !onEdgeClick) return
      onEdgeClick(edge.id, edge)
    },
    [editMode, onEdgeClick]
  )

  // Handle pane click - deselect and collapse
  const handlePaneClick = useCallback(() => {
    handleExpandStep(null)
    handleSelectStep(null)
  }, [handleExpandStep, handleSelectStep])

  // Get ReactFlow instance for keyboard navigation
  const { getNodes } = useReactFlow()

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Escape key - deselect and collapse
      if (event.key === 'Escape') {
        handleExpandStep(null)
        handleSelectStep(null)
        return
      }

      // Only handle Enter/Space when a node is focused
      if (event.key === 'Enter' || event.key === ' ') {
        // Check if a node is focused by looking at document.activeElement
        const activeElement = document.activeElement
        if (activeElement?.classList.contains('react-flow__node')) {
          event.preventDefault()
          const nodeId = activeElement.getAttribute('data-id')
          if (nodeId) {
            if (expandedStepId === nodeId) {
              // Collapse if already expanded
              handleExpandStep(null)
              handleSelectStep(null)
            } else {
              // Expand the focused node
              handleExpandStep(nodeId)
              handleSelectStep(nodeId)
            }
          }
        }
      }
    },
    [expandedStepId, handleExpandStep, handleSelectStep, getNodes]
  )

  // Style nodes for edge creation mode
  const styledNodes = useMemo(() => {
    if (edgeCreationState === 'idle') {
      return nodes
    }

    return nodes.map((node) => {
      const isSource = node.data.stepId === sourceNodeId
      const isValidTarget =
        edgeCreationState === 'selecting-target' &&
        node.data.stepId !== sourceNodeId

      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: isSource
            ? '0 0 0 3px var(--primary), 0 0 10px var(--primary)'
            : undefined,
          opacity:
            edgeCreationState === 'selecting-target' &&
            !isValidTarget &&
            !isSource
              ? 0.4
              : 1,
          cursor: isValidTarget
            ? 'crosshair'
            : edgeCreationState === 'selecting-source'
              ? 'pointer'
              : 'default',
        },
      }
    })
  }, [nodes, edgeCreationState, sourceNodeId])

  // Style edges for edit mode
  const styledEdges = useMemo(() => {
    return flowEdges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        cursor: editMode ? 'pointer' : 'default',
        stroke: editMode ? 'var(--destructive)' : undefined,
      },
    }))
  }, [flowEdges, editMode])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Stats bar (optional) */}
      {showStats && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{stats.totalSteps} steps</Badge>
          <Badge variant="outline">{stats.totalEdges} edges</Badge>
          {stats.forks > 0 && (
            <Badge variant="secondary">
              {stats.forks} fork{stats.forks !== 1 ? 's' : ''}
            </Badge>
          )}
          {stats.joins > 0 && (
            <Badge variant="secondary">
              {stats.joins} join{stats.joins !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      {/* Graph - wrapped in FullscreenGraphModal for mobile */}
      <FullscreenGraphModal
        title={title}
        desktopClassName={graphHeight}
        hasContent={steps.length > 0}
      >
        <ErrorBoundary FallbackComponent={GraphErrorFallback}>
          <div
            className={cn(
              'w-full h-full border border-border rounded-lg overflow-hidden bg-background'
            )}
          >
            {steps.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <ReactFlow
                nodes={styledNodes}
                edges={styledEdges}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onPaneClick={handlePaneClick}
                onKeyDown={handleKeyDown}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={REACTFLOW_FIT_VIEW_OPTIONS}
                minZoom={0.3}
                maxZoom={1.5}
                defaultViewport={REACTFLOW_DEFAULT_VIEWPORT}
                proOptions={REACTFLOW_PRO_OPTIONS}
                // Keyboard accessibility
                nodesFocusable={true}
                edgesFocusable={false}
                // Touch optimizations for mobile
                panOnScroll={false}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
              >
                <Background
                  color="var(--muted-foreground)"
                  gap={30}
                  size={2}
                  variant={BackgroundVariant.Dots}
                  style={REACTFLOW_BACKGROUND_STYLE}
                />
                <AccessibleGraphControls />
              </ReactFlow>
            )}
          </div>
        </ErrorBoundary>
      </FullscreenGraphModal>
    </div>
  )
}

// Wrap with ReactFlowProvider
export function DagGraphView<TStep, TEdge = EdgeDto>(
  props: DagGraphViewProps<TStep, TEdge>
) {
  return (
    <ReactFlowProvider>
      <DagGraphViewContent {...props} />
    </ReactFlowProvider>
  )
}

// Re-export types for convenience
export type { StepAccessors, EdgeAccessors, DagStepNodeData }
