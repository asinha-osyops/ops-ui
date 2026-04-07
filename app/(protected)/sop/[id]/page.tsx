'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  apiClient,
  SopDto,
  ProcessingStatus,
  RoleTitle,
} from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { useEntityDetail } from '@/lib/hooks/useEntityDetail'
import { Button } from '@/components/ui/button'
import { FileInfoCard } from '@/components/ui/FileInfoCard'
import { DetailField } from '@/components/ui/DetailField'
import { EntityActions } from '@/components/ui/EntityActions'
import { LoadableContent } from '@/components/ui/LoadableContent'
import { PageLayout } from '@/components/PageLayout'
import { useDeleteConfirmation } from '@/lib/hooks/useDeleteConfirmation'
import { useSopDownload } from '@/lib/hooks/useDownload'
import { CONFIRMATIONS } from '@/lib/constants/ui-strings'
import { useFileDownload } from '@/lib/hooks/useFileDownload'
import { useEntityColorScheme } from '@/lib/hooks/useColorScheme'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import {
  Download,
  Loader2,
  ArrowLeft,
  Play,
  StopCircle,
  GitBranch,
  GitMerge,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  LineChart,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SopEditModal } from '@/components/sop/SopEditModal'
import { SopGraphView } from '@/components/sop/SopGraphView'
import { SopGraphNew } from '@/components/sop-graph-new/SopGraphNew'
import { AddStepModal } from '@/components/sop/AddStepModal'
import { useTaskPolling } from '@/hooks/use-task-polling'
import {
  getPredecessorIds,
  getSuccessorIds,
} from '@/lib/hooks/useDagLayoutGeneric'
import { getStringParam } from '@/lib/utils/route-params'

