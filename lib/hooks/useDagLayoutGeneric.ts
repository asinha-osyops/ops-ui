import { useMemo, ReactNode } from 'react'
import dagre from 'dagre'
import { Node, Edge, MarkerType } from 'reactflow'
import { StepNodeType, EdgeDto } from '@/lib/api-client'
import {
  formatEdgeDuration,
  isNegativeDuration,
  isDurationOverThreshold,
  DurationInput,
} from '@/lib/utils/duration-utils'

// Layout direction
export type LayoutDirection = 'LR' | 'TB'

// Options for DAG layout
export interface UseDagLayoutGenericOptions {
  /** Layout direction: LR (left-right) or TB (top-bottom) */
  direction?: LayoutDirection
  /** Width of each node */
  nodeWidth?: number
  /** Height of each node */
  nodeHeight?: number
  /** Spacing between ranks (levels) */
  rankSep?: number
  /** Spacing between nodes in the same rank */
  nodeSep?: number
  /** Edge type for ReactFlow */
  edgeType?: string
}

// Generic node data type for DAG step nodes
// Includes render functions to avoid recreating nodeTypes object
export interface DagStepNodeData<TStep> {
  stepId: string
  step: TStep
  isExpanded: boolean
  isSelected: boolean
  // Render functions passed through data to avoid nodeTypes recreation
  stepAccessors: StepAccessors<TStep>
  renderCollapsedFooter?: (step: TStep) => ReactNode
  renderExpandedContent?: (step: TStep) => ReactNode
}

// Return type for the hook
export interface UseDagLayoutGenericReturn<TStep> {
  nodes: Node<DagStepNodeData<TStep>>[]
  edges: Edge[]
  graphWidth: number
  graphHeight: number
}

// Step accessor functions for extracting data from generic step types
export interface StepAccessors<TStep> {
  getId: (step: TStep) => string
  getName: (step: TStep) => string
  getDetails: (step: TStep) => string | null | undefined
  getNodeType: (step: TStep) => StepNodeType
  getIsFork: (step: TStep) => boolean
  getIsJoin: (step: TStep) => boolean
  getActorRoleTitle?: (step: TStep) => string | null | undefined
}

// Edge accessor functions for extracting data from generic edge types
export interface EdgeAccessors<TEdge> {
  getId: (edge: TEdge) => string
  getFrom: (edge: TEdge) => string
  getTo: (edge: TEdge) => string
  getTransitionDuration?: (edge: TEdge) => DurationInput
}

// Default options
const DEFAULT_OPTIONS: Required<UseDagLayoutGenericOptions> = {
  direction: 'LR',
  nodeWidth: 220,
  nodeHeight: 100,
  rankSep: 150, // Space between ranks (horizontal spacing for LR layout)
  nodeSep: 200, // Space between parallel nodes (vertical spacing for LR layout)
  edgeType: 'smoothstep',
}

// Options for DAG layout hook including render functions
export interface UseDagLayoutGenericParams<TStep, TEdge> {
  steps: TStep[]
  edges: TEdge[]
  stepAccessors: StepAccessors<TStep>
  edgeAccessors: EdgeAccessors<TEdge>
  selectedStepId?: string | null
  expandedStepId?: string | null
  nodeType?: string
  options?: UseDagLayoutGenericOptions
  // Render functions to pass through node data
  renderCollapsedFooter?: (step: TStep) => ReactNode
  renderExpandedContent?: (step: TStep) => ReactNode
}

/**
 * Generic hook to calculate DAG layout for steps using dagre
 * Works with any step/edge types via accessor functions
 *
 * Performance optimization: Layout calculation is separated from selection state
 * so that selecting a node doesn't trigger a full dagre recalculation.
 *
 * @param params - Layout parameters including steps, edges, accessors, and render functions
 * @returns Nodes and edges formatted for ReactFlow
 */
