'use client'

import { useMemo, useCallback, useState } from 'react'
import { Edge } from 'reactflow'
import 'reactflow/dist/style.css'

import { SopDto, StepDto, StepNodeType } from '@/lib/api-client'
import { useDagEditing } from '@/lib/hooks/useDagEditing'
import {
  DagGraphView,
  StepAccessors,
} from '@/components/graph-nodes/DagGraphView'
import { DagValidationPanel } from './DagValidationPanel'
import { SopExpandedContent } from './graph-nodes/SopStepNode'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  Eye,
  Plus,
  X,
  Trash2,
  Play,
  StopCircle,
  Circle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Step accessors for SopDto steps
const sopStepAccessors: StepAccessors<StepDto> = {
  getId: (step) => step.id,
  getName: (step) => step.name,
  getDetails: (step) => step.details,
  getNodeType: (step) => step.nodeType,
  getIsFork: (step) => step.isFork,
  getIsJoin: (step) => step.isJoin,
  getActorRoleTitle: (step) => step.actorRoleTitle,
}

interface SopGraphViewProps {
  sop: SopDto
  isEditable?: boolean
  onSopUpdate?: () => void
  className?: string
}

export function SopGraphView({
  sop,
  isEditable = false,
  onSopUpdate,
  className,
}: SopGraphViewProps) {
  // State
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // DAG editing hook
  const {
    isEditMode,
    toggleEditMode,
    edgeCreationState,
    sourceNodeId,
    startEdgeCreation,
    cancelEdgeCreation,
    handleNodeClickForEdge,
    deleteEdge,
    changeNodeType,
    validation: editValidation,
    isLoading,
    isChangingNodeType,
  } = useDagEditing({
    sopId: sop.id,
    onSopUpdate,
  })

  // Get steps and edges with fallbacks for legacy SOPs
  const steps = useMemo(() => sop.steps || [], [sop.steps])
  const edges = useMemo(() => sop.edges || [], [sop.edges])

  // Handle step selection
  const handleStepSelect = useCallback(
    (stepId: string | null) => {
      // In edge creation mode, handle the click for edge creation
      if (edgeCreationState !== 'idle' && stepId) {
        handleNodeClickForEdge(stepId)
        return
      }
      setSelectedNodeId(stepId)
    },
    [edgeCreationState, handleNodeClickForEdge]
  )

  // Handle step expansion
  const handleStepExpand = useCallback(
    (stepId: string | null) => {
      // Don't expand during edge creation
      if (edgeCreationState !== 'idle') {
        return
      }
      setExpandedStepId(stepId)
    },
    [edgeCreationState]
  )

  // Handle edge click - delete in edit mode
  const handleEdgeClick = useCallback(
    (edgeId: string, edge: Edge) => {
      if (!isEditMode) return

      // Find step names for confirmation
      const sourceStep = steps.find((s) => s.id === edge.source)
      const targetStep = steps.find((s) => s.id === edge.target)

      if (
        confirm(
          `Delete edge from "${sourceStep?.name}" to "${targetStep?.name}"?`
        )
      ) {
        deleteEdge(edgeId)
      }
    },
    [isEditMode, deleteEdge, steps]
  )

  // Handle validation node click
  const handleValidationNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    setExpandedStepId(nodeId)
  }, [])

  // Handle node type change
  const handleNodeTypeChange = useCallback(
    async (stepId: string, nodeType: StepNodeType) => {
      await changeNodeType(stepId, nodeType)
    },
    [changeNodeType]
  )

  // Use server validation if available, otherwise do basic client-side validation
  const validation = useMemo(() => {
    if (editValidation) {
      return editValidation
    }

    // Basic client-side validation as fallback
    const errors: any[] = []
    const warnings: any[] = []

    const startNodes = steps.filter((s) => s.nodeType === 'START').length
    const endNodes = steps.filter((s) => s.nodeType === 'END').length

    if (startNodes === 0 && steps.length > 0) {
      errors.push({
        code: 'NO_START_NODE',
        message: 'No START node defined. Mark one step as the entry point.',
        affectedNodeIds: [],
      })
    } else if (startNodes > 1) {
      const startIds = steps
        .filter((s) => s.nodeType === 'START')
        .map((s) => s.id)
      errors.push({
        code: 'MULTIPLE_START_NODES',
        message:
          'Multiple START nodes detected. Only one entry point is allowed.',
        affectedNodeIds: startIds,
      })
    }

    if (endNodes === 0 && steps.length > 0) {
      warnings.push({
        code: 'NO_END_NODE',
        message: 'No END node defined. Consider marking terminal steps.',
        nodeId: undefined,
        nodeName: undefined,
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }, [editValidation, steps])

  // Get step name by ID
  const getStepName = useCallback(
    (stepId: string) => steps.find((s) => s.id === stepId)?.name || 'Unknown',
    [steps]
  )

  // Render expanded content for SOP steps
  const renderExpandedContent = useCallback(
    (step: StepDto) => <SopExpandedContent step={step} />,
    []
  )

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Edge creation controls */}
          {isEditMode && edgeCreationState === 'idle' && (
            <Button
              variant="outline"
              size="sm"
              onClick={startEdgeCreation}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Edge
            </Button>
          )}

          {isEditMode && edgeCreationState !== 'idle' && (
            <div className="flex items-center gap-2 animate-pulse">
              <Badge
                variant="outline"
                className={cn(
                  'py-1 px-3 border-2',
                  edgeCreationState === 'selecting-source'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                )}
              >
                {edgeCreationState === 'selecting-source'
                  ? '1/2: Click the source step (where the edge starts)'
                  : `2/2: From "${getStepName(sourceNodeId!)}" → Click the target step`}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEdgeCreation}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}

          {isEditable && (
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleEditMode}
              disabled={isLoading}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Mode
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Graph - using shared DagGraphView */}
      <DagGraphView
        steps={steps}
        edges={edges}
        stepAccessors={sopStepAccessors}
        renderExpandedContent={renderExpandedContent}
        selectedStepId={selectedNodeId}
        expandedStepId={expandedStepId}
        onStepSelect={handleStepSelect}
        onStepExpand={handleStepExpand}
        editMode={isEditMode}
        onEdgeClick={handleEdgeClick}
        edgeCreationState={edgeCreationState}
        sourceNodeId={sourceNodeId}
        showStats={true}
        emptyMessage="No steps defined. Add steps to visualize the workflow."
        title={`SOP: ${sop.name}`}
      />

      {/* Validation Panel - only show if there are issues or in edit mode */}
      {(isEditMode || !validation.valid || validation.warnings.length > 0) && (
        <DagValidationPanel
          validation={validation}
          steps={steps}
          onNodeClick={handleValidationNodeClick}
        />
      )}

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="text-sm font-medium">Edit Mode Controls</div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>
                Click &quot;Add Edge&quot; then click source → target steps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Click an edge (shown in red) to delete it</span>
            </div>
          </div>

          {/* Selected node actions */}
          {selectedNodeId && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Selected: {getStepName(selectedNodeId)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Set as:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleNodeTypeChange(selectedNodeId, 'START')
                    }
                    disabled={
                      isChangingNodeType ||
                      steps.find((s) => s.id === selectedNodeId)?.nodeType ===
                        'START'
                    }
                    className="h-7"
                  >
                    <Play className="h-3 w-3 mr-1 text-green-600" />
                    START
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNodeTypeChange(selectedNodeId, 'STEP')}
                    disabled={
                      isChangingNodeType ||
                      steps.find((s) => s.id === selectedNodeId)?.nodeType ===
                        'STEP'
                    }
                    className="h-7"
                  >
                    <Circle className="h-3 w-3 mr-1" />
                    STEP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNodeTypeChange(selectedNodeId, 'END')}
                    disabled={
                      isChangingNodeType ||
                      steps.find((s) => s.id === selectedNodeId)?.nodeType ===
                        'END'
                    }
                    className="h-7"
                  >
                    <StopCircle className="h-3 w-3 mr-1 text-red-600" />
                    END
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
