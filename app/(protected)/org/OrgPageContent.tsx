'use client'

import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { EmployeeManagementSection } from '@/components/ui/EmployeeManagementSection'
import { PageLayout } from '@/components/PageLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useCompanyFetch } from '@/lib/hooks/useCompanyFetch'
import { useAppContext } from '@/lib/app-context'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { useEmployeeManagement } from '@/lib/hooks/useEmployeeManagement'
import { useCompanyAutoSelect } from '@/lib/hooks/useCompanyAutoSelect'
import { CompanyRequiredAlert } from '@/components/ui/CompanyRequiredAlert'

// Lazy load the heavy graph view component
const OrgChartGraphView = lazy(() =>
  import('@/components/org/OrgChartGraphView').then((m) => ({
    default: m.OrgChartGraphView,
  }))
)

export function OrgPageContent() {
  const { getEntityColorClasses } = useColorScheme()
  const employeeClasses = getEntityColorClasses('Employee')

  // Use global company state
  const { selectedCompany, setSelectedCompany, refreshEmployees } =
    useAppContext()

  // Fetch companies using the hook
  const { companies, loading: loadingCompanies } = useCompanyFetch()

  // Auto-select company from URL anchor or first company
  const { employeeAnchorId } = useCompanyAutoSelect({
    companies,
    loadingCompanies,
    selectedCompany,
    setSelectedCompany,
  })

  // Use employee management hook
  const employeeManagement = useEmployeeManagement({
    companyId: selectedCompany?.id,
    onRefreshGlobal: refreshEmployees,
  })

  return (
    <PageLayout
      title="Org Management"
      titleClassName={employeeClasses.text}
      breadcrumbs={[{ label: 'Org' }]}
    >
      {loadingCompanies ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : companies.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No companies found</EmptyTitle>
            <EmptyDescription>
              Create a company in Settings to manage employees.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : selectedCompany ? (
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="graph">Org Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="space-y-6">
              <EmployeeManagementSection
                companyId={selectedCompany.id}
                employees={employeeManagement.employees}
                loadingEmployees={employeeManagement.loadingEmployees}
                isBulkEditMode={employeeManagement.isBulkEditMode}
                isAddingEmployee={employeeManagement.isAddingEmployee}
                deleteAllEmployeesOpen={
                  employeeManagement.deleteAllEmployeesOpen
                }
                highlightedEmployeeId={employeeAnchorId}
                titleClassName={employeeClasses.text}
                showEmployeeCount={true}
                showIcon={true}
                onAddEmployee={() =>
                  employeeManagement.setIsAddingEmployee(true)
                }
                onToggleBulkEdit={employeeManagement.toggleBulkEditMode}
                onDeleteAll={employeeManagement.handleDeleteAllEmployees}
                onCancelAdd={employeeManagement.handleCancelAdd}
                onEmployeeAdded={employeeManagement.handleEmployeeAdded}
                onBulkSaveComplete={employeeManagement.handleBulkSaveComplete}
                onDeleteAllOpenChange={
                  employeeManagement.setDeleteAllEmployeesOpen
                }
                onConfirmDeleteAll={
                  employeeManagement.confirmDeleteAllEmployees
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="graph">
            <Suspense
              fallback={
                <div className="h-[600px] flex flex-col items-center justify-center gap-3 bg-card rounded-lg border border-border">
                  <Spinner className="size-8" />
                  <p className="text-sm text-muted-foreground">
                    Loading org chart...
                  </p>
                </div>
              }
            >
              <OrgChartGraphView companyId={selectedCompany.id} />
            </Suspense>
          </TabsContent>
        </Tabs>
      ) : (
        <CompanyRequiredAlert />
      )}
    </PageLayout>
  )
}
