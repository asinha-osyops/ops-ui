import { useState, useCallback } from 'react'
import {
  apiClient,
  StepNodeType,
  CreateEdgeRequestDto,
  CreateEdgeResponseDto,
  CreateStepRequestDto,
  DagValidationResultDto,
  StepDto,
} from '@/lib/api-client'
import { toast } from 'sonner'

// Edge creation state machine
export type EdgeCreationState = 'idle' | 'selecting-source' | 'selecting-target'

export interface UseDagEditingOptions {
  sopId: string
  onSopUpdate?: () => void
}

export interface UseDagEditingReturn {
  // Edit mode
  isEditMode: boolean
  toggleEditMode: () => void
  setEditMode: (enabled: boolean) => void

  // Selection
  selectedNodeId: string | null
  selectNode: (nodeId: string | null) => void

  // Edge creation
  edgeCreationState: EdgeCreationState
  sourceNodeId: string | null
  startEdgeCreation: () => void
  cancelEdgeCreation: () => void
  handleNodeClickForEdge: (nodeId: string) => Promise<void>

  // Operations
  createEdge: (
    fromId: string,
    toId: string
  ) => Promise<CreateEdgeResponseDto | null>
  deleteEdge: (edgeId: string) => Promise<DagValidationResultDto | null>
  changeNodeType: (
    stepId: string,
    nodeType: StepNodeType
  ) => Promise<StepDto | null>
  createStep: (request: CreateStepRequestDto) => Promise<StepDto | null>
  deleteStep: (stepId: string) => Promise<boolean>

  // Validation
  validation: DagValidationResultDto | null
  refreshValidation: () => Promise<void>

  // Loading states
  isLoading: boolean
  isCreatingEdge: boolean
  isDeletingEdge: boolean
  isChangingNodeType: boolean
  isCreatingStep: boolean
  isDeletingStep: boolean

  // Error
  error: string | null
  clearError: () => void
}

/**
 * Hook to manage DAG editing operations for an SOP
 */
