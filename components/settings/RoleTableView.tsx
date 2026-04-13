'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { pluralize, formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoleDto, RoleTitle, apiClient } from '@/lib/api-client'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'
import {
  showEntityCreatedToast,
  showEntityDeletedToast,
} from '@/lib/utils/notifications'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2, Save, X } from 'lucide-react'

interface RoleRow extends Partial<RoleDto> {
  isNew?: boolean
  isEditing?: boolean
  errors?: {
    name?: string
    title?: string
    description?: string
    responsibilities?: string
  }
}

interface RoleTableViewProps {
  companyId: string
  roles: RoleDto[]
  isEditMode: boolean
  isAddingNew: boolean
  onCancelAdd: () => void
  onRoleAdded: () => void
  onBulkSaveComplete: () => void
  onRoleDeleted: () => void
}

export function RoleTableView({
  companyId,
  roles,
  isEditMode,
  isAddingNew,
  onCancelAdd,
  onRoleAdded,
  onBulkSaveComplete,
  onRoleDeleted,
}: RoleTableViewProps) {
  const [rows, setRows] = useState<RoleRow[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)

  // Initialize rows from roles
  useEffect(() => {
    const roleRows: RoleRow[] = roles.map((role) => ({
      ...role,
      isNew: false,
      isEditing: false,
      errors: {},
    }))

    // Add new row if adding
    if (isAddingNew) {
      roleRows.push({
        id: undefined,
        companyId,
        name: '',
        title: undefined,
        description: '',
        responsibilities: '',
        isNew: true,
        isEditing: true,
        errors: {},
      })
    }

    setRows(roleRows)
  }, [roles, isAddingNew, companyId])

  const validateRow = useCallback((row: RoleRow): boolean => {
    const errors: RoleRow['errors'] = {}
    let isValid = true

    // Name validation
    if (!row.name?.trim()) {
      errors.name = 'Required'
      isValid = false
    } else if (row.name.length > CHARACTER_LIMITS.ROLE_NAME) {
      errors.name = `Max ${CHARACTER_LIMITS.ROLE_NAME} chars`
      isValid = false
    }

    // Title validation
    if (!row.title) {
      errors.title = 'Required'
      isValid = false
    }

    // Description validation (optional but has max length)
    if (
      row.description &&
      row.description.length > CHARACTER_LIMITS.ROLE_DESCRIPTION
    ) {
      errors.description = `Max ${CHARACTER_LIMITS.ROLE_DESCRIPTION} chars`
      isValid = false
    }

    // Responsibilities validation (optional but has max length)
    if (
      row.responsibilities &&
      row.responsibilities.length > CHARACTER_LIMITS.ROLE_RESPONSIBILITIES
    ) {
      errors.responsibilities = `Max ${CHARACTER_LIMITS.ROLE_RESPONSIBILITIES} chars`
      isValid = false
    }

    row.errors = errors
    return isValid
  }, [])

  const handleCellChange = useCallback(
    (index: number, field: keyof RoleRow, value: any) => {
      setRows((prevRows) => {
        const newRows = [...prevRows]
        newRows[index] = { ...newRows[index], [field]: value }
        return newRows
      })
    },
    []
  )

  const handleSaveNewRole = async (index: number) => {
    const row = rows[index]
    if (!validateRow(row)) {
      setRows([...rows]) // Trigger re-render to show errors
      return
    }

    setSaving(true)
    try {
      await apiClient.createRole({
        companyId,
        name: row.name!,
        title: row.title!,
        description: row.description || '',
        responsibilities: row.responsibilities || '',
      })
      showEntityCreatedToast('Role')
      onRoleAdded()
    } catch (error) {
      showErrorToast('Failed to create role', error)
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
      // Update each role individually (no bulk update endpoint for roles)
      const updates = rows.filter((row) => !row.isNew && row.id)
      let successCount = 0
      let failCount = 0

      for (const row of updates) {
        try {
          await apiClient.updateRole(row.id!, {
            name: row.name!,
            title: row.title!,
            description: row.description || '',
            responsibilities: row.responsibilities || '',
          })
          successCount++
        } catch (error) {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Updated ${successCount} role${pluralize(successCount)}`)
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} role${pluralize(failCount)}`)
      }

      onBulkSaveComplete()
    } catch (error) {
      showErrorToast('Failed to save changes', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = useCallback((roleId: string) => {
    setRoleToDelete(roleId)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      await apiClient.deleteRole(roleToDelete)
      showEntityDeletedToast('Role')
      onRoleDeleted()
    } catch (error) {
      showErrorToast('Failed to delete role', error)
    } finally {
      setDeleteConfirmOpen(false)
      setRoleToDelete(null)
    }
  }

  if (rows.length === 0 && !isAddingNew) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No roles found. Click &quot;Add Role&quot; to create one.
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
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px]">
                Description
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[200px]">
                Responsibilities
              </TableHead>
              <TableHead className="min-w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const isReadOnly = !row.isNew && !isEditMode

              return (
                <TableRow key={row.id || `new-${index}`}>
                  {/* Name */}
                  <TableCell>
                    {isReadOnly ? (
                      <span className="text-sm">{row.name}</span>
                    ) : (
                      <div>
                        <Input
                          type="text"
                          value={row.name || ''}
                          onChange={(e) =>
                            handleCellChange(index, 'name', e.target.value)
                          }
                          maxLength={CHARACTER_LIMITS.ROLE_NAME}
                          className={cn(
                            'h-8 text-sm',
                            row.errors?.name &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          placeholder="Role name"
                          aria-label={`Name for role ${index + 1}`}
                          aria-required="true"
                          aria-invalid={!!row.errors?.name}
                        />
                        {row.errors?.name && (
                          <p
                            className="text-xs text-destructive mt-1"
                            role="alert"
                          >
                            {row.errors.name}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    {isReadOnly ? (
                      <span className="text-sm">
                        {row.title ? formatEnumTitleCase(row.title) : '-'}
                      </span>
                    ) : (
                      <div>
                        <Select
                          value={row.title || ''}
                          onValueChange={(value) =>
                            handleCellChange(index, 'title', value as RoleTitle)
                          }
                        >
                          <SelectTrigger
                            className={`w-full text-sm ${row.errors?.title ? 'border-destructive' : ''}`}
                          >
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {Object.values(RoleTitle).map((title) => (
                              <SelectItem key={title} value={title}>
                                {formatEnumTitleCase(title)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.errors?.title && (
                          <p className="text-xs text-destructive mt-1">
                            {row.errors.title}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="hidden md:table-cell">
                    {isReadOnly ? (
                      <span className="text-sm line-clamp-2">
                        {row.description || '-'}
                      </span>
                    ) : (
                      <div>
                        <Textarea
                          value={row.description || ''}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          maxLength={CHARACTER_LIMITS.ROLE_DESCRIPTION}
                          className={cn(
                            'min-h-[60px] text-sm resize-none',
                            row.errors?.description &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          rows={2}
                          placeholder="Description"
                          aria-label={`Description for role ${index + 1}`}
                          aria-invalid={!!row.errors?.description}
                        />
                        {row.errors?.description && (
                          <p
                            className="text-xs text-destructive mt-1"
                            role="alert"
                          >
                            {row.errors.description}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Responsibilities */}
                  <TableCell className="hidden lg:table-cell">
                    {isReadOnly ? (
                      <span className="text-sm line-clamp-2">
                        {row.responsibilities || '-'}
                      </span>
                    ) : (
                      <div>
                        <Textarea
                          value={row.responsibilities || ''}
                          onChange={(e) =>
                            handleCellChange(
                              index,
                              'responsibilities',
                              e.target.value
                            )
                          }
                          maxLength={CHARACTER_LIMITS.ROLE_RESPONSIBILITIES}
                          className={cn(
                            'min-h-[60px] text-sm resize-none',
                            row.errors?.responsibilities &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                          rows={2}
                          placeholder="Responsibilities"
                          aria-label={`Responsibilities for role ${index + 1}`}
                          aria-invalid={!!row.errors?.responsibilities}
                        />
                        {row.errors?.responsibilities && (
                          <p
                            className="text-xs text-destructive mt-1"
                            role="alert"
                          >
                            {row.errors.responsibilities}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex gap-1">
                      {row.isNew ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNewRole(index)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onCancelAdd}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRole(row.id!)}
                          disabled={isEditMode}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Save Button */}
      {isEditMode && rows.some((r) => !r.isNew) && (
        <div className="flex justify-end">
          <Button onClick={handleBulkSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        destructive={true}
      />
    </div>
  )
}