export default function SopDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sopId = getStringParam(params.id)

  const [editingSop, setEditingSop] = useState<SopDto | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [addStepModalOpen, setAddStepModalOpen] = useState(false)

  const {
    classes: sopClasses,
    buttonClasses: sopButtonClasses,
    getRoleTitleColor,
  } = useEntityColorScheme('SOP')

  // Use the shared entity detail hook
  const {
    entity: sop,
    loading,
    error,
    refetch: fetchSop,
  } = useEntityDetail({
    entityId: sopId,
    fetchFn: (id) => apiClient.getSopById(id),
    entityTypeName: 'SOP',
  })

  // Task polling for analysis - memoize to prevent infinite re-renders
  const analyzingTasks = useMemo(() => {
    const tasks = new Map<string, string>()
    if (sop?.analysisTaskId) {
      tasks.set(sop.id, sop.analysisTaskId)
    }
    return tasks
  }, [sop?.id, sop?.analysisTaskId])

  const { statuses: taskStatuses, allComplete } = useTaskPolling(
    analyzingTasks,
    {
      enabled: analyzingTasks.size > 0,
    }
  )

  useEffect(() => {
    if (allComplete && analyzingTasks.size > 0) {
      const status = taskStatuses.get(sop?.id || '')
      if (status?.status === ProcessingStatus.COMPLETED) {
        toast.success('Analysis completed')
        fetchSop()
      } else if (status?.status === ProcessingStatus.FAILED) {
        toast.error(
          `Analysis failed: ${status?.errorMessage || 'Unknown error'}`
        )
      }
    }
  }, [allComplete, analyzingTasks.size, taskStatuses, sop?.id, fetchSop])

  const isAnalyzing =
    sop?.analysisTaskId &&
    taskStatuses.get(sop.id)?.status !== ProcessingStatus.COMPLETED

  // Download hooks
  const { handleDownloadJSON, handleDownloadText } = useSopDownload()

  const {
    confirmAndDelete: confirmAndDeleteSop,
    confirmDialog: deleteConfirmDialog,
  } = useDeleteConfirmation<SopDto>({
    onDelete: async (s) => {
      return await apiClient.deleteSop(s.id)
    },
    onSuccess: async () => {
      toast.success('SOP deleted successfully')
      router.push(Route.SOP_HOME)
    },
    onError: (message) => {
      toast.error(`Delete failed: ${message}`)
    },
    getConfirmMessage: (s) => CONFIRMATIONS.deleteEntity('SOP', s.name),
  })

  const { downloadFile: downloadSopFile, downloading: downloadingSop } =
    useFileDownload((fileId) => apiClient.downloadSopFile(fileId))

  const handleEdit = useCallback(() => {
    if (sop) setEditingSop(sop)
  }, [sop])

  const handleEditSuccess = useCallback(() => {
    setEditingSop(null)
    fetchSop()
  }, [fetchSop])

  // Check if this is a legacy SOP that needs migration
  const needsMigration =
    sop && (!sop.edges || sop.edges.length === 0) && sop.steps.length > 1

  // Handle migration to DAG
  const handleMigrate = useCallback(async () => {
    if (!sop) return

    setIsMigrating(true)
    try {
      const result = await apiClient.migrateToDag(sop.id)
      if (result.valid) {
        toast.success('SOP migrated to DAG successfully')
      } else if (result.errors.length > 0) {
        toast.warning(
          'Migration completed with errors. Please review the graph.'
        )
      } else {
        toast.success('Migration completed with warnings. Review recommended.')
      }
      fetchSop()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to migrate SOP'
      toast.error(message)
    } finally {
      setIsMigrating(false)
    }
  }, [sop, fetchSop])

  if (loading) {
    return (
      <PageLayout
        title="Loading..."
        breadcrumbs={[
          { label: 'SOPs', route: Route.SOP_HOME },
          { label: 'Loading...' },
        ]}
      >
        <LoadableContent
          loading={true}
          loadingMessage="Loading SOP..."
          isEmpty={false}
          emptyTitle=""
          emptyDescription=""
        >
          <div />
        </LoadableContent>
      </PageLayout>
    )
  }

  if (error || !sop) {
    return (
      <PageLayout
        title="SOP Not Found"
        breadcrumbs={[
          { label: 'SOPs', route: Route.SOP_HOME },
          { label: 'Not Found' },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error || 'SOP not found'}
          </p>
          <Button onClick={() => router.push(Route.SOP_HOME)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to SOPs
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <>
      {deleteConfirmDialog}
      <PageLayout
        title={sop.name}
        titleClassName={sopClasses.text}
        breadcrumbs={Breadcrumbs.sop.detail(sop.name)}
        headerActions={
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push(Route.SOP_ANALYSIS(sop.id))}>
              <LineChart className="mr-2 h-4 w-4" />
              Run Analysis
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(Route.SOP_HOME)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to SOPs
            </Button>
          </div>
        }
      >
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline">{sop.companyName}</Badge>
          <span className="text-sm text-muted-foreground">
            Created: {new Date(sop.createdAt).toLocaleDateString()}
          </span>
          {/* Validation status badge */}
          {!needsMigration &&
            (sop.dagValid ? (
              <Badge
                variant="outline"
                className="border-green-500 text-green-600 dark:text-green-400 flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                DAG Valid
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-500 text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <XCircle className="h-3 w-3" />
                DAG Invalid
              </Badge>
            ))}
          {isAnalyzing && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing...
            </Badge>
          )}
        </div>

        {/* Migration Banner for Legacy SOPs */}
        {needsMigration && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-700 dark:text-yellow-300">
                This SOP was created before DAG support. Migrate to enable graph
                view and workflow editing.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMigrate}
                disabled={isMigrating}
                className="ml-4"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  'Migrate to DAG'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* DAG Validation Status Banner */}
        {!needsMigration &&
          sop.validationErrors &&
          sop.validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-700 dark:text-red-300">
                      DAG Invalid - {sop.validationErrors.length} error
                      {sop.validationErrors.length !== 1 ? 's' : ''} must be
                      fixed before analysis
                    </span>
                    {sop.lastValidatedAt && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Last validated:{' '}
                        {new Date(sop.lastValidatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {sop.validationErrors.map((error, index) => (
                      <li key={index}>
                        <span className="font-mono text-xs mr-2">
                          [{error.code}]
                        </span>
                        {error.message}
                        {error.affectedNodeIds &&
                          error.affectedNodeIds.length > 0 && (
                            <span className="text-xs ml-1">
                              (affects {error.affectedNodeIds.length} node
                              {error.affectedNodeIds.length !== 1 ? 's' : ''})
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* DAG Validation Warnings Banner (only show if valid but has warnings) */}
        {!needsMigration &&
          sop.dagValid &&
          sop.validationWarnings &&
          sop.validationWarnings.length > 0 && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">
                      {sop.validationWarnings.length} warning
                      {sop.validationWarnings.length !== 1 ? 's' : ''} detected
                      (analysis still allowed)
                    </span>
                    {sop.lastValidatedAt && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        Last validated:{' '}
                        {new Date(sop.lastValidatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {sop.validationWarnings.map((warning, index) => (
                      <li key={index}>
                        <span className="font-mono text-xs mr-2">
                          [{warning.code}]
                        </span>
                        {warning.message}
                        {warning.nodeName && (
                          <span className="text-xs ml-1">
                            (node: {warning.nodeName})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Details Section - Always Visible */}
        <div className="space-y-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <dl className="grid gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  SOP Name
                </dt>
                <dd className="text-foreground">{sop.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Company
                </dt>
                <dd className="text-foreground">{sop.companyName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Description
                </dt>
                <dd className="text-foreground whitespace-pre-wrap">
                  {sop.basicDescription || 'No description'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="text-foreground">
                  {new Date(sop.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* File Info Accordion - Collapsed by Default */}
          {sop.sopFile && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="file-info" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Source File: {sop.sopFile.fileName}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <FileInfoCard file={sop.sopFile} />
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadSopFile(sop.sopFile!.id, sop.sopFile!.fileName)
                      }
                      disabled={downloadingSop}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {downloadingSop
                        ? 'Downloading...'
                        : 'Download Original File'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Actions */}
          <EntityActions
            entity={sop}
            entityName="SOP"
            showAnalyze={false}
            showEdit={true}
            onEdit={(e) => {
              e.stopPropagation()
              handleEdit()
            }}
            onDownloadJSON={(e) => {
              e.stopPropagation()
              handleDownloadJSON(sop)
            }}
            onDownloadText={(e) => {
              e.stopPropagation()
              handleDownloadText(sop)
            }}
            onDelete={(e) => {
              e.stopPropagation()
              confirmAndDeleteSop(sop)
            }}
          />
        </div>

        {/* Tabs - Steps and Graph View Only */}
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="steps">Steps ({sop.steps.length})</TabsTrigger>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="graph-new">Graph (New)</TabsTrigger>
          </TabsList>

          {/* Steps Tab */}
          <TabsContent value="steps">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Workflow Steps</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddStepModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            <div className="space-y-4">
              {sop.steps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No steps defined. Click &quot;Add Step&quot; to create one.
                </p>
              ) : (
                sop.steps.map((step, index) => {
                  // Get edge info for this step
                  const edges = sop.edges || []
                  const predecessors = getPredecessorIds(step.id, edges)
                  const successors = getSuccessorIds(step.id, edges)

                  // Helper to get step name by ID
                  const getStepName = (stepId: string) => {
                    const s = sop.steps.find((st) => st.id === stepId)
                    return s ? s.name : 'Unknown'
                  }

                  return (
                    <div
                      key={step.id}
                      className="bg-card rounded-lg border p-4"
                    >
                      <div className="flex gap-4 mb-3">
                        {/* Step number and node type */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="text-sm font-medium text-foreground whitespace-nowrap">
                            Step {index + 1}
                          </div>
                          {/* Node type badge */}
                          {step.nodeType === 'START' && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <Play className="h-3 w-3" />
                              <span>Start</span>
                            </div>
                          )}
                          {step.nodeType === 'END' && (
                            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <StopCircle className="h-3 w-3" />
                              <span>End</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-foreground break-words">
                              {step.name}
                            </h4>
                            {step.actorRoleTitle && (
                              <Badge
                                chartColor={getRoleTitleColor(
                                  step.actorRoleTitle as RoleTitle
                                )}
                                className="text-xs"
                              >
                                {step.actorRoleTitle}
                              </Badge>
                            )}
                            {/* Fork/Join indicators */}
                            {step.isFork && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-600 dark:text-blue-400">
                                <GitBranch className="h-3 w-3" />
                                <span>Fork</span>
                              </div>
                            )}
                            {step.isJoin && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-600 dark:text-purple-400">
                                <GitMerge className="h-3 w-3" />
                                <span>Join</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-foreground mb-2 break-words">
                            {step.details}
                          </p>

                          {/* Matching Employees */}
                          {step.matchingEmployeesForRoleTitle &&
                            step.matchingEmployeesForRoleTitle.length > 0 && (
                              <div className="mt-2 mb-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Suggested Employees for this Role:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {step.matchingEmployeesForRoleTitle.map(
                                    (employee) => (
                                      <span
                                        key={employee.id}
                                        className="px-2 py-1 bg-muted border border-border rounded text-xs text-foreground"
                                        title={`${employee.email} - ${employee.roleTitle || 'No role assigned'}`}
                                      >
                                        {employee.name}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {(step.postStepDocumentation ||
                            step.monitoringRequirements) && (
                            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                              {step.postStepDocumentation && (
                                <DetailField
                                  label="Post-Step Documentation"
                                  value={step.postStepDocumentation}
                                />
                              )}
                              {step.monitoringRequirements && (
                                <DetailField
                                  label="Monitoring Requirements"
                                  value={step.monitoringRequirements}
                                />
                              )}
                            </div>
                          )}

                          {/* Workflow connections (predecessors/successors) */}
                          {(predecessors.length > 0 ||
                            successors.length > 0) && (
                            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border text-xs">
                              {predecessors.length > 0 && (
                                <div>
                                  <span className="text-muted-foreground">
                                    From:{' '}
                                  </span>
                                  <span className="text-foreground">
                                    {predecessors
                                      .map((id) => getStepName(id))
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                              {successors.length > 0 && (
                                <div>
                                  <span className="text-muted-foreground">
                                    To:{' '}
                                  </span>
                                  <span className="text-foreground">
                                    {successors
                                      .map((id) => getStepName(id))
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Inferred Fields (AI-detected from step text) */}
                          {(step.inferredEventCategories?.length ||
                            step.inferredResourceType ||
                            step.inferredResourceTitle) && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                AI-Inferred Context
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                {step.inferredEventCategories &&
                                  step.inferredEventCategories.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-1">
                                        Event Categories:
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {step.inferredEventCategories.map(
                                          (category) => (
                                            <Badge
                                              key={category}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {category}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {step.inferredResourceType && (
                                  <div>
                                    <span className="text-xs text-muted-foreground block mb-1">
                                      Resource Type:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {step.inferredResourceType}
                                    </Badge>
                                  </div>
                                )}
                                {step.inferredResourceTitle && (
                                  <div>
                                    <span className="text-xs text-muted-foreground block mb-1">
                                      Resource Title:
                                    </span>
                                    <span className="text-foreground">
                                      {step.inferredResourceTitle}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Graph View Tab */}
          <TabsContent value="graph">
            <SopGraphView sop={sop} isEditable={true} onSopUpdate={fetchSop} />
          </TabsContent>

          {/* New Graph View */}
          <TabsContent value="graph-new">
            <SopGraphNew sop={sop} />
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <SopEditModal
          sop={editingSop}
          open={editingSop !== null}
          onOpenChange={(open) => !open && setEditingSop(null)}
          onSuccess={handleEditSuccess}
        />

        {/* Add Step Modal */}
        <AddStepModal
          sopId={sop.id}
          sopName={sop.name}
          open={addStepModalOpen}
          onOpenChange={setAddStepModalOpen}
          onSuccess={() => {
            fetchSop()
          }}
        />
      </PageLayout>
    </>
  )
}
