'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, DbHealthDto } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Database,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Route } from '@/lib/routes'

interface SystemStatusQuickViewProps {
  className?: string
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'loading'

export function SystemStatusQuickView({
  className,
}: SystemStatusQuickViewProps) {
  const [serviceStatus, setServiceStatus] = useState<HealthStatus>('loading')
  const [dbStatus, setDbStatus] = useState<HealthStatus>('loading')
  const [dbHealth, setDbHealth] = useState<DbHealthDto | null>(null)

  const checkHealth = useCallback(async () => {
    // Check service health
    try {
      const response = await apiClient.getServiceHealth()
      const statusStr = response.status.toLowerCase()
      if (statusStr === 'up' || statusStr === 'ok' || statusStr === 'healthy') {
        setServiceStatus('healthy')
      } else if (statusStr === 'degraded' || statusStr === 'warning') {
        setServiceStatus('degraded')
      } else {
        setServiceStatus('unhealthy')
      }
    } catch {
      setServiceStatus('unhealthy')
    }

    // Check database health
    try {
      const response = await apiClient.getDbHealth()
      setDbHealth(response)
      // DB is healthy if we got a response; degraded if there are mismatches
      if (response) {
        if ((response.logCountMismatches ?? 0) > 0) {
          setDbStatus('degraded')
        } else {
          setDbStatus('healthy')
        }
      } else {
        setDbStatus('unhealthy')
      }
    } catch {
      setDbStatus('unhealthy')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState calls inside checkHealth are async (after await), not synchronous
    void checkHealth()
    // Refresh every 60 seconds
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [checkHealth])

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return (
          <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
        )
    }
  }

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs">
            Healthy
          </Badge>
        )
      case 'degraded':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs">
            Degraded
          </Badge>
        )
      case 'unhealthy':
        return (
          <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 text-xs">
            Unhealthy
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Checking...
          </Badge>
        )
    }
  }

  // Calculate overall status
  const overallStatus: HealthStatus =
    serviceStatus === 'loading' || dbStatus === 'loading'
      ? 'loading'
      : serviceStatus === 'unhealthy' || dbStatus === 'unhealthy'
        ? 'unhealthy'
        : serviceStatus === 'degraded' || dbStatus === 'degraded'
          ? 'degraded'
          : 'healthy'

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <span className="text-sm font-medium">System Status</span>
          </div>
          {getStatusBadge(overallStatus)}
        </div>

        <div className="space-y-2">
          {/* Service Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">API Service</span>
            </div>
            {getStatusIcon(serviceStatus)}
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {dbHealth?.totalDbSize && (
                <span className="text-xs text-muted-foreground">
                  {dbHealth.totalDbSize}
                </span>
              )}
              {getStatusIcon(dbStatus)}
            </div>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link href={Route.ADMIN_HEALTH}>
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
