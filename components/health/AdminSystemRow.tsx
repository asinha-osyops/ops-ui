'use client'

import {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { apiClient, AdminHealthDto, ThreadPoolInfoDto } from '@/lib/api-client'
import { StatusBadge } from './StatusBadge'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Server } from 'lucide-react'

export interface AdminSystemRowHandle {
  refresh: () => void
}

function ThreadPoolCard({ pool }: { pool: ThreadPoolInfoDto }) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="text-xs font-medium truncate">{pool.name || 'Pool'}</div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Active: {pool.activeCount ?? 0}/{pool.maxPoolSize ?? 0}
        </span>
        <span>Queue: {pool.queueSize ?? 0}</span>
      </div>
      <Progress value={pool.utilizationPercent ?? 0} className="h-1.5" />
      <div className="text-xs text-muted-foreground">
        Completed: {(pool.completedTaskCount ?? 0).toLocaleString()}
      </div>
    </div>
  )
}

export const AdminSystemRow = forwardRef<AdminSystemRowHandle>(
  function AdminSystemRow(_props, ref) {
    const [data, setData] = useState<AdminHealthDto | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchHealth = useCallback(async () => {
      setLoading(true)
      try {
        const response = await apiClient.getAdminHealth()
        setData(response)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }, [])

    useImperativeHandle(ref, () => ({ refresh: fetchHealth }), [fetchHealth])

    useEffect(() => {
      fetchHealth()
    }, [fetchHealth])

    const taskStatuses = data?.taskCountByStatus
      ? Object.entries(data.taskCountByStatus)
      : []

    return (
      <AccordionItem value="admin-system" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 flex-1">
            <Server className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm">System</span>
            <div className="flex items-center gap-2 ml-auto mr-4">
              <StatusBadge status={data?.status} loading={loading} />
              {data?.uptime && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {data.uptime}
                </span>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {!data && !loading ? (
            <p className="text-sm text-muted-foreground">
              Failed to load system health data.
            </p>
          ) : (
            <div className="space-y-5">
              {/* Runtime */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Runtime
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Uptime
                    </span>
                    <div className="font-medium">{data?.uptime ?? '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Processors
                    </span>
                    <div className="font-medium">
                      {data?.availableProcessors ?? '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      System Load
                    </span>
                    <div className="font-medium">
                      {data?.systemLoadAverage?.toFixed(2) ?? '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Process CPU
                    </span>
                    <div className="font-medium">
                      {data?.processLoad != null
                        ? `${(data.processLoad * 100).toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Memory
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Heap</span>
                    <span className="font-medium">
                      {data?.heapUsed ?? '-'} / {data?.heapMax ?? '-'}
                    </span>
                  </div>
                  <Progress
                    value={data?.heapUtilizationPercent ?? 0}
                    className="h-2"
                  />
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Heap %
                      </span>
                      <div className="font-medium">
                        {data?.heapUtilizationPercent?.toFixed(1) ?? '-'}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Non-Heap
                      </span>
                      <div className="font-medium">
                        {data?.nonHeapUsed ?? '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        GC Pauses
                      </span>
                      <div className="font-medium">
                        {data?.gcPauseCount ?? 0} ({data?.gcPauseTimeMs ?? 0}ms)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread Pools */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Thread Pools
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data?.csvExecutor && (
                    <ThreadPoolCard pool={data.csvExecutor} />
                  )}
                  {data?.geminiExecutor && (
                    <ThreadPoolCard pool={data.geminiExecutor} />
                  )}
                  {data?.auditExecutor && (
                    <ThreadPoolCard pool={data.auditExecutor} />
                  )}
                </div>
              </div>

              {/* Async Tasks */}
              {taskStatuses.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Async Tasks
                    {data?.totalTaskCount != null && (
                      <span className="ml-2 font-normal">
                        ({data.totalTaskCount} total)
                      </span>
                    )}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {taskStatuses.map(([status, count]) => (
                      <Badge
                        key={status}
                        variant="secondary"
                        className="text-xs"
                      >
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    )
  }
)
