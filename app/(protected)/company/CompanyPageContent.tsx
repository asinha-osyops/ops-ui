'use client'

import { useRouter } from 'next/navigation'
import { CompanyDto } from '@/lib/api-client'
import { Route } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { LoadableContent } from '@/components/ui/LoadableContent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailsCard } from '@/components/ui/DetailsCard'
import { EmployeeManagementSection } from '@/components/ui/EmployeeManagementSection'
import { PageLayout } from '@/components/PageLayout'
import { formatCompanyAsText } from '@/lib/utils/text-formatters'
import { useDownload } from '@/lib/hooks/useDownload'
import { useCompanyFetch } from '@/lib/hooks/useCompanyFetch'
import { useAppContext } from '@/lib/app-context'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { useEmployeeManagement } from '@/lib/hooks/useEmployeeManagement'
import { useCompanyAutoSelect } from '@/lib/hooks/useCompanyAutoSelect'

export function CompanyPageContent() {
  const router = useRouter()
  const { getEntityColorClasses, getEntityButtonClasses } = useColorScheme()
  const companyClasses = getEntityColorClasses('Company')
  const companyButtonClasses = getEntityButtonClasses('Company')

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

  // Custom hooks
  const { handleDownloadJSON, handleDownloadText } = useDownload<CompanyDto>(
    'company',
    formatCompanyAsText,
    (company) => ({
      name: company.name,
      address: company.address,
      phoneNumber: company.phoneNumber,
      email: company.email,
      createdAt: company.createdAt,
    }),
    (company) => company.name
  )

  return (
    <PageLayout
      title="Org Management"
      titleClassName={companyClasses.text}
      breadcrumbs={[{ label: 'Companies' }]}
      headerActions={
        <Button
          onClick={() => router.push(Route.COMPANY_CREATE)}
          className={companyButtonClasses}
        >
          Create New Company
        </Button>
      }
    >
      <LoadableContent
        loading={loadingCompanies}
        loadingMessage="Loading companies..."
        isEmpty={companies.length === 0}
        emptyTitle="No companies found"
        emptyDescription="Create your first company to get started."
      >
        <>
          {/* Main Display Section */}
          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Details */}
              <DetailsCard
                title="Company Details"
                items={[
                  { label: 'Name', value: selectedCompany.name },
                  { label: 'Address', value: selectedCompany.address },
                  { label: 'Phone Number', value: selectedCompany.phoneNumber },
                  { label: 'Email', value: selectedCompany.email },
                  {
                    label: 'CEO',
                    value: selectedCompany.ceoName,
                    condition: !!selectedCompany.ceoName,
                  },
                  {
                    label: 'Point of Contact',
                    value: selectedCompany.pointOfContactName,
                    condition: !!selectedCompany.pointOfContactName,
                  },
                  {
                    label: 'Created At',
                    value: new Date(
                      selectedCompany.createdAt
                    ).toLocaleDateString(),
                  },
                ]}
              />

              {/* Company Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Company Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadJSON(selectedCompany)}
                    >
                      Download as JSON
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadText(selectedCompany)}
                    >
                      Download as Text
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Employees Section */}
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
                showEmployeeCount={false}
                showIcon={false}
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
          )}

          {!selectedCompany && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Select a company from the sidebar to view details
              </p>
            </div>
          )}
        </>
      </LoadableContent>
    </PageLayout>
  )
}
