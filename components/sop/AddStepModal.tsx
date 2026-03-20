'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'

import {
  apiClient,
  CreateStepRequestDto,
  RoleTitle,
  StepNodeType,
  StepDto,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CharacterLimitedInput } from '@/components/ui/CharacterLimitedInput'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

// Role title options for dropdown
const ROLE_TITLE_OPTIONS = Object.values(RoleTitle)

// Node type options
const NODE_TYPE_OPTIONS: {
  value: StepNodeType
  label: string
  description: string
}[] = [
  { value: 'STEP', label: 'Step', description: 'Regular step in the workflow' },
  {
    value: 'START',
    label: 'Start',
    description: 'Entry point of the workflow',
  },
  { value: 'END', label: 'End', description: 'Exit point of the workflow' },
]

interface AddStepModalProps {
  sopId: string
  sopName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (step: StepDto) => void
}

export function AddStepModal({
  sopId,
  sopName,
  open,
  onOpenChange,
  onSuccess,
}: AddStepModalProps) {
  // Form state
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [postStepDocumentation, setPostStepDocumentation] = useState('')
  const [monitoringRequirements, setMonitoringRequirements] = useState('')
  const [nodeType, setNodeType] = useState<StepNodeType>('STEP')
  const [actorRoleTitle, setActorRoleTitle] = useState<RoleTitle | ''>('')

  // UI state
  const [isCreating, setIsCreating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setName('')
      setDetails('')
      setPostStepDocumentation('')
      setMonitoringRequirements('')
      setNodeType('STEP')
      setActorRoleTitle('')
      setValidationError(null)
    }
  }, [open])

  const validate = useCallback((): boolean => {
    if (!name.trim()) {
      setValidationError('Step name is required')
      return false
    }
    setValidationError(null)
    return true
  }, [name])

  const handleCreate = async () => {
    if (!validate()) {
      return
    }

    setIsCreating(true)

    try {
      const request: CreateStepRequestDto = {
        name: name.trim(),
        details: details.trim() || undefined,
        postStepDocumentation: postStepDocumentation.trim() || undefined,
        monitoringRequirements: monitoringRequirements.trim() || undefined,
        nodeType,
        actorRoleTitle: actorRoleTitle || undefined,
      }

      const newStep = await apiClient.createStep(sopId, request)

      toast.success('Step created successfully', {
        description:
          'Remember to add edges to connect this step to the workflow.',
      })
      onSuccess(newStep)
      onOpenChange(false)
    } catch (error) {
      showErrorToast('Failed to create step', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Step</DialogTitle>
          <DialogDescription>
            Add a new step to &quot;{sopName}&quot;. After creating, use the
            Graph View to connect it to the workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step Name */}
          <div>
            <CharacterLimitedInput
              id="step-name"
              label="Step Name *"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (validationError) setValidationError(null)
              }}
              maxLength={CHARACTER_LIMITS.STEP_NAME}
              placeholder="Enter step name"
              disabled={isCreating}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && (
              <p className="text-sm text-destructive mt-1">{validationError}</p>
            )}
          </div>

          {/* Node Type */}
          <div className="space-y-2">
            <Label htmlFor="node-type">Node Type</Label>
            <Select
              value={nodeType}
              onValueChange={(value) => setNodeType(value as StepNodeType)}
              disabled={isCreating}
            >
              <SelectTrigger id="node-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actor Role Title */}
          <div className="space-y-2">
            <Label htmlFor="actor-role">Actor Role (optional)</Label>
            <Select
              value={actorRoleTitle}
              onValueChange={(value) => setActorRoleTitle(value as RoleTitle)}
              disabled={isCreating}
            >
              <SelectTrigger id="actor-role">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {ROLE_TITLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <CharacterLimitedInput
            id="step-details"
            label="Details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={CHARACTER_LIMITS.STEP_DETAILS}
            placeholder="Detailed instructions for this step"
            disabled={isCreating}
            multiline
            rows={2}
          />

          {/* Post-Step Documentation */}
          <CharacterLimitedInput
            id="post-step-doc"
            label="Post-Step Documentation (optional)"
            value={postStepDocumentation}
            onChange={(e) => setPostStepDocumentation(e.target.value)}
            maxLength={CHARACTER_LIMITS.STEP_POST_DOC}
            placeholder="Documentation to complete after this step"
            disabled={isCreating}
          />

          {/* Monitoring Requirements */}
          <CharacterLimitedInput
            id="monitoring"
            label="Monitoring Requirements (optional)"
            value={monitoringRequirements}
            onChange={(e) => setMonitoringRequirements(e.target.value)}
            maxLength={CHARACTER_LIMITS.STEP_MONITORING}
            placeholder="Requirements for monitoring this step"
            disabled={isCreating}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Step'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
