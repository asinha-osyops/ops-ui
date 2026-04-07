'use client'

import { useEffect } from 'react'
import { ActivityEventDto } from '@/lib/api-client'
import { pluralize, formatEnumSimple } from '@/lib/utils/format-helpers'
import { Button } from './button'
import { Spinner } from './spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './empty'
import { Card, CardHeader, CardContent, CardFooter } from './card'
import { Badge } from './badge'
import { DetailField } from './DetailField'
import { downloadAsJSON, downloadAsText } from '@/lib/utils/download'
import { formatActivityEventAsText } from '@/lib/utils/text-formatters'

interface ActivityEventListProps {
  activityEvents: ActivityEventDto[]
  loading: boolean
  highlightedId?: string
  onDeleteActivityEvent: (activityEventId: string) => void
  onEditActivityEvent: (activityEventId: string) => void
}

export function ActivityEventList({
  activityEvents,
  loading,
  highlightedId,
  onDeleteActivityEvent,
  onEditActivityEvent,
}: ActivityEventListProps) {
  // Scroll to highlighted activity event
  useEffect(() => {
    if (highlightedId) {
      setTimeout(() => {
        const element = document.getElementById(
          `activityevent-${highlightedId}`
        )
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [highlightedId])

  const handleDownloadJSON = (activityEvent: ActivityEventDto) => {
    const data = {
      name: activityEvent.name,
      description: activityEvent.description,
      associatedRoleTitles: activityEvent.associatedRoleTitles,
      associatedEventCategories: activityEvent.associatedEventCategories ?? [],
      logLineEventTypeMappings: activityEvent.logLineEventTypeMappings ?? [],
      createdAt: activityEvent.createdAt,
    }
    downloadAsJSON(
      data,
      activityEvent.name,
      `activity-event-${activityEvent.id}`
    )
  }

  const handleDownloadText = (activityEvent: ActivityEventDto) => {
    const textContent = formatActivityEventAsText({
      name: activityEvent.name,
      description: activityEvent.description,
      associatedRoleTitles: activityEvent.associatedRoleTitles,
      associatedEventCategories: activityEvent.associatedEventCategories ?? [],
      logLineEventTypeMappings: activityEvent.logLineEventTypeMappings ?? [],
      createdAt: activityEvent.createdAt,
    })
    downloadAsText(
      textContent,
      activityEvent.name,
      `activity-event-${activityEvent.id}`
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">
          Loading activity events...
        </p>
      </div>
    )
  }

  if (activityEvents.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No activity events found</EmptyTitle>
          <EmptyDescription>
            Create your first activity event to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-medium text-foreground">
          {activityEvents.length} Activity Event
          {pluralize(activityEvents.length)}
        </h3>
      </div>

      {/* Activity Event Cards */}
      <div className="space-y-3">
        {activityEvents.map((activityEvent) => (
          <Card
            key={activityEvent.id}
            id={`activityevent-${activityEvent.id}`}
            className={
              highlightedId === activityEvent.id
                ? 'ring-2 ring-primary shadow-lg'
                : ''
            }
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-medium text-foreground break-words">
                    {activityEvent.name}
                  </h4>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(activityEvent.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Activity Event Details */}
              <div className="space-y-3">
                <DetailField
                  label="Description"
                  value={activityEvent.description}
                  valueClassName="break-words"
                />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Associated Role Titles
                  </p>
                  {activityEvent.associatedRoleTitles.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activityEvent.associatedRoleTitles.map((title) => (
                        <Badge
                          key={title}
                          variant="default"
                          className="text-xs"
                        >
                          {formatEnumSimple(title)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      (none)
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Associated Event Categories
                  </p>
                  {(activityEvent.associatedEventCategories?.length ?? 0) >
                  0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activityEvent.associatedEventCategories!.map(
                        (category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="text-xs"
                          >
                            {formatEnumSimple(category)}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      (none)
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Log Line Event Type Mappings
                  </p>
                  {(activityEvent.logLineEventTypeMappings?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activityEvent.logLineEventTypeMappings!.map(
                        (mapping, index) => (
                          <Badge
                            key={`${mapping.platform}-${mapping.service}-${mapping.event}-${index}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {mapping.platform}/{mapping.service}/{mapping.event}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      (none)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 flex-wrap">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditActivityEvent(activityEvent.id)
                }}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadJSON(activityEvent)
                }}
              >
                Download JSON
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadText(activityEvent)
                }}
              >
                Download Text
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteActivityEvent(activityEvent.id)
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
