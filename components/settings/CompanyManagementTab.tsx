'use client'

import React, { useState, useEffect } from 'react'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient, RoleDto, Pillar } from '@/lib/api-client'
import { Checkbox } from '@/components/ui/checkbox'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { toast } from 'sonner'
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

interface CompanyFormData {
  name: string
  address: string
  phoneNumber: string
  email: string
  pillars: Pillar[]
}

const allPillars = Object.values(Pillar)

export function CompanyManagementTab() {
  const { getEntityColorClasses } = useColorScheme()
  const companyClasses = getEntityColorClasses('Company')
  const roleClasses = getEntityColorClasses('Role')

  // Use global selected company from context
  const { selectedCompany, refetchCompanies } = useAppContext()

  // Company roles
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Create new company state
  const [isCreating, setIsCreating] = useState(false)
  const [newCompanyData, setNewCompanyData] = useState<CompanyFormData>({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    pillars: [],
  })
  const [creatingCompany, setCreatingCompany] = useState(false)

  // Edit company state
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<CompanyFormData>({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    pillars: [],
  })
  const [savingCompany, setSavingCompany] = useState(false)

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

  const handleCreateCompany = async () => {
    if (!newCompanyData.name.trim()) {
      toast.error('Company name is required')
      return
    }
    if (!newCompanyData.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!newCompanyData.phoneNumber.trim()) {
      toast.error('Phone number is required')
      return
    }
    if (newCompanyData.pillars.length === 0) {
      toast.error('At least one pillar is required')
      return
    }

    setCreatingCompany(true)
    try {
      await apiClient.createCompany({
        name: newCompanyData.name,
        address: newCompanyData.address || undefined,
        phoneNumber: newCompanyData.phoneNumber,
        email: newCompanyData.email,
        pillars: newCompanyData.pillars,
      })
      showEntityCreatedToast('Company')
      setIsCreating(false)
      setNewCompanyData({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        pillars: [],
      })
      await refetchCompanies()
    } catch (error) {
      showErrorToast('Failed to create company', error)
    } finally {
      setCreatingCompany(false)
    }
  }

  const handleEditCompany = () => {
    if (!selectedCompany) return
    setEditFormData({
      name: selectedCompany.name,
      address: selectedCompany.address || '',
      phoneNumber: selectedCompany.phoneNumber || '',
      email: selectedCompany.email || '',
      pillars: selectedCompany.pillars || [],
    })
    setIsEditing(true)
  }

  const handleSaveCompany = async () => {
    if (!selectedCompany) return
    if (!editFormData.name.trim()) {
      toast.error('Company name is required')
      return
    }
    if (editFormData.pillars.length === 0) {
      toast.error('At least one pillar is required')
      return
    }

    setSavingCompany(true)
    try {
      await apiClient.updateCompany(selectedCompany.id, {
        name: editFormData.name,
        address: editFormData.address || undefined,
        phoneNumber: editFormData.phoneNumber,
        email: editFormData.email,
        pillars: editFormData.pillars,
      })
      showEntityUpdatedToast('Company')
      setIsEditing(false)
      await refetchCompanies()
    } catch (error) {
      showErrorToast('Failed to update company', error)
    } finally {
      setSavingCompany(false)
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">Name *</Label>
                <Input
                  id="new-name"
                  value={newCompanyData.name}
                  onChange={(e) =>
                    setNewCompanyData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  maxLength={CHARACTER_LIMITS.COMPANY_NAME}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newCompanyData.email}
                  onChange={(e) =>
                    setNewCompanyData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  maxLength={CHARACTER_LIMITS.COMPANY_EMAIL}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone *</Label>
                <Input
                  id="new-phone"
                  value={newCompanyData.phoneNumber}
                  onChange={(e) =>
                    setNewCompanyData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  maxLength={CHARACTER_LIMITS.COMPANY_PHONE}
                  placeholder="+1-555-123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-address">Address</Label>
                <Input
                  id="new-address"
                  value={newCompanyData.address}
                  onChange={(e) =>
                    setNewCompanyData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  maxLength={CHARACTER_LIMITS.COMPANY_ADDRESS}
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Organizational Pillars *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                  {allPillars.map((pillar) => (
                    <div key={pillar} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-${pillar}`}
                        checked={newCompanyData.pillars.includes(pillar)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewCompanyData((prev) => ({
                              ...prev,
                              pillars: [...prev.pillars, pillar],
                            }))
                          } else {
                            setNewCompanyData((prev) => ({
                              ...prev,
                              pillars: prev.pillars.filter((p) => p !== pillar),
                            }))
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
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateCompany} disabled={creatingCompany}>
                {creatingCompany ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewCompanyData({
                    name: '',
                    address: '',
                    phoneNumber: '',
                    email: '',
                    pillars: [],
                  })
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
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
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      maxLength={CHARACTER_LIMITS.COMPANY_NAME}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      maxLength={CHARACTER_LIMITS.COMPANY_EMAIL}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editFormData.phoneNumber}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      maxLength={CHARACTER_LIMITS.COMPANY_PHONE}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      maxLength={CHARACTER_LIMITS.COMPANY_ADDRESS}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Organizational Pillars *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                      {allPillars.map((pillar) => (
                        <div
                          key={pillar}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-${pillar}`}
                            checked={editFormData.pillars.includes(pillar)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditFormData((prev) => ({
                                  ...prev,
                                  pillars: [...prev.pillars, pillar],
                                }))
                              } else {
                                setEditFormData((prev) => ({
                                  ...prev,
                                  pillars: prev.pillars.filter(
                                    (p) => p !== pillar
                                  ),
                                }))
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
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCompany} disabled={savingCompany}>
                    {savingCompany ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
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
