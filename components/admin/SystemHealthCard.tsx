'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemHealthCardProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export function SystemHealthCard({
  className,
  autoRefresh = false,
  refreshInterval = 30000,
}: SystemHealthCardProps) {
  const [status, setStatus] = useState<HealthStatus>('unknown')
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.getServiceHealth()
      console.log(
        '[DEBUG] Service Health response:',
        JSON.stringify(response, null, 2)
      )
      // Map response status to our HealthStatus type
      const statusStr = response.status.toLowerCase()
      if (statusStr === 'up' || statusStr === 'ok' || statusStr === 'healthy') {
        setStatus('healthy')
      } else if (statusStr === 'degraded' || statusStr === 'warning') {
        setStatus('degraded')
      } else {
        setStatus('unhealthy')
      }
      setLastChecked(new Date())
    } catch (error) {
      console.error('Failed to check service health:', error)
      setStatus('unhealthy')
      setLastChecked(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()

    if (autoRefresh) {
      const interval = setInterval(checkHealth, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [checkHealth, autoRefresh, refreshInterval])

  const getStatusConfig = (s: HealthStatus) => {
    switch (s) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          badge: 'bg-green-500/20 text-green-700 dark:text-green-400',
          label: 'Healthy',
        }
      case 'degraded':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          badge: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
          label: 'Degraded',
        }
      case 'unhealthy':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          badge: 'bg-red-500/20 text-red-700 dark:text-red-400',
          label: 'Unhealthy',
        }
      default:
        return {
          icon: Activity,
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          badge: 'bg-muted text-muted-foreground',
          label: 'Unknown',
        }
    }
  }

  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Service Status
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={checkHealth}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
        <CardDescription className="text-xs">
          {lastChecked
            ? `Last checked: ${lastChecked.toLocaleTimeString()}`
            : 'Checking status...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'flex items-center justify-center p-6 rounded-lg',
            config.bg
          )}
        >
          <StatusIcon className={cn('h-12 w-12', config.color)} />
        </div>
        <div className="mt-4 text-center">
          <Badge className={config.badge}>{config.label}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