export function useDagLayoutGeneric<TStep, TEdge>(
  steps: TStep[],
  edges: TEdge[],
  stepAccessors: StepAccessors<TStep>,
  edgeAccessors: EdgeAccessors<TEdge>,
  selectedStepId: string | null = null,
  expandedStepId: string | null = null,
  nodeType: string = 'dagStepNode',
  options: UseDagLayoutGenericOptions = {},
  renderCollapsedFooter?: (step: TStep) => ReactNode,
  renderExpandedContent?: (step: TStep) => ReactNode
): UseDagLayoutGenericReturn<TStep> {
  // Merge options with defaults
  const mergedOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  )

  // PHASE 1: Calculate dagre layout positions
  // This only runs when steps, edges, or expandedStepId changes (not on selection)
  const { layoutData, flowEdges, graphWidth, graphHeight } = useMemo(() => {
    // Handle empty graph
    if (steps.length === 0) {
      return { layoutData: [], flowEdges: [], graphWidth: 0, graphHeight: 0 }
    }

    // Create a new dagre graph
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    // Configure the graph layout
    dagreGraph.setGraph({
      rankdir: mergedOptions.direction,
      ranksep: mergedOptions.rankSep,
      nodesep: mergedOptions.nodeSep,
      marginx: 50,
      marginy: 50,
    })

    // Add nodes to the dagre graph
    steps.forEach((step) => {
      const stepId = stepAccessors.getId(step)
      // Use larger dimensions if this node is expanded
      const isExpanded = stepId === expandedStepId
      const width = isExpanded ? 420 : mergedOptions.nodeWidth
      const height = isExpanded ? 540 : mergedOptions.nodeHeight

      dagreGraph.setNode(stepId, { width, height })
    })

    // Add edges to the dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edgeAccessors.getFrom(edge), edgeAccessors.getTo(edge))
    })

    // Run the layout algorithm
    dagre.layout(dagreGraph)

    // Extract positioned node data (without selection state)
    const layoutData = steps.map((step) => {
      const stepId = stepAccessors.getId(step)
      const nodeWithPosition = dagreGraph.node(stepId)
      const isExpanded = stepId === expandedStepId
      const width = isExpanded ? 420 : mergedOptions.nodeWidth
      const height = isExpanded ? 540 : mergedOptions.nodeHeight

      return {
        stepId,
        step,
        isExpanded,
        position: {
          // dagre returns center position, adjust for top-left corner
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      }
    })

    // Extract edges with ReactFlow formatting
    const flowEdges: Edge[] = edges.map((edge) => {
      // Get transition duration for edge label
      const transitionDuration = edgeAccessors.getTransitionDuration?.(edge)
      const durationLabel = transitionDuration
        ? formatEdgeDuration(transitionDuration)
        : undefined
      const isNegative = transitionDuration
        ? isNegativeDuration(transitionDuration)
        : false
      const isOverThreshold = transitionDuration
        ? isDurationOverThreshold(transitionDuration)
        : false

      // Determine edge label colors based on duration threshold
      // Uses CSS custom properties for theme support
      // - Red: >= 1 week (warning)
      // - Green: < 1 week (ok)
      // Note: Negative durations (concurrent) use same coloring + warning icon prefix
      let labelBgFill: string
      let labelBgStroke: string

      if (isOverThreshold) {
        // >= 1 week - red (warning) - using CSS variables for theme support
        labelBgFill = 'hsl(var(--destructive) / 0.15)'
        labelBgStroke = 'hsl(var(--destructive))'
      } else {
        // < 1 week - green (ok) - using green color tokens
        labelBgFill = 'hsl(142 76% 36% / 0.15)' // green-600 with opacity
        labelBgStroke = 'hsl(142 76% 36%)' // green-600
      }

      // For negative durations, add warning icon prefix
      const labelText =
        isNegative && durationLabel ? `⚠️ ${durationLabel}` : durationLabel

      return {
        id: edgeAccessors.getId(edge),
        source: edgeAccessors.getFrom(edge),
        target: edgeAccessors.getTo(edge),
        type: mergedOptions.edgeType,
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
        },
        // Add label if transition duration is available
        // Colors indicate duration status: green (ok), red (warning)
        // Negative durations show warning icon prefix
        ...(labelText && {
          label: labelText,
          labelStyle: {
            fontSize: 12,
            fontWeight: 500,
            fill: 'hsl(var(--foreground))', // Standard text color (theme-aware)
          },
          labelBgStyle: {
            fill: labelBgFill,
            fillOpacity: 1, // Opacity is built into the color
            stroke: labelBgStroke,
            strokeWidth: 1,
          },
          labelBgPadding: [4, 8] as [number, number],
          labelBgBorderRadius: 6,
        }),
      }
    })

    // Calculate graph dimensions
    const graphData = dagreGraph.graph()
    const graphWidth = (graphData.width || 0) + 100
    const graphHeight = (graphData.height || 0) + 100

    return { layoutData, flowEdges, graphWidth, graphHeight }
  }, [
    steps,
    edges,
    stepAccessors,
    edgeAccessors,
    expandedStepId,
    mergedOptions,
  ])

  // PHASE 2: Apply selection state and render functions to positioned nodes
  // This runs when selection changes but doesn't recalculate dagre positions
  const nodes = useMemo((): Node<DagStepNodeData<TStep>>[] => {
    return layoutData.map(({ stepId, step, isExpanded, position }) => ({
      id: stepId,
      type: nodeType,
      position,
      data: {
        stepId,
        step,
        isExpanded,
        isSelected: stepId === selectedStepId,
        // Pass render functions and accessors through data to avoid nodeTypes recreation
        stepAccessors,
        renderCollapsedFooter,
        renderExpandedContent,
      },
    }))
  }, [
    layoutData,
    selectedStepId,
    nodeType,
    stepAccessors,
    renderCollapsedFooter,
    renderExpandedContent,
  ])

  return { nodes, edges: flowEdges, graphWidth, graphHeight }
}

/**
 * Helper function to get incoming edges for a step
 */
export function getIncomingEdges(stepId: string, edges: EdgeDto[]): EdgeDto[] {
  return edges.filter((edge) => edge.to === stepId)
}

/**
 * Helper function to get outgoing edges for a step
 */
export function getOutgoingEdges(stepId: string, edges: EdgeDto[]): EdgeDto[] {
  return edges.filter((edge) => edge.from === stepId)
}

/**
 * Helper function to get predecessor step IDs
 */
export function getPredecessorIds(stepId: string, edges: EdgeDto[]): string[] {
  return getIncomingEdges(stepId, edges).map((edge) => edge.from)
}

/**
 * Helper function to get successor step IDs
 */
export function getSuccessorIds(stepId: string, edges: EdgeDto[]): string[] {
  return getOutgoingEdges(stepId, edges).map((edge) => edge.to)
}
