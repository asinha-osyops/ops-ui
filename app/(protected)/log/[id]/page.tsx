'use client'

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  apiClient,
  LogDto,
  LogAnalysisDto,
  ProcessingStatus,
} from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { getStringParam } from '@/lib/utils/route-params'
import { useEntityDetail } from '@/lib/hooks/useEntityDetail'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { Button } from '@/components/ui/button'
import { FileInfoCard } from '@/components/ui/FileInfoCard'
import { EntityActions } from '@/components/ui/EntityActions'
import { GeminiAnalysisSection } from '@/components/analysis/GeminiAnalysisSection'
import { LoadableContent } from '@/components/ui/LoadableContent'
import { PageLayout } from '@/components/PageLayout'
import { useDeleteConfirmation } from '@/lib/hooks/useDeleteConfirmation'
import { useLogDownload } from '@/lib/hooks/useDownload'
import { CONFIRMATIONS } from '@/lib/constants/ui-strings'
import { useFileDownload } from '@/lib/hooks/useFileDownload'
import { useEntityColorScheme } from '@/lib/hooks/useColorScheme'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Download, Loader2, ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogLinesTable } from '@/components/ui/LogLinesTable'
import { DetailField } from '@/components/ui/DetailField'
import { ScrollArea } from '@/components/ui/scroll-area'

// Lazy load analysis display component
const LogAnalysisDisplay = lazy(() =>
  import('@/components/analysis/LogAnalysisDisplay').then((m) => ({
    default: m.LogAnalysisDisplay,
  }))
)

