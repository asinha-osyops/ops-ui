'use client'

import { useEffect, useMemo, useCallback, KeyboardEvent } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeTypes,
  ReactFlowProvider,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

import { EmployeeNode, EmployeeNodeData } from './graph-nodes/EmployeeNode'
import { AccessibleGraphControls } from '@/components/graph-nodes/AccessibleGraphControls'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useOrgChartData } from './hooks/useOrgChartData'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { FullscreenGraphModal } from '@/components/ui/FullscreenGraphModal'
import {
  REACTFLOW_FIT_VIEW_OPTIONS,
  REACTFLOW_DEFAULT_VIEWPORT,
  REACTFLOW_PRO_OPTIONS,
  REACTFLOW_BACKGROUND_STYLE,
} from '@/lib/constants/graph-config'

/**
 * Error fallback component for org chart rendering failures
 */
function OrgChartErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="space-y-2">
        <h3 className="font-semibold text-destructive">
          Org Chart Rendering Error
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Failed to render the organization chart. This may be due to invalid
          data or a rendering issue.
        </p>
        {process.env.NODE_ENV === 'development' &&
          error instanceof Error &&
          error.message && (
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

// Register node types
const nodeTypes: NodeTypes = {
  employeeNode: EmployeeNode,
}

interface OrgChartGraphViewProps {
  companyId: string
}

function OrgChartGraphViewInner({ companyId }: OrgChartGraphViewProps) {
  const {
    nodes,
    edges,
    isInitialLoading,
    loadRootNodes,
    expandDown,
    expandUp,
    reset,
  } = useOrgChartData(companyId)

  // Load root nodes on mount or company change
  useEffect(() => {
    reset()
    loadRootNodes(companyId)
  }, [companyId, loadRootNodes, reset])

  // Inject expand callbacks into node data
  const nodesWithCallbacks = useMemo((): Node<EmployeeNodeData>[] => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onExpandDown: expandDown,
        onExpandUp: expandUp,
      },
    }))
  }, [nodes, expandDown, expandUp])

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    // Could be used to deselect nodes if we add selection state
  }, [])

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Escape key - deselect (for future selection state)
    if (event.key === 'Escape') {
      // Future: clear selection state
      return
    }

    // Enter/Space on focused node - trigger expand/focus action
    if (event.key === 'Enter' || event.key === ' ') {
      const activeElement = document.activeElement
      if (activeElement?.classList.contains('react-flow__node')) {
        event.preventDefault()
        // The node's internal expand buttons handle the expansion
        // Enter/Space on a focused node could trigger a default action
        // For now, this enables keyboard navigation to nodes
      }
    }
  }, [])

  if (isInitialLoading) {
    return (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] flex flex-col items-center justify-center gap-3 bg-card rounded-lg border border-border">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading org chart...</p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <Empty className="h-[400px] md:h-[500px] lg:h-[600px] border">
        <EmptyHeader>
          <EmptyTitle>No employees in org chart</EmptyTitle>
          <EmptyDescription>
            Add employees with manager relationships to see the org chart.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <FullscreenGraphModal
      title="Organization Chart"
      desktopClassName="h-[400px] md:h-[500px] lg:h-[600px]"
    >
      <ErrorBoundary FallbackComponent={OrgChartErrorFallback}>
        <div className="w-full h-full border border-border rounded-lg overflow-hidden bg-background">
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onPaneClick={handlePaneClick}
            onKeyDown={handleKeyDown}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={REACTFLOW_FIT_VIEW_OPTIONS}
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={REACTFLOW_DEFAULT_VIEWPORT}
            proOptions={REACTFLOW_PRO_OPTIONS}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
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
        </div>
      </ErrorBoundary>
    </FullscreenGraphModal>
  )
}

export function OrgChartGraphView(props: OrgChartGraphViewProps) {
  return (
    <ReactFlowProvider>
      <OrgChartGraphViewInner {...props} />
    </ReactFlowProvider>
  )
}
