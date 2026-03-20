'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { pluralize } from '@/lib/utils/format-helpers'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import {
  EmployeeDto,
  CreateEmployeeRequestDto,
  EmployeeUpdateItem,
  apiClient,
  BulkEmployeeResponseDto,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'
import {
  showEntityCreatedToast,
  showEntityDeletedToast,
} from '@/lib/utils/notifications'
import { useAppContext } from '@/lib/app-context'
import { useRoles } from '@/lib/hooks/useRoles'
import { ConfirmDialog } from './ConfirmDialog'

interface EmployeeRow extends Partial<EmployeeDto> {
  isNew?: boolean
  isEditing?: boolean
  errors?: {
    name?: string
    phoneNumber?: string
    email?: string
  }
}

interface EmployeeTableViewProps {
  companyId: string
  employees: EmployeeDto[]
  highlightedEmployeeId?: string | null
  isEditMode: boolean
  isAddingNew: boolean
  onCancelAdd: () => void
  onEmployeeAdded: () => void
  onBulkSaveComplete: () => void
}

export const EmployeeTableView = React.memo(function EmployeeTableView({
  companyId,
  employees,
  highlightedEmployeeId,
  isEditMode,
  isAddingNew,
  onCancelAdd,
  onEmployeeAdded,
  onBulkSaveComplete,
}: EmployeeTableViewProps) {
  const { refreshEmployees } = useAppContext()
  const { roles, loadingRoles } = useRoles(companyId)
  const [rows, setRows] = useState<EmployeeRow[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  // Scroll to highlighted employee
  useEffect(() => {
    if (highlightedEmployeeId) {
      setTimeout(() => {
        const element = document.getElementById(
          `employee-${highlightedEmployeeId}`
        )
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150) // Slightly longer delay for table rendering
    }
  }, [highlightedEmployeeId])

  // Initialize rows from employees
  useEffect(() => {
    const employeeRows: EmployeeRow[] = employees.map((emp) => ({
      ...emp,
      isNew: false,
      isEditing: false,
      errors: {},
    }))

    // Add new row if adding
    if (isAddingNew) {
      employeeRows.push({
        id: undefined,
        name: '',
        phoneNumber: '',
        email: '',
        roleId: null,
        managerId: null,
        isNew: true,
        isEditing: true,
        errors: {},
      })
    }

    setRows(employeeRows)
  }, [employees, isAddingNew])

  // Memoize validation function (pure function, doesn't depend on props/state)
  const validateRow = useCallback((row: EmployeeRow): boolean => {
    const errors: EmployeeRow['errors'] = {}
    let isValid = true

    // Name validation
    if (!row.name?.trim()) {
      errors.name = 'Required'
      isValid = false
    } else if (row.name.length > CHARACTER_LIMITS.EMPLOYEE_NAME) {
      errors.name = `Max ${CHARACTER_LIMITS.EMPLOYEE_NAME} chars`
      isValid = false
    }

    // Phone validation
    if (!row.phoneNumber?.trim()) {
      errors.phoneNumber = 'Required'
      isValid = false
    } else {
      try {
        const validIntl = isValidPhoneNumber(row.phoneNumber)
        const validUS = isValidPhoneNumber(row.phoneNumber, 'US')
        if (!validIntl && !validUS) {
          errors.phoneNumber = 'Invalid format'
          isValid = false
        }
      } catch (err) {
        errors.phoneNumber = 'Invalid'
        isValid = false
      }
    }

    // Email validation
    if (!row.email?.trim()) {
      errors.email = 'Required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.email = 'Invalid format'
      isValid = false
    } else if (row.email.length > CHARACTER_LIMITS.EMPLOYEE_EMAIL) {
      errors.email = `Max ${CHARACTER_LIMITS.EMPLOYEE_EMAIL} chars`
      isValid = false
    }

    row.errors = errors
    return isValid
  }, [])

  const handleCellChange = useCallback(
    (index: number, field: keyof EmployeeRow, value: any) => {
      setRows((prevRows) => {
        const newRows = [...prevRows]
        newRows[index] = { ...newRows[index], [field]: value }
        return newRows
      })
    },
    []
  )

  const handleSaveNewEmployee = async (index: number) => {
    const row = rows[index]
    if (!validateRow(row)) {
      setRows([...rows]) // Trigger re-render to show errors
      return
    }

    setSaving(true)
    try {
      const employeeData: CreateEmployeeRequestDto = {
        companyId,
        name: row.name!,
        phoneNumber: row.phoneNumber!,
        email: row.email!,
        roleId: row.roleId || null,
        managerId: row.managerId || null,
      }

      await apiClient.createEmployee(employeeData)
      showEntityCreatedToast('Employee')

      // Refresh employee cache
      await refreshEmployees()

      onEmployeeAdded()
    } catch (error) {
      showErrorToast('Failed to add employee', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkSave = async () => {
    // Validate all rows
    const validatedRows = rows.map((row) => {
      if (!row.isNew) {
        validateRow(row)
      }
      return row
    })

    setRows(validatedRows)

    const hasErrors = validatedRows.some(
      (row) => Object.keys(row.errors || {}).length > 0
    )
    if (hasErrors) {
      toast.error('Validation errors found', {
        description: 'Please fix all errors before saving',
      })
      return
    }

    setSaving(true)
    try {
      const updates: EmployeeUpdateItem[] = rows
        .filter((row) => !row.isNew && row.id)
        .map((row) => ({
          id: row.id!,
          data: {
            name: row.name!,
            phoneNumber: row.phoneNumber!,
            email: row.email!,
            roleId: row.roleId || null,
            managerId: row.managerId || null,
          },
        }))

      if (updates.length > 0) {
        const updateResponse: BulkEmployeeResponseDto =
          await apiClient.bulkUpdateEmployees(companyId, { employees: updates })
        toast.success(
          `Updated ${updateResponse.successCount} employee${pluralize(updateResponse.successCount)}`
        )
        toast.warning(
          `Failed to update ${updateResponse.failureCount} employee${pluralize(updateResponse.failureCount)}`
        )

        // Refresh employee cache
        await refreshEmployees()

        onBulkSaveComplete()
      }
    } catch (error) {
      showErrorToast('Failed to save changes', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEmployee = useCallback((employeeId: string) => {
    setEmployeeToDelete(employeeId)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!employeeToDelete) return

    try {
      await apiClient.deleteEmployee(companyId, employeeToDelete)
      showEntityDeletedToast('Employee')

      // Refresh employee cache
      await refreshEmployees()

      onEmployeeAdded() // Refresh list
    } catch (error) {
      showErrorToast('Failed to delete employee', error)
    } finally {
      setDeleteConfirmOpen(false)
      setEmployeeToDelete(null)
    }
  }

  if (rows.length === 0 && !isAddingNew) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees found. Click &quot;Add Employee&quot; to create one.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              <TableHead className="min-w-[150px]">Email</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
                Phone
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
                Role
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[120px]">
                Manager
              </TableHead>
              <TableHead className="min-w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const isReadOnly = !row.isNew && !isEditMode

              return (
                <TableRow
                  key={row.id || `new-${index}`}
                  id={row.id ? `employee-${row.id}` : undefined}
                  className={
                    highlightedEmployeeId === row.id
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : ''
                  }
                >
                  {/* Name */}
                  <TableCell>
                    {isReadOnly ? (
                      <span className="text-xs sm:text-sm break-words">
                        {row.name}
                      </span>
                    ) : (
                      <div>
                        <Input
                          type="text"
                          value={row.name || ''}
                          onChange={(e) =>
                            handleCellChange(index, 'name', e.target.value)
                          }
                          maxLength={CHARACTER_LIMITS.EMPLOYEE_NAME}
                          className={cn(
                            'h-8 text-sm',
                            row.errors?.name &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          placeholder="Enter name"
                          aria-label={`Name for employee ${index + 1}`}
                          aria-required="true"
                          aria-invalid={!!row.errors?.name}
                          aria-describedby={
                            row.errors?.name ? `error-name-${index}` : undefined
                          }
                        />
                        {row.errors?.name && (
                          <p
                            id={`error-name-${index}`}
                            role="alert"
                            className="text-xs text-destructive mt-1"
                          >
                            {row.errors.name}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    {isReadOnly ? (
                      <span className="text-xs sm:text-sm break-all">
                        {row.email}
                      </span>
                    ) : (
                      <div>
                        <Input
                          type="email"
                          value={row.email || ''}
                          onChange={(e) =>
                            handleCellChange(index, 'email', e.target.value)
                          }
                          maxLength={CHARACTER_LIMITS.EMPLOYEE_EMAIL}
                          className={cn(
                            'h-8 text-sm',
                            row.errors?.email &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          placeholder="Enter email"
                          aria-label={`Email for employee ${index + 1}`}
                          aria-required="true"
                          aria-invalid={!!row.errors?.email}
                          aria-describedby={
                            row.errors?.email
                              ? `error-email-${index}`
                              : undefined
                          }
                        />
                        {row.errors?.email && (
                          <p
                            id={`error-email-${index}`}
                            role="alert"
                            className="text-xs text-destructive mt-1"
                          >
                            {row.errors.email}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="hidden md:table-cell">
                    {isReadOnly ? (
                      <span className="text-sm">{row.phoneNumber}</span>
                    ) : (
                      <div>
                        <Input
                          type="tel"
                          value={row.phoneNumber || ''}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              'phoneNumber',
                              e.target.value
                            )
                          }
                          maxLength={CHARACTER_LIMITS.EMPLOYEE_PHONE}
                          className={cn(
                            'h-8 text-sm',
                            row.errors?.phoneNumber &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          placeholder="Enter phone"
                          aria-label={`Phone number for employee ${index + 1}`}
                          aria-required="true"
                          aria-invalid={!!row.errors?.phoneNumber}
                          aria-describedby={
                            row.errors?.phoneNumber
                              ? `error-phone-${index}`
                              : undefined
                          }
                        />
                        {row.errors?.phoneNumber && (
                          <p
                            id={`error-phone-${index}`}
                            role="alert"
                            className="text-xs text-destructive mt-1"
                          >
                            {row.errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="hidden md:table-cell">
                    {isReadOnly ? (
                      <span className="text-sm">{row.roleTitle || '-'}</span>
                    ) : (
                      <Select
                        value={row.roleId || '__none__'}
                        onValueChange={(value) =>
                          handleCellChange(
                            index,
                            'roleId',
                            value === '__none__' ? null : value
                          )
                        }
                        disabled={loadingRoles}
                      >
                        <SelectTrigger
                          className="w-full h-8 text-sm"
                          aria-label={`Role for employee ${index + 1}`}
                        >
                          <SelectValue placeholder="No role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Manager */}
                  <TableCell className="hidden lg:table-cell">
                    {isReadOnly ? (
                      <span className="text-sm">{row.managerName || '-'}</span>
                    ) : (
                      <Select
                        value={row.managerId || '__none__'}
                        onValueChange={(value) =>
                          handleCellChange(
                            index,
                            'managerId',
                            value === '__none__' ? null : value
                          )
                        }
                      >
                        <SelectTrigger
                          className="w-full h-8 text-sm"
                          aria-label={`Manager for employee ${index + 1}`}
                        >
                          <SelectValue placeholder="No manager" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                          <SelectItem value="__none__">No manager</SelectItem>
                          {employees
                            .filter((emp) => emp.id !== row.id)
                            .map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    {row.isNew ? (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSaveNewEmployee(index)}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onCancelAdd}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : isEditMode ? (
                      <span className="text-xs text-muted-foreground">
                        Edit mode active
                      </span>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEmployee(row.id!)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Save Button */}
      {isEditMode && rows.filter((r) => !r.isNew).length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="default"
            size="lg"
            onClick={handleBulkSave}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Employee?"
        description="This action cannot be undone. This will permanently delete this employee."
        onConfirm={confirmDelete}
      />
    </div>
  )
})
