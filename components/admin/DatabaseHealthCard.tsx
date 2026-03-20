'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, DbHealthDto } from '@/lib/api-client'
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
  Database,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatabaseHealthCardProps {
  className?: string
}

export function DatabaseHealthCard({ className }: DatabaseHealthCardProps) {
  const [health, setHealth] = useState<DbHealthDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getDbHealth()
      console.log(
        '[DEBUG] DB Health response:',
        JSON.stringify(response, null, 2)
      )
      setHealth(response)
    } catch (err) {
      console.error('Failed to fetch database health:', err)
      setError('Failed to fetch database health')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  // Determine health status based on log count mismatches
  const hasMismatches = (health?.logCountMismatches ?? 0) > 0
  const hasUnusedIndexes = (health?.unusedIndexes?.length ?? 0) > 0

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Database Health
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchHealth}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Database size and table statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && !health ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <XCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchHealth}
            >
              Retry
            </Button>
          </div>
        ) : health ? (
          <div className="space-y-3">
            {/* Total Database Size */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Size</span>
              <span className="text-sm font-medium">
                {health.totalDbSize || '-'}
              </span>
            </div>

            {/* Tables Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tables</span>
              <span className="text-sm font-medium">
                {health.totalTables ?? '-'}
              </span>
            </div>

            {/* Indexes Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Indexes</span>
              <span className="text-sm font-medium">
                {health.totalIndexes ?? '-'}
              </span>
            </div>

            {/* Log Count Mismatches */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Count Mismatches
              </span>
              <div className="flex items-center gap-2">
                {hasMismatches ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <Badge
                  variant={hasMismatches ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {health.logCountMismatches ?? 0}
                </Badge>
              </div>
            </div>

            {/* Unused Indexes Warning */}
            {hasUnusedIndexes && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Unused Indexes
                </span>
                <Badge variant="secondary" className="text-xs">
                  {health.unusedIndexes?.length}
                </Badge>
              </div>
            )}

            {/* Largest Tables Preview */}
            {health.largestTables && health.largestTables.length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Largest Tables
                </span>
                <div className="mt-1 space-y-1">
                  {health.largestTables.slice(0, 3).map((table) => (
                    <div
                      key={table.tableName}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-mono">{table.tableName}</span>
                      <span className="text-muted-foreground">
                        {table.totalSize}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
