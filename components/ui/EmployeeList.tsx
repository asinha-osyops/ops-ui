'use client'

import { EmployeeDto } from '@/lib/api-client'
import { pluralize } from '@/lib/utils/format-helpers'
import { Button } from './button'
import { Spinner } from './spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './empty'
import { Card, CardHeader, CardContent, CardFooter } from './card'
import { Avatar, AvatarFallback } from './avatar'
import { Badge } from './badge'
import { DetailField } from './DetailField'
import { downloadAsJSON, downloadAsText } from '@/lib/utils/download'
import { formatEmployeeAsText } from '@/lib/utils/text-formatters'

interface EmployeeListProps {
  employees: EmployeeDto[]
  loading: boolean
  companyId: string
  onDeleteEmployee: (employeeId: string) => void
  onDeleteAllEmployees: () => void
}

export function EmployeeList({
  employees,
  loading,
  companyId,
  onDeleteEmployee,
  onDeleteAllEmployees,
}: EmployeeListProps) {
  const handleDownloadJSON = (employee: EmployeeDto) => {
    const data = {
      name: employee.name,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      roleTitle: employee.roleTitle,
      managerName: employee.managerName,
      createdAt: employee.createdAt,
    }
    downloadAsJSON(data, employee.name, `employee-${employee.id}`)
  }

  const handleDownloadText = (employee: EmployeeDto) => {
    const textContent = formatEmployeeAsText(employee)
    downloadAsText(textContent, employee.name, `employee-${employee.id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading employees...</p>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No employees found</EmptyTitle>
          <EmptyDescription>
            Add your first employee to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Delete All button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">
          {employees.length} Employee{pluralize(employees.length)}
        </h3>
        <Button variant="destructive" size="sm" onClick={onDeleteAllEmployees}>
          Delete All Employees
        </Button>
      </div>

      {/* Employee Cards */}
      <div className="space-y-3">
        {employees.map((employee) => {
          // Generate initials from name
          const initials = employee.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-medium text-foreground">
                        {employee.name}
                      </h4>
                      {employee.roleTitle && (
                        <Badge variant="secondary" className="mt-1">
                          {employee.roleTitle}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Employee Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DetailField label="Email" value={employee.email} />
                  <DetailField
                    label="Phone Number"
                    value={employee.phoneNumber}
                  />
                  {employee.managerName && (
                    <DetailField
                      label="Manager"
                      value={employee.managerName}
                      className="md:col-span-2"
                    />
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadJSON(employee)
                  }}
                >
                  Download JSON
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadText(employee)
                  }}
                >
                  Download Text
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteEmployee(employee.id)
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
