'use client'

import { useState } from 'react'
import {
  ActivityEventDto,
  RoleTitle,
  EventCategory,
  LogLineEventTypeMappingDto,
  apiClient,
} from '@/lib/api-client'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog'
import { Label } from './label'
import { Textarea } from './textarea'
import { CharacterLimitedInput } from './CharacterLimitedInput'
import { MultiSelect } from './MultiSelect'
import { LogLineEventTypeMappingsEditor } from './LogLineEventTypeMappingsEditor'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'
import { showEntityUpdatedToast } from '@/lib/utils/notifications'

interface ActivityEventEditModalProps {
  activityEvent: ActivityEventDto
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ActivityEventEditModal({
  activityEvent,
  open,
  onClose,
  onSuccess,
}: ActivityEventEditModalProps) {
  const [name, setName] = useState(activityEvent.name)
  const [description, setDescription] = useState(activityEvent.description)
  const [selectedRoleTitles, setSelectedRoleTitles] = useState<RoleTitle[]>(
    activityEvent.associatedRoleTitles
  )
  const [selectedEventCategories, setSelectedEventCategories] = useState<
    EventCategory[]
  >(activityEvent.associatedEventCategories ?? [])
  const [logLineEventTypeMappings, setLogLineEventTypeMappings] = useState<
    LogLineEventTypeMappingDto[]
  >(activityEvent.logLineEventTypeMappings ?? [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Activity event name required')
      return
    }
    if (!description.trim()) {
      toast.error('Description required')
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.updateActivityEvent(activityEvent.id, {
        name,
        description,
      })
      await apiClient.updateActivityEventRoleTitles(
        activityEvent.id,
        selectedRoleTitles
      )
      await apiClient.updateActivityEventEventCategories(
        activityEvent.id,
        selectedEventCategories
      )
      await apiClient.updateActivityEventLogLineEventTypes(
        activityEvent.id,
        logLineEventTypeMappings
      )

      showEntityUpdatedToast('Activity event')
      onSuccess()
      onClose()
    } catch (error) {
      showErrorToast('Failed to update activity event', error)
      setIsSubmitting(false)
    }
  }

  const roleTitles = Object.values(RoleTitle)
  const eventCategories = Object.values(EventCategory)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Activity Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <CharacterLimitedInput
            id="edit-name"
            label="Activity Event Name"
            value={name}
            maxLength={CHARACTER_LIMITS.ROLE_NAME || 200}
            onChange={(e) => {
              if (
                e.target.value.length <= (CHARACTER_LIMITS.ROLE_NAME || 200)
              ) {
                setName(e.target.value)
              }
            }}
            placeholder="Enter activity event name (max 200 characters)"
            required
          />

          <div className="space-y-2">
            <Label htmlFor="edit-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => {
                if (
                  e.target.value.length <=
                  (CHARACTER_LIMITS.ROLE_DESCRIPTION || 500)
                ) {
                  setDescription(e.target.value)
                }
              }}
              placeholder="Enter activity event description (max 500 characters)"
              rows={4}
              maxLength={CHARACTER_LIMITS.ROLE_DESCRIPTION || 500}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/{CHARACTER_LIMITS.ROLE_DESCRIPTION || 500}{' '}
              characters
            </div>
          </div>

          <MultiSelect
            id="edit-roleTitles"
            label="Associated Role Titles"
            options={roleTitles}
            selectedValues={selectedRoleTitles}
            onChange={setSelectedRoleTitles}
            placeholder="Select role titles..."
          />

          <MultiSelect
            id="edit-eventCategories"
            label="Associated Event Categories"
            options={eventCategories}
            selectedValues={selectedEventCategories}
            onChange={setSelectedEventCategories}
            placeholder="Select event categories..."
          />

          <LogLineEventTypeMappingsEditor
            mappings={logLineEventTypeMappings}
            onChange={setLogLineEventTypeMappings}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