export function useDagEditing({
  sopId,
  onSopUpdate,
}: UseDagEditingOptions): UseDagEditingReturn {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Edge creation state
  const [edgeCreationState, setEdgeCreationState] =
    useState<EdgeCreationState>('idle')
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null)

  // Validation state
  const [validation, setValidation] = useState<DagValidationResultDto | null>(
    null
  )

  // Loading states
  const [isCreatingEdge, setIsCreatingEdge] = useState(false)
  const [isDeletingEdge, setIsDeletingEdge] = useState(false)
  const [isChangingNodeType, setIsChangingNodeType] = useState(false)
  const [isCreatingStep, setIsCreatingStep] = useState(false)
  const [isDeletingStep, setIsDeletingStep] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Combined loading state
  const isLoading =
    isCreatingEdge ||
    isDeletingEdge ||
    isChangingNodeType ||
    isCreatingStep ||
    isDeletingStep

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev) {
        // Exiting edit mode - reset all state
        setEdgeCreationState('idle')
        setSourceNodeId(null)
        setSelectedNodeId(null)
      }
      return !prev
    })
  }, [])

  // Select a node
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  // Start edge creation
  const startEdgeCreation = useCallback(() => {
    setEdgeCreationState('selecting-source')
    setSourceNodeId(null)
    setSelectedNodeId(null)
    toast.info('Click on the source step to start the edge')
  }, [])

  // Cancel edge creation
  const cancelEdgeCreation = useCallback(() => {
    setEdgeCreationState('idle')
    setSourceNodeId(null)
    toast.info('Edge creation cancelled')
  }, [])

  // Handle node click during edge creation
  const handleNodeClickForEdge = useCallback(
    async (nodeId: string) => {
      if (edgeCreationState === 'selecting-source') {
        // First click - select source
        setSourceNodeId(nodeId)
        setEdgeCreationState('selecting-target')
        toast.info('Now click on the target step')
      } else if (edgeCreationState === 'selecting-target' && sourceNodeId) {
        // Second click - create edge
        if (nodeId === sourceNodeId) {
          toast.error('Cannot create edge to the same node')
          return
        }

        setIsCreatingEdge(true)
        try {
          const request: CreateEdgeRequestDto = {
            fromStepId: sourceNodeId,
            toStepId: nodeId,
          }
          const result = await apiClient.createEdge(sopId, request)

          setValidation(result.validation)

          if (result.validation.valid) {
            toast.success('Edge created successfully')
          } else if (result.validation.errors.length > 0) {
            toast.warning('Edge created with validation errors')
          } else {
            toast.success('Edge created with warnings')
          }

          // Reset edge creation state
          setEdgeCreationState('idle')
          setSourceNodeId(null)

          // Refresh SOP data
          onSopUpdate?.()
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to create edge'
          setError(message)
          toast.error(message)
        } finally {
          setIsCreatingEdge(false)
        }
      }
    },
    [edgeCreationState, sourceNodeId, sopId, onSopUpdate]
  )

  // Create edge directly (alternative to click-based)
  const createEdge = useCallback(
    async (
      fromId: string,
      toId: string
    ): Promise<CreateEdgeResponseDto | null> => {
      setIsCreatingEdge(true)
      setError(null)

      try {
        const request: CreateEdgeRequestDto = {
          fromStepId: fromId,
          toStepId: toId,
        }
        const result = await apiClient.createEdge(sopId, request)

        setValidation(result.validation)
        onSopUpdate?.()

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create edge'
        setError(message)
        toast.error(message)
        return null
      } finally {
        setIsCreatingEdge(false)
      }
    },
    [sopId, onSopUpdate]
  )

  // Delete edge
  const deleteEdge = useCallback(
    async (edgeId: string): Promise<DagValidationResultDto | null> => {
      setIsDeletingEdge(true)
      setError(null)

      try {
        const result = await apiClient.deleteEdge(sopId, edgeId)

        setValidation(result)
        toast.success('Edge deleted')
        onSopUpdate?.()

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete edge'
        setError(message)
        toast.error(message)
        return null
      } finally {
        setIsDeletingEdge(false)
      }
    },
    [sopId, onSopUpdate]
  )

  // Change node type
  const changeNodeType = useCallback(
    async (stepId: string, nodeType: StepNodeType): Promise<StepDto | null> => {
      setIsChangingNodeType(true)
      setError(null)

      try {
        const result = await apiClient.updateStepNodeType(
          sopId,
          stepId,
          nodeType
        )

        toast.success(`Step set as ${nodeType}`)
        onSopUpdate?.()

        // Refresh validation after node type change
        try {
          const validationResult = await apiClient.validateDag(sopId)
          setValidation(validationResult)
        } catch {
          // Ignore validation errors
        }

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to change node type'
        setError(message)
        toast.error(message)
        return null
      } finally {
        setIsChangingNodeType(false)
      }
    },
    [sopId, onSopUpdate]
  )

  // Create a new step
  const createStep = useCallback(
    async (request: CreateStepRequestDto): Promise<StepDto | null> => {
      setIsCreatingStep(true)
      setError(null)

      try {
        const result = await apiClient.createStep(sopId, request)

        toast.success('Step created', {
          description: 'Use the Graph View to connect it to the workflow.',
        })
        onSopUpdate?.()

        // Refresh validation after step creation
        try {
          const validationResult = await apiClient.validateDag(sopId)
          setValidation(validationResult)
        } catch {
          // Ignore validation errors
        }

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create step'
        setError(message)
        toast.error(message)
        return null
      } finally {
        setIsCreatingStep(false)
      }
    },
    [sopId, onSopUpdate]
  )

  // Delete a step
  const deleteStep = useCallback(
    async (stepId: string): Promise<boolean> => {
      setIsDeletingStep(true)
      setError(null)

      try {
        await apiClient.deleteStep(sopId, stepId)

        toast.success('Step deleted')
        onSopUpdate?.()

        // Refresh validation after step deletion
        try {
          const validationResult = await apiClient.validateDag(sopId)
          setValidation(validationResult)
        } catch {
          // Ignore validation errors
        }

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete step'
        setError(message)
        toast.error(message)
        return false
      } finally {
        setIsDeletingStep(false)
      }
    },
    [sopId, onSopUpdate]
  )

  // Refresh validation
  const refreshValidation = useCallback(async () => {
    try {
      const result = await apiClient.validateDag(sopId)
      setValidation(result)
    } catch (err) {
      console.error('Failed to refresh validation:', err)
    }
  }, [sopId])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Edit mode
    isEditMode,
    toggleEditMode,
    setEditMode: setIsEditMode,

    // Selection
    selectedNodeId,
    selectNode,

    // Edge creation
    edgeCreationState,
    sourceNodeId,
    startEdgeCreation,
    cancelEdgeCreation,
    handleNodeClickForEdge,

    // Operations
    createEdge,
    deleteEdge,
    changeNodeType,
    createStep,
    deleteStep,

    // Validation
    validation,
    refreshValidation,

    // Loading states
    isLoading,
    isCreatingEdge,
    isDeletingEdge,
    isChangingNodeType,
    isCreatingStep,
    isDeletingStep,

    // Error
    error,
    clearError,
  }
}
