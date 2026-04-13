'use client'

import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EntityActionsProps<T> {
  entity: T
  entityName: string // "SOP" or "Log"
  analyzing?: boolean
  onAnalyze?: (e: React.MouseEvent) => void
  onDownloadJSON: (e: React.MouseEvent) => void
  onDownloadText: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  showDownloadIcons?: boolean // Whether to show icons on download buttons
  showAnalyze?: boolean // Whether to show analyze button (default: true)
  showEdit?: boolean // Whether to show edit button placeholder
  onEdit?: (e: React.MouseEvent) => void // Edit handler (if not provided, button is disabled)
}

/**
 * Reusable action buttons component for SOP and Log entities
 *
 * Provides consistent action buttons:
 * - Analyze (with loading state)
 * - Download as JSON
 * - Download as Text
 * - Delete
 *
 * @example
 * <EntityActions
 *   entity={sop}
 *   entityName="SOP"
 *   analyzing={isAnalyzing}
 *   onAnalyze={(e) => { e.stopPropagation(); analyze(sop.id); }}
 *   onDownloadJSON={(e) => { e.stopPropagation(); downloadJSON(sop); }}
 *   onDownloadText={(e) => { e.stopPropagation(); downloadText(sop); }}
 *   onDelete={(e) => { e.stopPropagation(); deleteSop(sop.id); }}
 * />
 */
export function EntityActions<T>({
  entityName,
  analyzing,
  onAnalyze,
  onDownloadJSON,
  onDownloadText,
  onDelete,
  showAnalyze = true,
  showEdit = false,
  onEdit,
}: EntityActionsProps<T>) {
  return (
    <div className="pt-4 border-t border-border">
      <h3 className="text-sm font-medium text-foreground mb-3">Actions</h3>
      <div className="flex gap-3 items-center">
        {/* Analyze button (optional) */}
        {showAnalyze && onAnalyze && (
          <Button
            variant="default"
            size="sm"
            onClick={onAnalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : `Analyze ${entityName}`}
          </Button>
        )}

        {/* Edit button placeholder (optional) */}
        {showEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={!onEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}

        {/* Options menu for secondary actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onDownloadJSON}>
              Download as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadText}>
              Download as Text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete {entityName}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
