'use client'

import { useCallback } from 'react'
import { useReactFlow, ControlButton, Panel } from 'reactflow'
import { Minus, Plus, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { REACTFLOW_FIT_VIEW_OPTIONS } from '@/lib/constants/graph-config'

interface AccessibleGraphControlsProps {
  className?: string
  /** Position of the controls panel */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Show fit view button */
  showFitView?: boolean
  /** Show zoom controls */
  showZoom?: boolean
}

/**
 * Accessible graph controls with proper aria-labels
 * Replaces default ReactFlow Controls with accessible button labels
 */
export function AccessibleGraphControls({
  className,
  position = 'bottom-left',
  showFitView = true,
  showZoom = true,
}: AccessibleGraphControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const handleZoomIn = useCallback(() => {
    zoomIn()
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut()
  }, [zoomOut])

  const handleFitView = useCallback(() => {
    fitView(REACTFLOW_FIT_VIEW_OPTIONS)
  }, [fitView])

  return (
    <Panel position={position}>
      <div
        className={cn(
          'flex flex-col bg-card border border-border rounded-md overflow-hidden',
          className
        )}
      >
        {showZoom && (
          <>
            <ControlButton
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
              className="!p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" />
            </ControlButton>
            <ControlButton
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
              className="!p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-t border-border"
            >
              <Minus className="h-4 w-4" />
            </ControlButton>
          </>
        )}
        {showFitView && (
          <ControlButton
            onClick={handleFitView}
            aria-label="Fit view to content"
            title="Fit view"
            className={cn(
              '!p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              showZoom && 'border-t border-border'
            )}
          >
            <Maximize2 className="h-4 w-4" />
          </ControlButton>
        )}
      </div>
    </Panel>
  )
}
