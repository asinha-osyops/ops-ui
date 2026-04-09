'use client'

import {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { apiClient, AppHealthDto } from '@/lib/api-client'
import { StatusBadge } from './StatusBadge'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Activity } from 'lucide-react'

export interface AppHealthRowHandle {
  refresh: () => void
}

export const AppHealthRow = forwardRef<AppHealthRowHandle>(
  function AppHealthRow(_props, ref) {
    const [data, setData] = useState<AppHealthDto | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchHealth = useCallback(async () => {
      setLoading(true)
      try {
        const response = await apiClient.getAppHealth()
        setData(response)
      } catch {
        setData({ status: 'DOWN', database: 'DOWN' })
      } finally {
        setLoading(false)
      }
    }, [])

    useImperativeHandle(ref, () => ({ refresh: fetchHealth }), [fetchHealth])

    useEffect(() => {
      fetchHealth()
      const interval = setInterval(fetchHealth, 30000)
      return () => clearInterval(interval)
    }, [fetchHealth])

    return (
      <AccordionItem value="app-health" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 flex-1">
            <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm">Application</span>
            <div className="flex items-center gap-2 ml-auto mr-4">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                App
              </span>
              <StatusBadge status={data?.status} loading={loading} />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                DB
              </span>
              <StatusBadge status={data?.database} loading={loading} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Application Status</span>
              <StatusBadge status={data?.status} loading={loading} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database Status</span>
              <StatusBadge status={data?.database} loading={loading} />
            </div>
            {data?.timestamp && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Checked</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(data.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }
)
