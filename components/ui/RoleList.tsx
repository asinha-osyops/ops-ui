'use client'

import { useEffect } from 'react'
import { RoleDto } from '@/lib/api-client'
import { pluralize } from '@/lib/utils/format-helpers'
import { Button } from './button'
import { Spinner } from './spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './empty'
import { Card, CardHeader, CardContent, CardFooter } from './card'
import { Badge } from './badge'
import { downloadAsJSON, downloadAsText } from '@/lib/utils/download'
import { formatRoleAsText } from '@/lib/utils/text-formatters'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { Building2 } from 'lucide-react'

interface RoleListProps {
  roles: RoleDto[]
  loading: boolean
  highlightedId?: string
  onDeleteRole: (roleId: string) => void
  onDeleteAllRoles: () => void
}

export function RoleList({
  roles,
  loading,
  highlightedId,
  onDeleteRole,
  onDeleteAllRoles,
}: RoleListProps) {
  const { getRoleTitleColor } = useColorScheme()

  // Scroll to highlighted role
  useEffect(() => {
    if (highlightedId) {
      setTimeout(() => {
        const element = document.getElementById(`role-${highlightedId}`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [highlightedId])

  const handleDownloadJSON = (role: RoleDto) => {
    const data = {
      name: role.name,
      title: role.title,
      description: role.description,
      responsibilities: role.responsibilities,
    }
    downloadAsJSON(data, role.name, `role-${role.id}`)
  }

  const handleDownloadText = (role: RoleDto) => {
    const textContent = formatRoleAsText({
      name: role.name,
      title: role.title,
      description: role.description,
      responsibilities: role.responsibilities,
    })
    downloadAsText(textContent, role.name, `role-${role.id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading roles...</p>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No roles found</EmptyTitle>
          <EmptyDescription>
            Create your first role to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Delete All button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-medium text-foreground">
          {roles.length} Role{pluralize(roles.length)}
        </h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteAllRoles}
          className="w-full sm:w-auto"
        >
          Delete All Roles
        </Button>
      </div>

      {/* Role Cards */}
      <div className="space-y-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            id={`role-${role.id}`}
            entityType="Role"
            className={
              highlightedId === role.id ? 'ring-2 ring-primary shadow-lg' : ''
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-medium text-foreground break-words">
                    {role.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {role.companyName}
                      </span>
                    </Badge>
                    {role.title && (
                      <Badge
                        chartColor={getRoleTitleColor(role.title)}
                        className="text-xs"
                      >
                        {role.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Role Details Grid */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground break-words">
                    {role.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Responsibilities
                  </p>
                  <p className="text-sm text-foreground break-words">
                    {role.responsibilities}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadJSON(role)
                }}
              >
                Download JSON
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadText(role)
                }}
              >
                Download Text
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteRole(role.id)
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
