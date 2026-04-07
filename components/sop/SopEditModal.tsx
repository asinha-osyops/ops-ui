'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'
import { showEntityUpdatedToast } from '@/lib/utils/notifications'

import {
  apiClient,
  SopDto,
  UpdateSopRequestDto,
  UpdateStepRequestDto,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { truncateId } from '@/lib/utils/format-helpers'
import { zodBuilders } from '@/lib/schemas/schema-builders'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CharacterLimitedInput } from '@/components/ui/CharacterLimitedInput'
import { StepTableEditor, StepRow, stepsToRows } from './StepTableEditor'

/** Schema for top-level SOP fields only (steps validated separately) */
const sopEditSchema = z.object({
  sopName: zodBuilders.requiredString('SOP name', 'SOP_NAME'),
  basicDescription: z.string().max(CHARACTER_LIMITS.SOP_DESCRIPTION).optional(),
})
type SopEditFormValues = z.infer<typeof sopEditSchema>

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
  const form = useForm<SopEditFormValues>({
    resolver: zodResolver(sopEditSchema),
    defaultValues: { sopName: '', basicDescription: '' },
  })

  // Steps managed separately (StepTableEditor has its own complex state)
  const [steps, setSteps] = useState<StepRow[]>([])
  const [stepsError, setStepsError] = useState<string | null>(null)

  // Initialize form when SOP changes
  useEffect(() => {
    if (sop) {
      form.reset({
        sopName: sop.name,
        basicDescription: sop.basicDescription || '',
      })
      setSteps(stepsToRows(sop.steps))
      setStepsError(null)
    }
  }, [sop, form])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setStepsError(null)
    }
  }, [open])

  const handleSave = async (data: SopEditFormValues) => {
    if (!sop) return

    // Validate steps separately
    if (steps.length === 0) {
      setStepsError('At least one step is required')
      toast.error('Please fix the validation errors')
      return
    }
    const hasEmptyStepName = steps.some((step) => !step.name.trim())
    if (hasEmptyStepName) {
      setStepsError('All steps must have a name')
      toast.error('Please fix the validation errors')
      return
    }

    try {
      const updateSteps: UpdateStepRequestDto[] = steps.map((step) => ({
        name: step.name.trim(),
        details: step.details.trim() || undefined,
        postStepDocumentation: step.postStepDocumentation.trim() || undefined,
        monitoringRequirements: step.monitoringRequirements.trim() || undefined,
        actorRoleTitle: step.actorRoleTitle || undefined,
      }))

      const requestDto: UpdateSopRequestDto = {
        name: data.sopName.trim(),
        basicDescription: data.basicDescription?.trim() || undefined,
        steps: updateSteps,
      }

      await apiClient.updateSOP(sop.id, requestDto)

      showEntityUpdatedToast('SOP')
      onSuccess()
    } catch (error) {
      showErrorToast('Failed to update SOP', error)
    }
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
          <Form {...form}>
            <form
              id="sop-edit-form"
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-6 pb-6"
            >
              {/* SOP Name */}
              <FormField
                control={form.control}
                name="sopName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CharacterLimitedInput
                        id="sop-name"
                        label="SOP Name *"
                        value={field.value}
                        onChange={field.onChange}
                        maxLength={CHARACTER_LIMITS.SOP_NAME}
                        placeholder="Enter SOP name"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Description */}
              <FormField
                control={form.control}
                name="basicDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CharacterLimitedInput
                        id="sop-description"
                        label="Description"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        maxLength={CHARACTER_LIMITS.SOP_DESCRIPTION}
                        placeholder="Enter description (optional)"
                        disabled={form.formState.isSubmitting}
                        multiline
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Steps */}
              <div>
                <h3 className="text-sm font-medium mb-3">Steps</h3>
                {stepsError && (
                  <p className="text-sm text-destructive mb-2">{stepsError}</p>
                )}
                <StepTableEditor
                  steps={steps}
                  onChange={(newSteps) => {
                    setSteps(newSteps)
                    if (stepsError) setStepsError(null)
                  }}
                  disabled={form.formState.isSubmitting}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="sop-edit-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
