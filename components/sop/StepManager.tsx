'use client'

/**
 * ARCHIVED COMPONENTS - Step Manager with Drag & Drop
 *
 * These components were used in the original SOP create flow with manual step entry.
 * Saved here for potential future use in advanced SOP creation or editing features.
 *
 * Original location: app/sop/create/page.tsx
 * Archived on: 2025-12-07
 */

import { v4 as uuidv4 } from 'uuid'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface Step {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoringRequirements: string
}

interface SortableItemProps {
  item: Step
  index: number
  onNameChange: (index: number, value: string) => void
  onDetailsChange: (index: number, value: string) => void
  onPostStepDocumentationChange: (index: number, value: string) => void
  onMonitoringChange: (index: number, value: string) => void
}

export function SortableStepItem({
  item,
  index,
  onNameChange,
  onDetailsChange,
  onPostStepDocumentationChange,
  onMonitoringChange,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-sage/10 p-4"
    >
      <div className="flex gap-4 items-start mb-4">
        <div
          {...attributes}
          {...listeners}
          className="text-sm font-medium text-oxford-blue pt-2 whitespace-nowrap cursor-move hover:text-hunter-green select-none"
          title="Drag to reorder"
        >
          ⋮⋮ Step {index + 1}
        </div>
        <div className="flex-1">
          <label
            htmlFor={`name-${item.id}`}
            className="block text-xs font-medium text-sage mb-1"
          >
            Step Name
          </label>
          <input
            id={`name-${item.id}`}
            type="text"
            value={item.name}
            onChange={(e) => onNameChange(index, e.target.value)}
            placeholder="Enter step name (max 100 characters)"
            className="w-full px-3 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-hunter-green"
            maxLength={100}
          />
          <div className="text-xs text-sage mt-1 text-right">
            {item.name.length}/100 characters
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor={`details-${item.id}`}
            className="block text-xs font-medium text-sage mb-1"
          >
            Step Details
          </label>
          <textarea
            id={`details-${item.id}`}
            value={item.details}
            onChange={(e) => onDetailsChange(index, e.target.value)}
            placeholder="Enter step details (max 500 characters)"
            className="w-full px-3 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-hunter-green resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-sage mt-1 text-right">
            {item.details.length}/500 characters
          </div>
        </div>
      </div>
      <div className="flex gap-4 items-start ml-20">
        <div className="flex-1">
          <label
            htmlFor={`postStepDoc-${item.id}`}
            className="block text-xs font-medium text-sage mb-1"
          >
            Post-Step Documentation
          </label>
          <input
            id={`postStepDoc-${item.id}`}
            type="text"
            value={item.postStepDocumentation || ''}
            onChange={(e) =>
              onPostStepDocumentationChange(index, e.target.value)
            }
            placeholder="Enter post-step documentation (max 200 characters)"
            className="w-full px-3 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-hunter-green"
            maxLength={200}
          />
          <div className="text-xs text-sage mt-1 text-right">
            {(item.postStepDocumentation || '').length}/200 characters
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor={`monitoring-${item.id}`}
            className="block text-xs font-medium text-sage mb-1"
          >
            Monitoring Requirements
          </label>
          <input
            id={`monitoring-${item.id}`}
            type="text"
            value={item.monitoringRequirements || ''}
            onChange={(e) => onMonitoringChange(index, e.target.value)}
            placeholder="Enter monitoring requirements (max 200 characters)"
            className="w-full px-3 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-hunter-green"
            maxLength={200}
          />
          <div className="text-xs text-sage mt-1 text-right">
            {(item.monitoringRequirements || '').length}/200 characters
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepManagerProps {
  steps: Step[]
  onStepsChange: (steps: Step[]) => void
}

export function StepManager({ steps, onStepsChange }: StepManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id)
      const newIndex = steps.findIndex((step) => step.id === over.id)

      onStepsChange(arrayMove(steps, oldIndex, newIndex))
    }
  }

  const handleNameChange = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index].name = value.slice(0, 100)
    onStepsChange(newSteps)
  }

  const handleDetailsChange = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index].details = value.slice(0, 500)
    onStepsChange(newSteps)
  }

  const handlePostStepDocumentationChange = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index].postStepDocumentation = value.slice(0, 200)
    onStepsChange(newSteps)
  }

  const handleMonitoringChange = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index].monitoringRequirements = value.slice(0, 200)
    onStepsChange(newSteps)
  }

  const addStep = () => {
    onStepsChange([
      ...steps,
      {
        id: uuidv4(),
        name: '',
        details: '',
        postStepDocumentation: '',
        monitoringRequirements: '',
      },
    ])
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((step) => step.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {steps.map((step, index) => (
              <SortableStepItem
                key={step.id}
                item={step}
                index={index}
                onNameChange={handleNameChange}
                onDetailsChange={handleDetailsChange}
                onPostStepDocumentationChange={
                  handlePostStepDocumentationChange
                }
                onMonitoringChange={handleMonitoringChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-3 mt-4">
        <button
          onClick={addStep}
          className="px-4 py-2 bg-hunter-green text-white rounded-md hover:bg-hunter-green-hover"
        >
          + Add Step
        </button>
      </div>
    </div>
  )
}

/**
 * Helper function to generate sample steps for testing
 */
export function generateSampleSteps(): Step[] {
  return [
    {
      id: uuidv4(),
      name: 'Initial Assessment',
      details: 'Conduct initial assessment of requirements and current state',
      postStepDocumentation: 'Document assessment findings',
      monitoringRequirements: 'Review assessment report',
    },
    {
      id: uuidv4(),
      name: 'Planning',
      details: 'Create detailed project plan and timeline',
      postStepDocumentation: 'Share plan with stakeholders',
      monitoringRequirements: 'Weekly progress reviews',
    },
    {
      id: uuidv4(),
      name: 'Execution',
      details: 'Execute planned activities according to timeline',
      postStepDocumentation: 'Log all activities and outcomes',
      monitoringRequirements: 'Daily status updates',
    },
  ]
}
