'use client'

import {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { apiClient, DbHealthDto } from '@/lib/api-client'
import { StatusBadge } from './StatusBadge'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Database } from 'lucide-react'

export interface DbPoolRowHandle {
  refresh: () => void
}

export const DbPoolRow = forwardRef<DbPoolRowHandle>(
  function DbPoolRow(_props, ref) {
    const [data, setData] = useState<DbHealthDto | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchHealth = useCallback(async () => {
      setLoading(true)
      try {
        const response = await apiClient.getDbHealth()
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

    return (
      <AccordionItem value="db-pool" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 flex-1">
            <Database className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm">Connection Pool</span>
            <div className="flex items-center gap-2 ml-auto mr-4">
              <StatusBadge status={data?.status} loading={loading} />
              {data?.responseTimeMs != null && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {data.responseTimeMs}ms
                </span>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {!data && !loading ? (
            <p className="text-sm text-muted-foreground">
              Failed to load connection pool data.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Connection counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Active</span>
                  <div className="font-medium">
                    {data?.activeConnections ?? '-'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Idle</span>
                  <div className="font-medium">
                    {data?.idleConnections ?? '-'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Total</span>
                  <div className="font-medium">
                    {data?.totalConnections ?? '-'} /{' '}
                    {data?.maxConnections ?? '-'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Pending Threads
                  </span>
                  <div className="font-medium">
                    {data?.pendingThreads ?? '-'}
                  </div>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pool Utilization</span>
                  <span>{data?.poolUtilizationPercent?.toFixed(1) ?? 0}%</span>
                </div>
                <Progress
                  value={data?.poolUtilizationPercent ?? 0}
                  className="h-2"
                />
              </div>

              {/* Response time + timestamp */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Response Time</span>
                <span className="font-medium">
                  {data?.responseTimeMs ?? '-'}ms
                </span>
              </div>
              {data?.timestamp && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Checked At</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(data.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    )
  }
)
