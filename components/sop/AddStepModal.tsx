'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'

import {
  apiClient,
  CreateStepRequestDto,
  RoleTitle,
  StepNodeType,
  StepDto,
} from '@/lib/api-client'
import { createStepSchema, type CreateStepFormValues } from '@/lib/schemas/sop'
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CharacterLimitedInput } from '@/components/ui/CharacterLimitedInput'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
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

const defaultValues: CreateStepFormValues = {
  name: '',
  details: '',
  postStepDocumentation: '',
  monitoringRequirements: '',
  nodeType: 'STEP',
  actorRoleTitle: undefined,
}

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
  const form = useForm<CreateStepFormValues>({
    resolver: zodResolver(createStepSchema),
    defaultValues,
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, form])

  const handleCreate = async (data: CreateStepFormValues) => {
    try {
      const request: CreateStepRequestDto = {
        name: data.name.trim(),
        details: data.details?.trim() || undefined,
        postStepDocumentation: data.postStepDocumentation?.trim() || undefined,
        monitoringRequirements:
          data.monitoringRequirements?.trim() || undefined,
        nodeType: data.nodeType,
        actorRoleTitle: data.actorRoleTitle || undefined,
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
    }
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4 py-4"
          >
            {/* Step Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CharacterLimitedInput
                      id="step-name"
                      label="Step Name *"
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={CHARACTER_LIMITS.STEP_NAME}
                      placeholder="Enter step name"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Node Type */}
            <FormField
              control={form.control}
              name="nodeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Node Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actor Role Title */}
            <FormField
              control={form.control}
              name="actorRoleTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actor Role (optional)</FormLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(value) =>
                      field.onChange(value || undefined)
                    }
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {ROLE_TITLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CharacterLimitedInput
                      id="step-details"
                      label="Details (optional)"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      maxLength={CHARACTER_LIMITS.STEP_DETAILS}
                      placeholder="Detailed instructions for this step"
                      disabled={form.formState.isSubmitting}
                      multiline
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Post-Step Documentation */}
            <FormField
              control={form.control}
              name="postStepDocumentation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CharacterLimitedInput
                      id="post-step-doc"
                      label="Post-Step Documentation (optional)"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      maxLength={CHARACTER_LIMITS.STEP_POST_DOC}
                      placeholder="Documentation to complete after this step"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monitoring Requirements */}
            <FormField
              control={form.control}
              name="monitoringRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CharacterLimitedInput
                      id="monitoring"
                      label="Monitoring Requirements (optional)"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      maxLength={CHARACTER_LIMITS.STEP_MONITORING}
                      placeholder="Requirements for monitoring this step"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Step'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
