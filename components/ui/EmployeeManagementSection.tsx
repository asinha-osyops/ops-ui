'use client'

import { EmployeeDto } from '@/lib/api-client'
import { pluralize } from '@/lib/utils/format-helpers'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EmployeeTableView } from '@/components/ui/EmployeeTableView'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Users } from 'lucide-react'

interface EmployeeManagementSectionProps {
  companyId: string
  employees: EmployeeDto[]
  loadingEmployees: boolean
  isBulkEditMode: boolean
  isAddingEmployee: boolean
  deleteAllEmployeesOpen: boolean
  highlightedEmployeeId?: string | null
  titleClassName?: string
  showEmployeeCount?: boolean
  showIcon?: boolean

  // Actions
  onAddEmployee: () => void
  onToggleBulkEdit: () => void
  onDeleteAll: () => void
  onCancelAdd: () => void
  onEmployeeAdded: () => void
  onBulkSaveComplete: () => void
  onDeleteAllOpenChange: (open: boolean) => void
  onConfirmDeleteAll: () => void
}

export function EmployeeManagementSection({
  companyId,
  employees,
  loadingEmployees,
  isBulkEditMode,
  isAddingEmployee,
  deleteAllEmployeesOpen,
  highlightedEmployeeId,
  titleClassName = '',
  showEmployeeCount = true,
  showIcon = true,

  onAddEmployee,
  onToggleBulkEdit,
  onDeleteAll,
  onCancelAdd,
  onEmployeeAdded,
  onBulkSaveComplete,
  onDeleteAllOpenChange,
  onConfirmDeleteAll,
}: EmployeeManagementSectionProps) {
  return (
    <>
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-medium flex items-center gap-2 ${titleClassName}`}
          >
            {showIcon && <Users className="h-5 w-5" />}
            Employees{showEmployeeCount && ` (${employees.length})`}
          </h3>
          <div className="flex gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={onAddEmployee}
              disabled={isAddingEmployee || isBulkEditMode}
            >
              Add Employee
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleBulkEdit}
              disabled={isAddingEmployee || employees.length === 0}
            >
              {isBulkEditMode ? 'Cancel Edit' : 'Bulk Edit'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteAll}
              disabled={
                employees.length === 0 || isBulkEditMode || isAddingEmployee
              }
            >
              Delete All
            </Button>
          </div>
        </div>

        {loadingEmployees ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">
              Loading employees...
            </p>
          </div>
        ) : (
          <EmployeeTableView
            companyId={companyId}
            employees={employees}
            highlightedEmployeeId={highlightedEmployeeId}
            isEditMode={isBulkEditMode}
            isAddingNew={isAddingEmployee}
            onCancelAdd={onCancelAdd}
            onEmployeeAdded={onEmployeeAdded}
            onBulkSaveComplete={onBulkSaveComplete}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteAllEmployeesOpen}
        onOpenChange={onDeleteAllOpenChange}
        title="Delete All Employees?"
        description={`This will permanently delete ${employees.length} employee${pluralize(employees.length)}. This action cannot be undone.`}
        onConfirm={onConfirmDeleteAll}
      />
    </>
  )
}
