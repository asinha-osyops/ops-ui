'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { pluralize } from '@/lib/utils/format-helpers'
import { apiClient, SopDto, ProcessingStatus } from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadableContent } from '@/components/ui/LoadableContent'
import { DataTable } from '@/components/ui/data-table'
import { PageLayout } from '@/components/PageLayout'
import { useDeleteConfirmation } from '@/lib/hooks/useDeleteConfirmation'
import { useEntityColorScheme } from '@/lib/hooks/useColorScheme'
import { CONFIRMATIONS } from '@/lib/constants/ui-strings'
import { useSops } from '@/lib/hooks/useEntities'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Loader2,
  Pencil,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { useRequireCompany } from '@/lib/hooks/useRequireCompany'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { SopEditModal } from '@/components/sop/SopEditModal'

/** Row data enriched with analyzing state */
interface SopRowData extends SopDto {
  isAnalyzing: boolean
}

export function SopPageContent() {
  const router = useRouter()

  // Use consolidated hooks for cleaner code
  const { classes: sopClasses, buttonClasses: sopButtonClasses } =
    useEntityColorScheme('SOP')
  const { sops, loading: loadingSops, refresh: refreshSops } = useSops()

  // Company requirement guard
  const { hasCompany, companyRequiredFallback } = useRequireCompany({
    title: 'SOP Management',
    titleClassName: sopClasses.text,
    breadcrumbs: Breadcrumbs.sop.home,
  })

  // Edit modal state
  const [editingSop, setEditingSop] = useState<SopDto | null>(null)

  const handleEdit = useCallback((sop: SopDto) => {
    setEditingSop(sop)
  }, [])

  const handleEditSuccess = useCallback(() => {
    setEditingSop(null)
    refreshSops()
  }, [refreshSops])

  // Track SOPs with active analysis tasks
  const analyzingTasks = useMemo(() => {
    const tasks = new Map<string, string>()
    sops.forEach((sop) => {
      if (sop.analysisTaskId) {
        tasks.set(sop.id, sop.analysisTaskId)
      }
    })
    return tasks
  }, [sops])

  // Poll task statuses for SOPs with active analysis
  const { statuses: taskStatuses, allComplete } = useTaskPolling(
    analyzingTasks,
    {
      enabled: analyzingTasks.size > 0,
    }
  )

  // Handle analysis completion - refetch SOPs when tasks complete
  useEffect(() => {
    if (allComplete && analyzingTasks.size > 0) {
      const completedSopIds: string[] = []
      const failedSopIds: string[] = []

      taskStatuses.forEach((status, sopId) => {
        if (status.status === ProcessingStatus.COMPLETED) {
          completedSopIds.push(sopId)
        } else if (status.status === ProcessingStatus.FAILED) {
          failedSopIds.push(sopId)
        }
      })

      refreshSops().then(() => {
        if (completedSopIds.length > 0) {
          toast.success(
            `Analysis completed for ${completedSopIds.length} SOP(s)`
          )
        }
        if (failedSopIds.length > 0) {
          failedSopIds.forEach((sopId) => {
            const status = taskStatuses.get(sopId)
            toast.error(
              `Analysis failed: ${status?.errorMessage || 'Unknown error'}`
            )
          })
        }
      })
    }
  }, [allComplete, analyzingTasks.size, taskStatuses, refreshSops])

  const {
    confirmAndDelete: confirmAndDeleteSop,
    confirmDialog: deleteConfirmDialog,
  } = useDeleteConfirmation<SopDto>({
    onDelete: async (sop) => {
      return await apiClient.deleteSop(sop.id)
    },
    onSuccess: async () => {
      await refreshSops()
      toast.success('SOP deleted successfully')
    },
    onError: (message) => {
      toast.error(`Delete failed: ${message}`)
    },
    getConfirmMessage: (sop) => CONFIRMATIONS.deleteEntity('SOP', sop.name),
  })

  // Helper to check if SOP is currently being analyzed
  const isAnalyzing = useCallback(
    (sopId: string) => {
      const status = taskStatuses.get(sopId)
      return !!(
        status &&
        (status.status === ProcessingStatus.PENDING ||
          status.status === ProcessingStatus.PROCESSING)
      )
    },
    [taskStatuses]
  )

  // Enrich rows with analyzing state
  const rows: SopRowData[] = useMemo(
    () => sops.map((sop) => ({ ...sop, isAnalyzing: isAnalyzing(sop.id) })),
    [sops, isAnalyzing]
  )

  // Navigate to detail page
  const handleRowClick = useCallback(
    (row: SopRowData) => {
      router.push(Route.SOP_DETAIL(row.id))
    },
    [router]
  )

  // Column definitions
  const columns: ColumnDef<SopRowData>[] = useMemo(
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
        accessorKey: 'basicDescription',
        header: 'Description',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1">
            {row.original.basicDescription || '-'}
          </span>
        ),
      },
      {
        id: 'steps',
        header: 'Steps',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.steps.length} step
            {pluralize(row.original.steps.length)}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => {
          const sop = row.original
          if (sop.dagValid) {
            if (sop.validationWarnings && sop.validationWarnings.length > 0) {
              return (
                <Badge
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 dark:text-yellow-400 flex items-center gap-1 w-fit"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {sop.validationWarnings.length} warning
                    {sop.validationWarnings.length !== 1 ? 's' : ''}
                  </span>
                </Badge>
              )
            }
            return (
              <Badge
                variant="outline"
                className="border-green-500 text-green-600 dark:text-green-400 flex items-center gap-1 w-fit"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Valid</span>
              </Badge>
            )
          }
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 dark:text-red-400 flex items-center gap-1 w-fit"
            >
              <XCircle className="h-3 w-3" />
              <span>
                {sop.validationErrors?.length || 0} error
                {(sop.validationErrors?.length || 0) !== 1 ? 's' : ''}
              </span>
            </Badge>
          )
        },
      },
      {
        id: 'file',
        header: 'File',
        meta: { className: 'hidden lg:table-cell' },
        cell: ({ row }) =>
          row.original.sopFile ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm truncate max-w-[120px]">
                {row.original.sopFile.fileName}
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
                handleEdit(row.original)
              }}
              title="Edit"
              aria-label="Edit SOP"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                confirmAndDeleteSop(row.original)
              }}
              title="Delete"
              aria-label="Delete SOP"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, confirmAndDeleteSop]
  )

  // Show alert if no company selected
  if (!hasCompany) {
    return companyRequiredFallback
  }

  return (
    <>
      {deleteConfirmDialog}
      <PageLayout
        title="SOP Management"
        titleClassName={sopClasses.text}
        breadcrumbs={Breadcrumbs.sop.home}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              Uploaded SOPs
            </CardTitle>
            <Button
              onClick={() => router.push(Route.SOP_CREATE)}
              className={sopButtonClasses}
            >
              Create New
            </Button>
          </CardHeader>
          <CardContent>
            <LoadableContent
              loading={loadingSops}
              loadingMessage="Loading SOPs..."
              isEmpty={sops.length === 0}
              emptyTitle="No SOPs found"
              emptyDescription="Create your first SOP to get started."
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

        {/* Edit Modal */}
        <SopEditModal
          sop={editingSop}
          open={editingSop !== null}
          onOpenChange={(open) => !open && setEditingSop(null)}
          onSuccess={handleEditSuccess}
        />
      </PageLayout>
    </>
  )
}
