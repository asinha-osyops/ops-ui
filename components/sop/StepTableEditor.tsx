'use client'

import { useCallback } from 'react'
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
import {
  GripVertical,
  Trash2,
  Plus,
  Play,
  StopCircle,
  Circle,
} from 'lucide-react'

import { RoleTitle, StepNodeType } from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface StepRow {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoringRequirements: string
  actorRoleTitle: RoleTitle | null
  nodeType: StepNodeType
  isNew?: boolean
}

interface StepTableEditorProps {
  steps: StepRow[]
  onChange: (steps: StepRow[]) => void
  disabled?: boolean
}

// Get all RoleTitle values for the dropdown
const roleTitleOptions = Object.values(RoleTitle)

// Node type options for the dropdown
const nodeTypeOptions: {
  value: StepNodeType
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: 'START',
    label: 'Start',
    icon: <Play className="h-3 w-3 text-green-600" />,
  },
  { value: 'STEP', label: 'Step', icon: <Circle className="h-3 w-3" /> },
  {
    value: 'END',
    label: 'End',
    icon: <StopCircle className="h-3 w-3 text-red-600" />,
  },
]

interface SortableRowProps {
  step: StepRow
  index: number
  onFieldChange: (
    id: string,
    field: keyof StepRow,
    value: string | RoleTitle | StepNodeType | null
  ) => void
  onDelete: (id: string) => void
  canDelete: boolean
  disabled?: boolean
}

