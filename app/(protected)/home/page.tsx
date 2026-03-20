'use client'

// Prevent static generation for this page
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Route } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiClient, SopDto, LogDto, LogFileDto } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, FileBox, Users } from 'lucide-react'
import { useAppContext } from '@/lib/app-context'
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { useAuth } from '@/lib/auth-context'
import { SystemStatusQuickView } from '@/components/admin/SystemStatusQuickView'
import { LogStatisticsWidget } from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const {
    selectedCompany,
    sops: sopsMap,
    isLoadingSops,
    logs: logsMap,
    isLoadingLogs,
    employees: employeesMap,
    isLoadingEmployees,
  } = useAppContext()
  const { getEntityColorClasses } = useColorScheme()

  // Convert Maps to Arrays
  const sops = Array.from(sopsMap.values())
  const logs = Array.from(logsMap.values())
  const employees = Array.from(employeesMap.values())

  // Unified loading state
  const loading = isLoadingSops || isLoadingLogs || isLoadingEmployees

  // Get color classes using utility
  const sopClasses = getEntityColorClasses('SOP')
  const logClasses = getEntityColorClasses('Log')
  const employeeClasses = getEntityColorClasses('Employee')

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {selectedCompany ? `${selectedCompany.name} Overview` : 'Overview'}
          </h1>
        </div>

        {/* Admin System Status Widget */}
        {isAdmin && (
          <div className="mb-6 md:mb-8">
            <SystemStatusQuickView />
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
          <Card
            className={`border-l-4 ${sopClasses.borderL} shadow-accent-md hover:shadow-accent-lg transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total SOPs
              </CardTitle>
              <FileText className={`h-4 w-4 ${sopClasses.textOpacity}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className={`text-3xl font-bold ${sopClasses.text}`}>
                    {sops.length}
                  </div>
                  <Button
                    variant="link"
                    className={`px-0 mt-2 h-auto ${sopClasses.text} ${sopClasses.textHover}`}
                    onClick={() => router.push(Route.SOP_HOME)}
                  >
                    View All SOPs →
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card
            className={`border-l-4 ${logClasses.borderL} shadow-accent-md hover:shadow-accent-lg transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Log Files
              </CardTitle>
              <FileBox className={`h-4 w-4 ${logClasses.textOpacity}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className={`text-3xl font-bold ${logClasses.text}`}>
                    {logs.length}
                  </div>
                  <Button
                    variant="link"
                    className={`px-0 mt-2 h-auto ${logClasses.text} ${logClasses.textHover}`}
                    onClick={() => router.push(Route.LOG_HOME)}
                  >
                    View All Logs →
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card
            className={`border-l-4 ${employeeClasses.borderL} shadow-accent-md hover:shadow-accent-lg transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Employees
              </CardTitle>
              <Users className={`h-4 w-4 ${employeeClasses.textOpacity}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className={`text-3xl font-bold ${employeeClasses.text}`}>
                    {employees.length}
                  </div>
                  <Button
                    variant="link"
                    className={`px-0 mt-2 h-auto ${employeeClasses.text} ${employeeClasses.textHover}`}
                    onClick={() => router.push(Route.ORG_HOME)}
                  >
                    View Org →
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent SOPs Table */}
        <Card className="shadow-accent">
          <CardHeader className="border-b border-border p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Recent SOPs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 md:pt-6">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sops.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No SOPs found. Create your first SOP to get started.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6 hidden sm:table-cell">
                        Company
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6 hidden md:table-cell">
                        Created
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.slice(0, 10).map((sop) => (
                      <TableRow
                        key={sop.id}
                        className={`cursor-pointer ${sopClasses.bgHover} transition-colors border-b border-border/50`}
                        onClick={() => router.push(Route.SOP_HOME)}
                      >
                        <TableCell className="font-medium text-foreground text-sm px-4 md:px-6">
                          {sop.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm px-4 md:px-6 hidden sm:table-cell">
                          {sop.companyName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs md:text-sm px-4 md:px-6 hidden md:table-cell">
                          {sop.createdAt &&
                            new Date(sop.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {sops.length > 10 && (
                  <div className="mt-4 pt-4 mx-4 md:mx-0 border-t border-border text-center text-xs md:text-sm text-muted-foreground">
                    Showing 10 of {sops.length} SOPs.{' '}
                    <Button
                      variant="link"
                      className={`px-0 h-auto ${sopClasses.text} ${sopClasses.textHover} font-medium`}
                      onClick={() => router.push(Route.SOP_HOME)}
                    >
                      View all →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs Table */}
        <Card className="shadow-accent mt-6">
          <CardHeader className="border-b border-border p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Recent Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 md:pt-6">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No logs found. Upload your first log file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6 hidden sm:table-cell">
                        Company
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6 hidden md:table-cell">
                        Lines
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm px-4 md:px-6 hidden md:table-cell">
                        Created
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.slice(0, 10).map((log) => (
                      <TableRow
                        key={log.id}
                        className={`cursor-pointer ${logClasses.bgHover} transition-colors border-b border-border/50`}
                        onClick={() => router.push(Route.LOG_HOME)}
                      >
                        <TableCell className="font-medium text-foreground text-sm px-4 md:px-6">
                          {log.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm px-4 md:px-6 hidden sm:table-cell">
                          {log.companyName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm px-4 md:px-6 hidden md:table-cell">
                          {(log.driveLineCount || 0) +
                            (log.mailLineCount || 0) +
                            (log.tasksLineCount || 0) +
                            (log.deviceLineCount || 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs md:text-sm px-4 md:px-6 hidden md:table-cell">
                          {log.createdAt &&
                            new Date(log.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {logs.length > 10 && (
                  <div className="mt-4 pt-4 mx-4 md:mx-0 border-t border-border text-center text-xs md:text-sm text-muted-foreground">
                    Showing 10 of {logs.length} logs.{' '}
                    <Button
                      variant="link"
                      className={`px-0 h-auto ${logClasses.text} ${logClasses.textHover} font-medium`}
                      onClick={() => router.push(Route.LOG_HOME)}
                    >
                      View all →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Activity Analytics */}
        <div className="mt-6">
          <LogStatisticsWidget companyId={selectedCompany?.id ?? null} />
        </div>
      </div>
    </div>
  )
}