export default function LogDetailPage() {
  const router = useRouter()
  const params = useParams()
  const logId = getStringParam(params.id)

  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null)

  const { classes: logClasses, buttonClasses: logButtonClasses } =
    useEntityColorScheme('Log')

  // Use the shared entity detail hook
  const {
    entity: log,
    loading,
    error,
    refetch: fetchLog,
  } = useEntityDetail({
    entityId: logId,
    fetchFn: (id) => apiClient.getLogById(id),
    entityTypeName: 'Log',
  })

  // Task polling for async log processing
  const processingTasks = useMemo(() => {
    const tasks = new Map<string, string>()
    if (processingTaskId && log) {
      tasks.set(log.id, processingTaskId)
    }
    return tasks
  }, [processingTaskId, log])

  const { statuses: taskStatuses, allComplete } = useTaskPolling(
    processingTasks,
    { enabled: processingTasks.size > 0 }
  )

  useEffect(() => {
    if (allComplete && processingTasks.size > 0 && log) {
      const status = taskStatuses.get(log.id)
      if (status?.status === ProcessingStatus.COMPLETED) {
        toast.success('Log processing completed')
        fetchLog()
      } else if (status?.status === ProcessingStatus.FAILED) {
        toast.error(
          `Processing failed: ${status?.errorMessage || 'Unknown error'}`
        )
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clearing task ID after completion is intentional
      setProcessingTaskId(null)
    }
  }, [allComplete, processingTasks.size, taskStatuses, log, fetchLog])

  // Handle analyze (async)
  const handleAnalyze = useCallback(async () => {
    if (!log) return
    try {
      const response = await apiClient.processLogAsync(log.id)
      setProcessingTaskId(response.taskId)
      toast.success('Processing started')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to start processing'
      )
    }
  }, [log])

  // Download hooks
  const { handleDownloadJSON, handleDownloadText } = useLogDownload()

  const {
    confirmAndDelete: confirmAndDeleteLog,
    confirmDialog: deleteConfirmDialog,
  } = useDeleteConfirmation<LogDto>({
    onDelete: async (l) => {
      return await apiClient.deleteLog(l.id)
    },
    onSuccess: async () => {
      toast.success('Log deleted successfully')
      router.push(Route.LOG_HOME)
    },
    onError: (message) => {
      toast.error(`Delete failed: ${message}`)
    },
    getConfirmMessage: (l) => CONFIRMATIONS.deleteEntity('log', l.name),
  })

  const { downloadFile: downloadLogFile, downloading: downloadingLog } =
    useFileDownload((fileId) => apiClient.downloadLogFile(fileId))

  const isProcessing =
    !!processingTaskId ||
    log?.processingStatus === ProcessingStatus.PENDING ||
    log?.processingStatus === ProcessingStatus.PROCESSING

  if (loading) {
    return (
      <PageLayout
        title="Loading..."
        breadcrumbs={[
          { label: 'Logs', route: Route.LOG_HOME },
          { label: 'Loading...' },
        ]}
      >
        <LoadableContent
          loading={true}
          loadingMessage="Loading Log..."
          isEmpty={false}
          emptyTitle=""
          emptyDescription=""
        >
          <div />
        </LoadableContent>
      </PageLayout>
    )
  }

  if (error || !log) {
    return (
      <PageLayout
        title="Log Not Found"
        breadcrumbs={[
          { label: 'Logs', route: Route.LOG_HOME },
          { label: 'Not Found' },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error || 'Log not found'}
          </p>
          <Button onClick={() => router.push(Route.LOG_HOME)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Logs
          </Button>
        </div>
      </PageLayout>
    )
  }

  const totalLines =
    log.driveLineCount +
    log.mailLineCount +
    log.tasksLineCount +
    log.deviceLineCount

  return (
    <>
      {deleteConfirmDialog}
      <PageLayout
        title={log.name}
        titleClassName={logClasses.text}
        breadcrumbs={Breadcrumbs.log.detail(log.name)}
        headerActions={
          <Button variant="outline" onClick={() => router.push(Route.LOG_HOME)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Logs
          </Button>
        }
      >
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline">{log.companyName}</Badge>
          <Badge variant="secondary">{log.loggingSource}</Badge>
          <span className="text-sm text-muted-foreground">
            Created: {new Date(log.createdAt).toLocaleDateString()}
          </span>
          {isProcessing && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </Badge>
          )}
          {log.processingStatus === ProcessingStatus.FAILED && (
            <Badge variant="destructive">Processing Failed</Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {log.logFile && <TabsTrigger value="file">File</TabsTrigger>}
            {totalLines > 0 && (
              <TabsTrigger value="lines">Log Lines ({totalLines})</TabsTrigger>
            )}
            {log.geminiResponseFiles && log.geminiResponseFiles.length > 0 && (
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Log Name
                  </dt>
                  <dd className="text-foreground">{log.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Company
                  </dt>
                  <dd className="text-foreground">{log.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Logging Source
                  </dt>
                  <dd className="text-foreground">{log.loggingSource}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="text-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Log Line Counts */}
            {totalLines > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Log Line Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {log.driveLineCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Drive Events
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {log.mailLineCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mail Events
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {log.tasksLineCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tasks Events
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {log.deviceLineCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Device Events
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                <div className="grid gap-3">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <DetailField
                      key={key}
                      label={key}
                      value={
                        typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <EntityActions
              entity={log}
              entityName="Log"
              showAnalyze={true}
              showEdit={false}
              analyzing={isProcessing}
              onAnalyze={(e) => {
                e.stopPropagation()
                handleAnalyze()
              }}
              onDownloadJSON={(e) => {
                e.stopPropagation()
                handleDownloadJSON(log)
              }}
              onDownloadText={(e) => {
                e.stopPropagation()
                handleDownloadText(log)
              }}
              onDelete={(e) => {
                e.stopPropagation()
                confirmAndDeleteLog(log)
              }}
            />
          </TabsContent>

          {/* File Tab */}
          {log.logFile && (
            <TabsContent value="file" className="space-y-6">
              <FileInfoCard file={log.logFile} />
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadLogFile(log.logFile!.id, log.logFile!.fileName)
                  }
                  disabled={downloadingLog}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingLog ? 'Downloading...' : 'Download Original File'}
                </Button>
              </div>

              {/* Parsed Text Preview */}
              {log.logFile.parsedText && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Parsed Text Preview
                  </h3>
                  <ScrollArea className="h-96 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                      {log.logFile.parsedText.substring(0, 5000)}
                      {log.logFile.parsedText.length > 5000 &&
                        '... (truncated)'}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          )}

          {/* Log Lines Tab */}
          {totalLines > 0 && (
            <TabsContent value="lines">
              <LogLinesTable logLines={log.logLines} totalCount={totalLines} />
            </TabsContent>
          )}

          {/* Analysis Tab */}
          {log.geminiResponseFiles && log.geminiResponseFiles.length > 0 && (
            <TabsContent value="analysis">
              <Suspense fallback={<div>Loading analysis...</div>}>
                <GeminiAnalysisSection
                  geminiResponseFiles={log.geminiResponseFiles}
                  parseContent={(content) =>
                    JSON.parse(content) as LogAnalysisDto
                  }
                  renderAnalysis={(analysis) => (
                    <LogAnalysisDisplay analysis={analysis} />
                  )}
                />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </PageLayout>
    </>
  )
}
