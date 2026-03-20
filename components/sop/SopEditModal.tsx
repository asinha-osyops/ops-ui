'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'
import { showEntityUpdatedToast } from '@/lib/utils/notifications'

import {
  apiClient,
  SopDto,
  UpdateSopRequestDto,
  UpdateStepRequestDto,
  RoleTitle,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { truncateId } from '@/lib/utils/format-helpers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CharacterLimitedInput } from '@/components/ui/CharacterLimitedInput'
import { StepTableEditor, StepRow, stepsToRows } from './StepTableEditor'

interface SopEditModalProps {
  sop: SopDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SopEditModal({
  sop,
  open,
  onOpenChange,
  onSuccess,
}: SopEditModalProps) {
  // Form state
  const [sopName, setSopName] = useState('')
  const [basicDescription, setBasicDescription] = useState('')
  const [steps, setSteps] = useState<StepRow[]>([])

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    name?: string
    steps?: string
  }>({})

  // Initialize form when SOP changes
  useEffect(() => {
    if (sop) {
      setSopName(sop.name)
      setBasicDescription(sop.basicDescription || '')
      setSteps(stepsToRows(sop.steps))
      setValidationErrors({})
    }
  }, [sop])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setValidationErrors({})
      setIsSaving(false)
    }
  }, [open])

  const validate = useCallback((): boolean => {
    const errors: typeof validationErrors = {}

    // Validate SOP name
    if (!sopName.trim()) {
      errors.name = 'SOP name is required'
    }

    // Validate steps
    if (steps.length === 0) {
      errors.steps = 'At least one step is required'
    } else {
      const hasEmptyStepName = steps.some((step) => !step.name.trim())
      if (hasEmptyStepName) {
        errors.steps = 'All steps must have a name'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [sopName, steps])

  const handleSave = async () => {
    if (!sop) return

    if (!validate()) {
      toast.error('Please fix the validation errors')
      return
    }

    setIsSaving(true)

    try {
      // Transform steps to API format
      const updateSteps: UpdateStepRequestDto[] = steps.map((step) => ({
        name: step.name.trim(),
        details: step.details.trim() || undefined,
        postStepDocumentation: step.postStepDocumentation.trim() || undefined,
        monitoringRequirements: step.monitoringRequirements.trim() || undefined,
        actorRoleTitle: step.actorRoleTitle || undefined,
      }))

      const requestDto: UpdateSopRequestDto = {
        name: sopName.trim(),
        basicDescription: basicDescription.trim() || undefined,
        steps: updateSteps,
      }

      await apiClient.updateSOP(sop.id, requestDto)

      showEntityUpdatedToast('SOP')
      onSuccess()
    } catch (error) {
      showErrorToast('Failed to update SOP', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!sop) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Edit SOP</DialogTitle>
          <DialogDescription>
            ID: {truncateId(sop.id)} &bull; Company: {sop.companyName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* SOP Name */}
            <div>
              <CharacterLimitedInput
                id="sop-name"
                label="SOP Name *"
                value={sopName}
                onChange={(e) => {
                  setSopName(e.target.value)
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      name: undefined,
                    }))
                  }
                }}
                maxLength={CHARACTER_LIMITS.SOP_NAME}
                placeholder="Enter SOP name"
                disabled={isSaving}
                className={validationErrors.name ? 'border-destructive' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Basic Description */}
            <CharacterLimitedInput
              id="sop-description"
              label="Description"
              value={basicDescription}
              onChange={(e) => setBasicDescription(e.target.value)}
              maxLength={CHARACTER_LIMITS.SOP_DESCRIPTION}
              placeholder="Enter description (optional)"
              disabled={isSaving}
              multiline
              rows={3}
            />

            {/* Steps */}
            <div>
              <h3 className="text-sm font-medium mb-3">Steps</h3>
              {validationErrors.steps && (
                <p className="text-sm text-destructive mb-2">
                  {validationErrors.steps}
                </p>
              )}
              <StepTableEditor
                steps={steps}
                onChange={(newSteps) => {
                  setSteps(newSteps)
                  if (validationErrors.steps) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      steps: undefined,
                    }))
                  }
                }}
                disabled={isSaving}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
