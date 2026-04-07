'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { LogLineEventTypeMappingsEditor } from '@/components/ui/LogLineEventTypeMappingsEditor'
import {
  apiClient,
  ActivityEventDto,
  RoleTitle,
  EventCategory,
  LogLineEventTypeMappingDto,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { showErrorToast } from '@/lib/utils/error-handling'
import {
  showEntityCreatedToast,
  showEntityDeletedToast,
  showLoadFailedToast,
} from '@/lib/utils/notifications'
import { Plus, Activity, Save, X, Trash2, Edit } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ActivityEventEditModal } from '@/components/ui/ActivityEventEditModal'
import { Spinner } from '@/components/ui/spinner'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import {
  activityEventCreateSchema,
  type ActivityEventCreateFormValues,
} from '@/lib/schemas/activityevent'

const defaultEventFormValues: ActivityEventCreateFormValues = {
  name: '',
  description: '',
  associatedRoleTitles: [],
  associatedEventCategories: [],
  logLineEventTypeMappings: [],
}

export function ActivityEventManagementTab() {
  const { getEntityColorClasses } = useColorScheme()
  const activityEventClasses = getEntityColorClasses('ActivityEvent')

  const [activityEvents, setActivityEvents] = useState<ActivityEventDto[]>([])
  const [loading, setLoading] = useState(true)

  // Create new activity event form
  const [isCreating, setIsCreating] = useState(false)
  const createForm = useForm<ActivityEventCreateFormValues>({
    resolver: zodResolver(activityEventCreateSchema),
    defaultValues: defaultEventFormValues,
  })

  // Edit state
  const [editingEvent, setEditingEvent] = useState<ActivityEventDto | null>(
    null
  )

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<ActivityEventDto | null>(
    null
  )

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const eventsData = await apiClient.getActivityEvents()
      setActivityEvents(eventsData)
    } catch (error) {
      showLoadFailedToast('Activity event', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (data: ActivityEventCreateFormValues) => {
    try {
      const createdEvent = await apiClient.createActivityEvent({
        name: data.name,
        description: data.description || '',
      })

      // Update role titles if selected
      if (data.associatedRoleTitles && data.associatedRoleTitles.length > 0) {
        await apiClient.updateActivityEventRoleTitles(
          createdEvent.id,
          data.associatedRoleTitles
        )
      }
      // Update event categories if selected
      if (
        data.associatedEventCategories &&
        data.associatedEventCategories.length > 0
      ) {
        await apiClient.updateActivityEventEventCategories(
          createdEvent.id,
          data.associatedEventCategories
        )
      }
      // Update log line event type mappings if any
      if (
        data.logLineEventTypeMappings &&
        data.logLineEventTypeMappings.length > 0
      ) {
        await apiClient.updateActivityEventLogLineEventTypes(
          createdEvent.id,
          data.logLineEventTypeMappings
        )
      }

      showEntityCreatedToast('Activity event')
      setIsCreating(false)
      createForm.reset(defaultEventFormValues)
      fetchData()
    } catch (error) {
      showErrorToast('Failed to create activity event', error)
    }
  }

  const handleDeleteEvent = (event: ActivityEventDto) => {
    setEventToDelete(event)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      await apiClient.deleteActivityEvent(eventToDelete.id)
      showEntityDeletedToast('Activity event')
      fetchData()
    } catch (error) {
      showErrorToast('Failed to delete activity event', error)
    } finally {
      setDeleteConfirmOpen(false)
      setEventToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${activityEventClasses.text}`}>
          Activity Events ({activityEvents.length})
        </h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Activity Event
        </Button>
      </div>

      {/* Create New Activity Event Form */}
      {isCreating && (
        <Card className={`border-l-4 ${activityEventClasses.borderL}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              New Activity Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateEvent)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Activity event name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Activity event description"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="associatedRoleTitles"
                    render={({ field }) => (
                      <FormItem>
                        <MultiSelect
                          id="new-roleTitles"
                          label="Associated Role Titles"
                          options={Object.values(RoleTitle)}
                          selectedValues={field.value ?? []}
                          onChange={(values) =>
                            field.onChange(values as RoleTitle[])
                          }
                          placeholder="Select role titles..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="associatedEventCategories"
                    render={({ field }) => (
                      <FormItem>
                        <MultiSelect
                          id="new-eventCategories"
                          label="Associated Event Categories"
                          options={Object.values(EventCategory)}
                          selectedValues={field.value ?? []}
                          onChange={(values) =>
                            field.onChange(values as EventCategory[])
                          }
                          placeholder="Select event categories..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="logLineEventTypeMappings"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <LogLineEventTypeMappingsEditor
                          mappings={field.value ?? []}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createForm.formState.isSubmitting}
                  >
                    {createForm.formState.isSubmitting ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      createForm.reset(defaultEventFormValues)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Activity Events Table */}
      {activityEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No activity events found. Create your first activity event to get
          started.
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="hidden md:table-cell min-w-[200px]">
                  Description
                </TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">
                  Role Titles
                </TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">
                  Event Categories
                </TableHead>
                <TableHead className="hidden xl:table-cell min-w-[180px]">
                  Mappings
                </TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm line-clamp-2">
                      {event.description || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {event.associatedRoleTitles.length > 0 ? (
                        event.associatedRoleTitles.slice(0, 2).map((title) => (
                          <Badge
                            key={title}
                            variant="outline"
                            className="text-xs"
                          >
                            {formatEnumTitleCase(title)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {event.associatedRoleTitles.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{event.associatedRoleTitles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(event.associatedEventCategories?.length ?? 0) > 0 ? (
                        event
                          .associatedEventCategories!.slice(0, 2)
                          .map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-xs"
                            >
                              {formatEnumTitleCase(category)}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {(event.associatedEventCategories?.length ?? 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{event.associatedEventCategories!.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(event.logLineEventTypeMappings?.length ?? 0) > 0 ? (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {event.logLineEventTypeMappings!.length} mapping
                            {event.logLineEventTypeMappings!.length !== 1
                              ? 's'
                              : ''}
                          </Badge>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <ActivityEventEditModal
          activityEvent={editingEvent}
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null)
            fetchData()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Activity Event"
        description={`Are you sure you want to delete "${eventToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDeleteEvent}
        destructive={true}
      />
    </div>
  )
}
