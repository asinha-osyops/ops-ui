'use client'

import { useState } from 'react'
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
import { ScrollArea } from './scroll-area'
import {
  CreateEmployeeRequestDto,
  EmployeeUpdateItem,
  EmployeeDto,
} from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { toast } from 'sonner'
import { useRoles } from '@/lib/hooks/useRoles'

interface TableRow {
  id?: string // Only for update mode
  name: string
  phoneNumber: string
  email: string
  roleId: string | null
  managerId: string | null
  errors: {
    name?: string
    phoneNumber?: string
    email?: string
  }
}

interface BulkEmployeeTableEditorProps {
  mode: 'create' | 'update'
  companyId: string
  employees?: EmployeeDto[]
  onSubmit: (data: CreateEmployeeRequestDto[] | EmployeeUpdateItem[]) => void
}

export function BulkEmployeeTableEditor({
  mode,
  companyId,
  employees = [],
  onSubmit,
}: BulkEmployeeTableEditorProps) {
  const { roles, loadingRoles } = useRoles(companyId)

  const getInitialRows = (): TableRow[] => {
    if (mode === 'update' && employees.length > 0) {
      // Pre-fill with existing employees
      return employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        phoneNumber: emp.phoneNumber,
        email: emp.email,
        roleId: emp.roleId,
        managerId: emp.managerId,
        errors: {},
      }))
    } else {
      // Start with 3 empty rows for create mode
      return [
        {
          name: '',
          phoneNumber: '',
          email: '',
          roleId: null,
          managerId: null,
          errors: {},
        },
        {
          name: '',
          phoneNumber: '',
          email: '',
          roleId: null,
          managerId: null,
          errors: {},
        },
        {
          name: '',
          phoneNumber: '',
          email: '',
          roleId: null,
          managerId: null,
          errors: {},
        },
      ]
    }
  }

  const [rows, setRows] = useState<TableRow[]>(getInitialRows())

  const validateRow = (row: TableRow): boolean => {
    const errors: TableRow['errors'] = {}
    let isValid = true

    if (!row.name.trim()) {
      errors.name = 'Required'
      isValid = false
    } else if (row.name.length > CHARACTER_LIMITS.EMPLOYEE_NAME) {
      errors.name = `Max ${CHARACTER_LIMITS.EMPLOYEE_NAME} chars`
      isValid = false
    }

    if (!row.phoneNumber.trim()) {
      errors.phoneNumber = 'Required'
      isValid = false
    } else {
      try {
        if (
          !isValidPhoneNumber(row.phoneNumber) &&
          !isValidPhoneNumber(row.phoneNumber, 'US')
        ) {
          errors.phoneNumber = 'Invalid'
          isValid = false
        }
      } catch {
        errors.phoneNumber = 'Invalid'
        isValid = false
      }
    }

    if (!row.email.trim()) {
      errors.email = 'Required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.email = 'Invalid'
      isValid = false
    } else if (row.email.length > CHARACTER_LIMITS.EMPLOYEE_EMAIL) {
      errors.email = `Max ${CHARACTER_LIMITS.EMPLOYEE_EMAIL} chars`
      isValid = false
    }

    row.errors = errors
    return isValid
  }

  const handleSubmit = () => {
    // Validate all rows
    const validatedRows = rows.map((row) => {
      validateRow(row)
      return row
    })

    setRows([...validatedRows])

    // Check if all rows are valid
    const hasErrors = validatedRows.some(
      (row) => Object.keys(row.errors).length > 0
    )
    if (hasErrors) {
      toast.error('Validation errors found', {
        description: 'Please fix all errors before submitting',
      })
      return
    }

    // Filter out empty rows (for create mode)
    const nonEmptyRows = validatedRows.filter(
      (row) => row.name || row.phoneNumber || row.email
    )

    if (nonEmptyRows.length === 0) {
      toast.error('No employees to submit', {
        description: 'Please add at least one employee',
      })
      return
    }

    if (mode === 'create') {
      const createData: CreateEmployeeRequestDto[] = nonEmptyRows.map(
        (row) => ({
          companyId,
          name: row.name,
          phoneNumber: row.phoneNumber,
          email: row.email,
          roleId: row.roleId,
          managerId: row.managerId,
        })
      )
      onSubmit(createData)
    } else {
      const updateData: EmployeeUpdateItem[] = nonEmptyRows.map((row) => ({
        id: row.id!,
        data: {
          name: row.name,
          phoneNumber: row.phoneNumber,
          email: row.email,
          roleId: row.roleId,
          managerId: row.managerId,
        },
      }))
      onSubmit(updateData)
    }
  }

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        name: '',
        phoneNumber: '',
        email: '',
        roleId: null,
        managerId: null,
        errors: {},
      },
    ])
  }

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) {
      toast.warning('Must have at least one row')
      return
    }
    setRows(rows.filter((_, i) => i !== index))
  }

  const handleFieldChange = (
    index: number,
    field: keyof TableRow,
    value: string | null
  ) => {
    const newRows = [...rows]
    ;(newRows[index] as any)[field] = value
    // Clear error for this field when user types
    delete newRows[index].errors[field as keyof TableRow['errors']]
    setRows(newRows)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Table Editor</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === 'create'
              ? 'Fill in employee details row by row'
              : 'Edit existing employee data'}
          </p>
        </div>
        {mode === 'create' && (
          <Button variant="default" size="sm" onClick={handleAddRow}>
            Add Row
          </Button>
        )}
      </div>

      {/* Table Container */}
      <ScrollArea className="h-96 rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead className="min-w-[50px]">#</TableHead>
              <TableHead className="min-w-[150px]">Name *</TableHead>
              <TableHead className="min-w-[150px]">Phone *</TableHead>
              <TableHead className="min-w-[200px]">Email *</TableHead>
              <TableHead className="min-w-[150px]">Role</TableHead>
              <TableHead className="min-w-[150px]">Manager</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">{index + 1}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleFieldChange(index, 'name', e.target.value)
                    }
                    className={cn(
                      'h-8 text-sm',
                      row.errors.name &&
                        'border-destructive focus-visible:ring-destructive'
                    )}
                    placeholder="Name"
                    maxLength={CHARACTER_LIMITS.EMPLOYEE_NAME}
                    aria-label={`Name for row ${index + 1}`}
                    aria-required="true"
                    aria-invalid={!!row.errors.name}
                    aria-describedby={
                      row.errors.name ? `bulk-error-name-${index}` : undefined
                    }
                  />
                  {row.errors.name && (
                    <span
                      id={`bulk-error-name-${index}`}
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {row.errors.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="tel"
                    value={row.phoneNumber}
                    onChange={(e) =>
                      handleFieldChange(index, 'phoneNumber', e.target.value)
                    }
                    className={cn(
                      'h-8 text-sm',
                      row.errors.phoneNumber &&
                        'border-destructive focus-visible:ring-destructive'
                    )}
                    placeholder="+1-555-123-4567"
                    maxLength={CHARACTER_LIMITS.EMPLOYEE_PHONE}
                    aria-label={`Phone number for row ${index + 1}`}
                    aria-required="true"
                    aria-invalid={!!row.errors.phoneNumber}
                    aria-describedby={
                      row.errors.phoneNumber
                        ? `bulk-error-phone-${index}`
                        : undefined
                    }
                  />
                  {row.errors.phoneNumber && (
                    <span
                      id={`bulk-error-phone-${index}`}
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {row.errors.phoneNumber}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="email"
                    value={row.email}
                    onChange={(e) =>
                      handleFieldChange(index, 'email', e.target.value)
                    }
                    className={cn(
                      'h-8 text-sm',
                      row.errors.email &&
                        'border-destructive focus-visible:ring-destructive'
                    )}
                    placeholder="email@company.com"
                    maxLength={CHARACTER_LIMITS.EMPLOYEE_EMAIL}
                    aria-label={`Email for row ${index + 1}`}
                    aria-required="true"
                    aria-invalid={!!row.errors.email}
                    aria-describedby={
                      row.errors.email ? `bulk-error-email-${index}` : undefined
                    }
                  />
                  {row.errors.email && (
                    <span
                      id={`bulk-error-email-${index}`}
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {row.errors.email}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={row.roleId || '__none__'}
                    onValueChange={(value) =>
                      handleFieldChange(
                        index,
                        'roleId',
                        value === '__none__' ? null : value
                      )
                    }
                    disabled={loadingRoles}
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      aria-label={`Role for row ${index + 1}`}
                    >
                      <SelectValue placeholder="No Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.managerId || '__none__'}
                    onValueChange={(value) =>
                      handleFieldChange(
                        index,
                        'managerId',
                        value === '__none__' ? null : value
                      )
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      aria-label={`Manager for row ${index + 1}`}
                    >
                      <SelectValue placeholder="No Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Manager</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRow(index)}
                    disabled={rows.length <= 1}
                    aria-label={`Delete row ${index + 1}`}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {rows.length} row{pluralize(rows.length)}
        </p>
        <Button variant="default" onClick={handleSubmit}>
          {mode === 'create' ? 'Create Employees' : 'Update Employees'}
        </Button>
      </div>
    </div>
  )
}
