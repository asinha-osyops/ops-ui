'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { apiClient, LogDto } from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadableContent } from '@/components/ui/LoadableContent'
import { DataTable } from '@/components/ui/data-table'
import { PageLayout } from '@/components/PageLayout'
import { useDeleteConfirmation } from '@/lib/hooks/useDeleteConfirmation'
import { useAnalysis } from '@/lib/hooks/useAnalysis'
import { CONFIRMATIONS } from '@/lib/constants/ui-strings'
import { useEntityColorScheme } from '@/lib/hooks/useColorScheme'
import { useLogs } from '@/lib/hooks/useEntities'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Trash2, FileText, Play } from 'lucide-react'
import { useRequireCompany } from '@/lib/hooks/useRequireCompany'

// Helper function for calculating total log lines
const getTotalLines = (log: LogDto) => {
  return (
    log.driveLineCount +
    log.mailLineCount +
    log.tasksLineCount +
    log.deviceLineCount
  )
}

/** Row data enriched with analyzing state */
interface LogRowData extends LogDto {
  isAnalyzing: boolean
}

export function LogPageContent() {
  const router = useRouter()

  // Use consolidated hooks for cleaner code
  const { classes: logClasses, buttonClasses: logButtonClasses } =
    useEntityColorScheme('Log')
  const { logs, loading: loadingLogs, refresh: refreshLogs } = useLogs()

  // Company requirement guard
  const { hasCompany, companyRequiredFallback } = useRequireCompany({
    title: 'Log Management',
    titleClassName: logClasses.text,
    breadcrumbs: Breadcrumbs.log.home,
  })

  // Custom hooks
  const { analyzingIds, analyze } = useAnalysis(
    (id: string) => apiClient.processLog(id),
    'Log'
  )

  const {
    confirmAndDelete: confirmAndDeleteLog,
    confirmDialog: deleteConfirmDialog,
  } = useDeleteConfirmation<LogDto>({
    onDelete: async (log) => {
      return await apiClient.deleteLog(log.id)
    },
    onSuccess: async () => {
      await refreshLogs()
      toast.success('Log deleted successfully')
    },
    onError: (message) => {
      toast.error(`Delete failed: ${message}`)
    },
    getConfirmMessage: (log) => CONFIRMATIONS.deleteEntity('log', log.name),
  })

  // Analyze handler
  const handleAnalyze = useCallback(
    async (log: LogDto) => {
      await analyze(
        log.id,
        async () => {
          await refreshLogs()
          toast.success(`Analysis for "${log.name}" completed successfully.`)
        },
        (error) => {
          toast.error(`Analysis failed: ${error}`)
        }
      )
    },
    [analyze, refreshLogs]
  )

  // Enrich rows with analyzing state
  const rows: LogRowData[] = useMemo(
    () =>
      logs.map((log) => ({ ...log, isAnalyzing: analyzingIds.has(log.id) })),
    [logs, analyzingIds]
  )

  // Navigate to detail page
  const handleRowClick = useCallback(
    (row: LogRowData) => {
      router.push(Route.LOG_DETAIL(row.id))
    },
    [router]
  )

  // Stable refs for callbacks used in column definitions
  const handleAnalyzeRef = useRef(handleAnalyze)
  handleAnalyzeRef.current = handleAnalyze
  const confirmDeleteRef = useRef(confirmAndDeleteLog)
  confirmDeleteRef.current = confirmAndDeleteLog

  // Column definitions — deps-free via refs
  const columns: ColumnDef<LogRowData>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.name}</span>
            {row.original.isAnalyzing && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Analyzing</span>
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'loggingSource',
        header: 'Source',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.loggingSource}</Badge>
        ),
      },
      {
        id: 'lines',
        header: 'Lines',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => {
          const totalLines = getTotalLines(row.original)
          return totalLines > 0 ? (
            <Badge variant="secondary">{totalLines}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        id: 'file',
        header: 'File',
        meta: { className: 'hidden lg:table-cell' },
        cell: ({ row }) =>
          row.original.logFile ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm truncate max-w-[120px]">
                {row.original.logFile.fileName}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="text-right block">Actions</span>,
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleAnalyzeRef.current(row.original)
              }}
              disabled={row.original.isAnalyzing}
              title="Analyze"
              aria-label="Analyze log"
            >
              {row.original.isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                confirmDeleteRef.current(row.original)
              }}
              title="Delete"
              aria-label="Delete log"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps -- callbacks accessed via stable refs
  )

  // Show alert if no company selected
  if (!hasCompany) {
    return companyRequiredFallback
  }

  return (
    <>
      {deleteConfirmDialog}
      <PageLayout
        title="Log Management"
        titleClassName={logClasses.text}
        breadcrumbs={Breadcrumbs.log.home}
        headerActions={
          <Button
            variant="outline"
            onClick={() => router.push(Route.LOG_LINES)}
          >
            Query Log Lines
          </Button>
        }
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              Uploaded Logs
            </CardTitle>
            <Button
              onClick={() => router.push(Route.LOG_CREATE)}
              className={logButtonClasses}
            >
              Create New
            </Button>
          </CardHeader>
          <CardContent>
            <LoadableContent
              loading={loadingLogs}
              loadingMessage="Loading logs..."
              isEmpty={logs.length === 0}
              emptyTitle="No logs found"
              emptyDescription="Create a log to get started."
              useSkeleton={true}
              skeletonRows={5}
            >
              <DataTable
                columns={columns}
                data={rows}
                onRowClick={handleRowClick}
                showViewOptions={false}
              />
            </LoadableContent>
          </CardContent>
        </Card>
      </PageLayout>
    </>
  )
}