function SortableRow({
  step,
  index,
  onFieldChange,
  onDelete,
  canDelete,
  disabled,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'opacity-50 bg-muted',
        'hover:bg-transparent'
      )}
    >
      {/* Drag Handle */}
      <TableCell className="w-10 px-2">
        <button
          type="button"
          className="cursor-grab hover:bg-muted rounded p-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>

      {/* Step Number */}
      <TableCell className="w-12 px-2 text-center text-sm text-muted-foreground">
        {index + 1}
      </TableCell>

      {/* Name */}
      <TableCell className="px-2">
        <Input
          value={step.name}
          onChange={(e) => onFieldChange(step.id, 'name', e.target.value)}
          placeholder="Step name"
          maxLength={CHARACTER_LIMITS.STEP_NAME}
          disabled={disabled}
          className="h-8 text-sm"
        />
      </TableCell>

      {/* Details */}
      <TableCell className="px-2">
        <Input
          value={step.details}
          onChange={(e) => onFieldChange(step.id, 'details', e.target.value)}
          placeholder="Details"
          maxLength={CHARACTER_LIMITS.STEP_DETAILS}
          disabled={disabled}
          className="h-8 text-sm"
        />
      </TableCell>

      {/* Post-Step Documentation */}
      <TableCell className="px-2">
        <Input
          value={step.postStepDocumentation}
          onChange={(e) =>
            onFieldChange(step.id, 'postStepDocumentation', e.target.value)
          }
          placeholder="Post-step docs"
          maxLength={CHARACTER_LIMITS.STEP_POST_DOC}
          disabled={disabled}
          className="h-8 text-sm"
        />
      </TableCell>

      {/* Monitoring Requirements */}
      <TableCell className="px-2">
        <Input
          value={step.monitoringRequirements}
          onChange={(e) =>
            onFieldChange(step.id, 'monitoringRequirements', e.target.value)
          }
          placeholder="Monitoring"
          maxLength={CHARACTER_LIMITS.STEP_MONITORING}
          disabled={disabled}
          className="h-8 text-sm"
        />
      </TableCell>

      {/* Node Type */}
      <TableCell className="px-2 min-w-[100px]">
        <Select
          value={step.nodeType}
          onValueChange={(value) =>
            onFieldChange(step.id, 'nodeType', value as StepNodeType)
          }
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {nodeTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Role Title */}
      <TableCell className="px-2 min-w-[180px]">
        <Select
          value={step.actorRoleTitle || 'none'}
          onValueChange={(value) =>
            onFieldChange(
              step.id,
              'actorRoleTitle',
              value === 'none' ? null : (value as RoleTitle)
            )
          }
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">No role</span>
            </SelectItem>
            {roleTitleOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {formatEnumTitleCase(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Delete */}
      <TableCell className="w-10 px-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(step.id)}
          disabled={!canDelete || disabled}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function StepTableEditor({
  steps,
  onChange,
  disabled,
}: StepTableEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = steps.findIndex((step) => step.id === active.id)
        const newIndex = steps.findIndex((step) => step.id === over.id)
        onChange(arrayMove(steps, oldIndex, newIndex))
      }
    },
    [steps, onChange]
  )

  const handleFieldChange = useCallback(
    (
      id: string,
      field: keyof StepRow,
      value: string | RoleTitle | StepNodeType | null
    ) => {
      onChange(
        steps.map((step) =>
          step.id === id ? { ...step, [field]: value } : step
        )
      )
    },
    [steps, onChange]
  )

  const handleDelete = useCallback(
    (id: string) => {
      onChange(steps.filter((step) => step.id !== id))
    },
    [steps, onChange]
  )

  const handleAddStep = useCallback(() => {
    const newStep: StepRow = {
      id: uuidv4(),
      name: '',
      details: '',
      postStepDocumentation: '',
      monitoringRequirements: '',
      actorRoleTitle: null,
      nodeType: 'STEP',
      isNew: true,
    }
    onChange([...steps, newStep])
  }, [steps, onChange])

  const canDelete = steps.length > 1

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((step) => step.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 px-2"></TableHead>
                    <TableHead className="w-12 px-2 text-center">#</TableHead>
                    <TableHead className="px-2 min-w-[150px]">Name *</TableHead>
                    <TableHead className="px-2 min-w-[150px]">
                      Details
                    </TableHead>
                    <TableHead className="px-2 min-w-[150px]">
                      Post-Step Doc
                    </TableHead>
                    <TableHead className="px-2 min-w-[150px]">
                      Monitoring
                    </TableHead>
                    <TableHead className="px-2 min-w-[100px]">
                      Node Type
                    </TableHead>
                    <TableHead className="px-2 min-w-[180px]">
                      Role Title
                    </TableHead>
                    <TableHead className="w-10 px-2"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.map((step, index) => (
                    <SortableRow
                      key={step.id}
                      step={step}
                      index={index}
                      onFieldChange={handleFieldChange}
                      onDelete={handleDelete}
                      canDelete={canDelete}
                      disabled={disabled}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddStep}
        disabled={disabled}
        className="gap-1"
      >
        <Plus className="h-4 w-4" />
        Add Step
      </Button>
    </div>
  )
}

/**
 * Convert StepDto array from API to StepRow array for editing
 */
export function stepsToRows(
  steps: Array<{
    id: string
    name: string
    details: string
    postStepDocumentation: string
    monitoringRequirements: string
    actorRoleTitle: string | null
    nodeType?: StepNodeType
  }>
): StepRow[] {
  return steps
    .sort(() => {
      // DAG model: steps are not ordered linearly, keep original array order
      return 0
    })
    .map((step) => ({
      id: step.id,
      name: step.name,
      details: step.details,
      postStepDocumentation: step.postStepDocumentation,
      monitoringRequirements: step.monitoringRequirements,
      actorRoleTitle: step.actorRoleTitle as RoleTitle | null,
      nodeType: step.nodeType || 'STEP', // Default to STEP for legacy SOPs
    }))
}

/**
 * Create an empty step row for new SOPs or adding steps
 */
export function createEmptyStepRow(): StepRow {
  return {
    id: uuidv4(),
    name: '',
    details: '',
    postStepDocumentation: '',
    monitoringRequirements: '',
    actorRoleTitle: null,
    nodeType: 'STEP',
    isNew: true,
  }
}
