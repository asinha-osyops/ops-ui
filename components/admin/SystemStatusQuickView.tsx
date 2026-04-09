'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, AppHealthDto } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/health/StatusBadge'
import { Activity, Database, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Route } from '@/lib/routes'

interface SystemStatusQuickViewProps {
  className?: string
}

export function SystemStatusQuickView({
  className,
}: SystemStatusQuickViewProps) {
  const [health, setHealth] = useState<AppHealthDto | null>(null)
  const [loading, setLoading] = useState(true)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAppHealth()
      setHealth(response)
    } catch {
      setHealth({ status: 'DOWN', database: 'DOWN' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [checkHealth])

  // Overall status: DOWN if either is DOWN
  const overallStatus =
    loading || !health
      ? undefined
      : health.status === 'DOWN' || health.database === 'DOWN'
        ? 'DOWN'
        : 'UP'

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">System Status</span>
          </div>
          <StatusBadge
            status={overallStatus as 'UP' | 'DOWN' | undefined}
            loading={loading}
          />
        </div>

        <div className="space-y-2">
          {/* Service Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">API Service</span>
            </div>
            <StatusBadge status={health?.status} loading={loading} />
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Database</span>
            </div>
            <StatusBadge status={health?.database} loading={loading} />
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link href={Route.HEALTH}>
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
