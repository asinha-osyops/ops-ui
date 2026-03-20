'use client'

import { memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, LogDto } from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadableContent } from '@/components/ui/LoadableContent'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Helper function for calculating total log lines
const getTotalLines = (log: LogDto) => {
  return (
    log.driveLineCount +
    log.mailLineCount +
    log.tasksLineCount +
    log.deviceLineCount
  )
}

// Memoized table row component to prevent unnecessary re-renders
interface LogTableRowProps {
  log: LogDto
  isAnalyzing: boolean
  onRowClick: (log: LogDto) => void
  onAnalyze: (log: LogDto) => void
  onDelete: (log: LogDto) => void
}

const LogTableRowMemo = memo(function LogTableRowMemo({
  log,
  isAnalyzing,
  onRowClick,
  onAnalyze,
  onDelete,
}: LogTableRowProps) {
  const totalLines = getTotalLines(log)

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(log)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{log.name}</span>
          {isAnalyzing && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Analyzing</span>
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline">{log.loggingSource}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {totalLines > 0 ? (
          <Badge variant="secondary">{totalLines}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {log.logFile ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm truncate max-w-[120px]">
              {log.logFile.fileName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="text-sm text-muted-foreground">
          {new Date(log.createdAt).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onAnalyze(log)
            }}
            disabled={isAnalyzing}
            title="Analyze"
            aria-label="Analyze log"
          >
            {isAnalyzing ? (
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
              onDelete(log)
            }}
            title="Delete"
            aria-label="Delete log"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
})

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

  const { confirmAndDelete: confirmAndDeleteLog } =
    useDeleteConfirmation<LogDto>({
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

  // Analyze handler - memoized for use in table rows
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

  // Navigate to detail page - memoized for use in table rows
  const handleRowClick = useCallback(
    (log: LogDto) => {
      router.push(Route.LOG_DETAIL(log.id))
    },
    [router]
  )

  // Show alert if no company selected
  if (!hasCompany) {
    return companyRequiredFallback
  }

  return (
    <PageLayout
      title="Log Management"
      titleClassName={logClasses.text}
      breadcrumbs={Breadcrumbs.log.home}
      headerActions={
        <Button variant="outline" onClick={() => router.push(Route.LOG_LINES)}>
          Query Log Lines
        </Button>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Uploaded Logs</CardTitle>
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
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Source
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Lines
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">File</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <LogTableRowMemo
                      key={log.id}
                      log={log}
                      isAnalyzing={analyzingIds.has(log.id)}
                      onRowClick={handleRowClick}
                      onAnalyze={handleAnalyze}
                      onDelete={confirmAndDeleteLog}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </LoadableContent>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
