'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { apiClient, RoleDto, Pillar } from '@/lib/api-client'
import { Checkbox } from '@/components/ui/checkbox'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { showErrorToast } from '@/lib/utils/error-handling'
import {
  showEntityCreatedToast,
  showEntityUpdatedToast,
  showEntityDeletedToast,
  showLoadFailedToast,
} from '@/lib/utils/notifications'
import { Plus, Building2, Save, X, Trash2, UserCircle } from 'lucide-react'
import { RoleTableView } from './RoleTableView'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Spinner } from '@/components/ui/spinner'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { Badge } from '@/components/ui/badge'
import { useAppContext } from '@/lib/app-context'
import { companySchema, type CompanyFormValues } from '@/lib/schemas/company'

const allPillars = Object.values(Pillar)

const defaultFormValues: CompanyFormValues = {
  name: '',
  address: '',
  phoneNumber: '',
  email: '',
  pillars: [],
}

export function CompanyManagementTab() {
  const { getEntityColorClasses } = useColorScheme()
  const companyClasses = getEntityColorClasses('Company')
  const roleClasses = getEntityColorClasses('Role')

  // Use global selected company from context
  const { selectedCompany, refetchCompanies } = useAppContext()

  // Company roles
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Create new company form
  const [isCreating, setIsCreating] = useState(false)
  const createForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: defaultFormValues,
  })

  // Edit company form
  const [isEditing, setIsEditing] = useState(false)
  const editForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: defaultFormValues,
  })

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Role management state
  const [roleEditMode, setRoleEditMode] = useState(false)
  const [roleAddMode, setRoleAddMode] = useState(false)

  // Fetch roles when company changes
  useEffect(() => {
    if (selectedCompany) {
      fetchRoles()
      setIsEditing(false)
      setRoleEditMode(false)
      setRoleAddMode(false)
    } else {
      setRoles([])
    }
  }, [selectedCompany?.id])

  const fetchRoles = async () => {
    if (!selectedCompany) return
    setLoadingRoles(true)
    try {
      const fetchedRoles = await apiClient.getRoles(selectedCompany.id)
      setRoles(fetchedRoles)
    } catch (error) {
      showLoadFailedToast('Role', error)
    } finally {
      setLoadingRoles(false)
    }
  }

  const handleCreateCompany = async (data: CompanyFormValues) => {
    try {
      await apiClient.createCompany({
        name: data.name,
        address: data.address || undefined,
        phoneNumber: data.phoneNumber,
        email: data.email,
        pillars: data.pillars,
      })
      showEntityCreatedToast('Company')
      setIsCreating(false)
      createForm.reset(defaultFormValues)
      await refetchCompanies()
    } catch (error) {
      showErrorToast('Failed to create company', error)
    }
  }

  const handleEditCompany = () => {
    if (!selectedCompany) return
    editForm.reset({
      name: selectedCompany.name,
      address: selectedCompany.address || '',
      phoneNumber: selectedCompany.phoneNumber || '',
      email: selectedCompany.email || '',
      pillars: selectedCompany.pillars || [],
    })
    setIsEditing(true)
  }

  const handleSaveCompany = async (data: CompanyFormValues) => {
    if (!selectedCompany) return
    try {
      await apiClient.updateCompany(selectedCompany.id, {
        name: data.name,
        address: data.address || undefined,
        phoneNumber: data.phoneNumber,
        email: data.email,
        pillars: data.pillars,
      })
      showEntityUpdatedToast('Company')
      setIsEditing(false)
      await refetchCompanies()
    } catch (error) {
      showErrorToast('Failed to update company', error)
    }
  }

  const handleDeleteCompany = () => {
    if (!selectedCompany) return
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteCompany = async () => {
    if (!selectedCompany) return

    try {
      await apiClient.deleteCompany(selectedCompany.id)
      showEntityDeletedToast('Company')
      await refetchCompanies()
    } catch (error) {
      showErrorToast('Failed to delete company', error)
    } finally {
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${companyClasses.text}`}>
          Company Details
        </h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Create New Company Form */}
      {isCreating && (
        <Card className={`border-l-4 ${companyClasses.borderL}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              New Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateCompany)}
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
                          <Input
                            placeholder="Company name"
                            maxLength={CHARACTER_LIMITS.COMPANY_NAME}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@company.com"
                            maxLength={CHARACTER_LIMITS.COMPANY_EMAIL}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1-555-123-4567"
                            maxLength={CHARACTER_LIMITS.COMPANY_PHONE}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main St, City, State"
                            maxLength={CHARACTER_LIMITS.COMPANY_ADDRESS}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="pillars"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Organizational Pillars *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                          {allPillars.map((pillar) => (
                            <div
                              key={pillar}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`new-${pillar}`}
                                checked={field.value.includes(pillar)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, pillar])
                                  } else {
                                    field.onChange(
                                      field.value.filter(
                                        (p: Pillar) => p !== pillar
                                      )
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`new-${pillar}`}
                                className="cursor-pointer"
                              >
                                {formatEnumTitleCase(pillar)}
                              </Label>
                            </div>
                          ))}
                        </div>
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
                      createForm.reset(defaultFormValues)
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

      {/* Company Details Card */}
      {selectedCompany ? (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className={`h-5 w-5 ${companyClasses.text}`} />
                {selectedCompany.name}
              </CardTitle>
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditCompany}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteCompany}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Details */}
            {isEditing ? (
              <Form {...editForm}>
                <form
                  onSubmit={editForm.handleSubmit(handleSaveCompany)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={CHARACTER_LIMITS.COMPANY_NAME}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              maxLength={CHARACTER_LIMITS.COMPANY_EMAIL}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={CHARACTER_LIMITS.COMPANY_PHONE}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={CHARACTER_LIMITS.COMPANY_ADDRESS}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="pillars"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Organizational Pillars *</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                            {allPillars.map((pillar) => (
                              <div
                                key={pillar}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`edit-${pillar}`}
                                  checked={field.value.includes(pillar)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, pillar])
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (p: Pillar) => p !== pillar
                                        )
                                      )
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`edit-${pillar}`}
                                  className="cursor-pointer"
                                >
                                  {formatEnumTitleCase(pillar)}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={editForm.formState.isSubmitting}
                    >
                      {editForm.formState.isSubmitting ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="mt-1">{selectedCompany.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="mt-1">{selectedCompany.phoneNumber || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs">
                    Address
                  </Label>
                  <p className="mt-1">{selectedCompany.address || '-'}</p>
                </div>
                {selectedCompany.pillars &&
                  selectedCompany.pillars.length > 0 && (
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground text-xs">
                        Pillars
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCompany.pillars.map((pillar) => (
                          <Badge key={pillar} variant="secondary">
                            {formatEnumTitleCase(pillar)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Roles Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-medium flex items-center gap-2 ${roleClasses.text}`}
                >
                  <UserCircle className="h-5 w-5" />
                  Roles ({roles.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRoleAddMode(true)}
                    disabled={roleAddMode}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Role
                  </Button>
                  {roles.length > 0 && (
                    <Button
                      size="sm"
                      variant={roleEditMode ? 'default' : 'outline'}
                      onClick={() => setRoleEditMode(!roleEditMode)}
                    >
                      {roleEditMode ? 'Done Editing' : 'Bulk Edit'}
                    </Button>
                  )}
                </div>
              </div>

              {loadingRoles ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <RoleTableView
                  companyId={selectedCompany.id}
                  roles={roles}
                  isEditMode={roleEditMode}
                  isAddingNew={roleAddMode}
                  onCancelAdd={() => setRoleAddMode(false)}
                  onRoleAdded={() => {
                    setRoleAddMode(false)
                    fetchRoles()
                  }}
                  onBulkSaveComplete={() => {
                    setRoleEditMode(false)
                    fetchRoles()
                  }}
                  onRoleDeleted={fetchRoles}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Select a company from the sidebar to view details
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Company"
        description={`Are you sure you want to delete "${selectedCompany?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDeleteCompany}
        destructive={true}
      />
    </div>
  )
}
