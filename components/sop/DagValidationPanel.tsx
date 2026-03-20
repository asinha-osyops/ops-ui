'use client'

import { useMemo, useState } from 'react'
import {
  DagValidationResultDto,
  DagValidationErrorDto,
  DagValidationWarningDto,
  StepDto,
} from '@/lib/api-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DagValidationPanelProps {
  validation: DagValidationResultDto | null
  steps: StepDto[]
  onNodeClick?: (nodeId: string) => void
  className?: string
}

// Map step IDs to step names
function getStepName(stepId: string, steps: StepDto[]): string {
  const step = steps.find((s) => s.id === stepId)
  return step ? step.name : 'Unknown Step'
}

// Error code display names
const ERROR_CODE_NAMES: Record<string, string> = {
  NO_START_NODE: 'No Start Node',
  MULTIPLE_START_NODES: 'Multiple Start Nodes',
  CYCLE_DETECTED: 'Cycle Detected',
  START_HAS_PREDECESSORS: 'Start Has Predecessors',
  END_HAS_SUCCESSORS: 'End Has Successors',
}

// Warning code display names
const WARNING_CODE_NAMES: Record<string, string> = {
  NO_END_NODE: 'No End Node',
  UNREACHABLE_NODE: 'Unreachable Node',
  DANGLING_NODE: 'Dangling Node',
  ORPHAN_NODE: 'Orphan Node',
}

export function DagValidationPanel({
  validation,
  steps,
  onNodeClick,
  className,
}: DagValidationPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Count issues
  const errorCount = validation?.errors?.length ?? 0
  const warningCount = validation?.warnings?.length ?? 0
  const totalIssues = errorCount + warningCount

  // Auto-expand if there are errors
  const shouldDefaultOpen = errorCount > 0

  // Determine panel state
  const panelState = useMemo(() => {
    if (!validation) return 'loading'
    if (errorCount > 0) return 'error'
    if (warningCount > 0) return 'warning'
    return 'valid'
  }, [validation, errorCount, warningCount])

  // Don't render if valid with no warnings
  if (panelState === 'valid') {
    return (
      <Alert
        className={cn(
          'border-green-500 bg-green-50 dark:bg-green-900/20',
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">DAG Valid</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          The workflow structure is valid and ready for use.
        </AlertDescription>
      </Alert>
    )
  }

  if (!validation || panelState === 'loading') {
    return null
  }

  // Render an error item
  const renderError = (error: DagValidationErrorDto, index: number) => {
    const affectedNames = error.affectedNodeIds
      ?.map((id) => getStepName(id, steps))
      .join(', ')

    return (
      <div
        key={`error-${index}`}
        className={cn(
          'flex items-start gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/20',
          'border border-red-200 dark:border-red-800',
          error.affectedNodeIds &&
            error.affectedNodeIds.length > 0 &&
            onNodeClick &&
            'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30'
        )}
        onClick={() => {
          if (
            error.affectedNodeIds &&
            error.affectedNodeIds.length > 0 &&
            onNodeClick
          ) {
            onNodeClick(error.affectedNodeIds[0])
          }
        }}
      >
        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive" className="text-xs">
              {ERROR_CODE_NAMES[error.code] || error.code}
            </Badge>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
          {affectedNames && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Affected: {affectedNames}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Render a warning item
  const renderWarning = (warning: DagValidationWarningDto, index: number) => {
    const nodeName =
      warning.nodeName || (warning.nodeId && getStepName(warning.nodeId, steps))

    return (
      <div
        key={`warning-${index}`}
        className={cn(
          'flex items-start gap-3 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20',
          'border border-yellow-200 dark:border-yellow-800',
          warning.nodeId &&
            onNodeClick &&
            'cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
        )}
        onClick={() => {
          if (warning.nodeId && onNodeClick) {
            onNodeClick(warning.nodeId)
          }
        }}
      >
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-xs border-yellow-500 text-yellow-700"
            >
              {WARNING_CODE_NAMES[warning.code] || warning.code}
            </Badge>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {warning.message}
          </p>
          {nodeName && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Node: {nodeName}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen={shouldDefaultOpen}
      className={className}
    >
      <Alert
        className={cn(
          panelState === 'error' &&
            'border-red-500 bg-red-50 dark:bg-red-900/20',
          panelState === 'warning' &&
            'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        )}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between w-full cursor-pointer">
            <div className="flex items-center gap-2">
              {panelState === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertTitle
                className={cn(
                  panelState === 'error' && 'text-red-600',
                  panelState === 'warning' && 'text-yellow-600'
                )}
              >
                Validation {panelState === 'error' ? 'Errors' : 'Warnings'}
              </AlertTitle>
              <Badge
                variant={panelState === 'error' ? 'destructive' : 'outline'}
                className={cn(
                  'text-xs',
                  panelState === 'warning' &&
                    'border-yellow-500 text-yellow-700'
                )}
              >
                {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Toggle validation details"
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 space-y-2">
            {validation.errors?.map(renderError)}
            {validation.warnings?.map(renderWarning)}
          </div>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  )
}
