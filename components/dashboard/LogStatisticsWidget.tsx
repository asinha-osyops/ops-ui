'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, LogMetricsDto } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Route } from '@/lib/routes'
import { BarChart3, PieChart } from 'lucide-react'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { PLATFORM_LABELS } from '@/lib/config/logline-query-config'
import { Platform } from '@/lib/api-client'

export function LogStatisticsWidget() {
  const router = useRouter()
  const [statistics, setStatistics] = useState<LogMetricsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.getLogMetrics()
        setStatistics(data)
      } catch (err) {
        console.error('Failed to fetch log statistics:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <Card className="shadow-accent">
        <CardHeader className="border-b border-border p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Log Activity Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !statistics) {
    return (
      <Card className="shadow-accent">
        <CardHeader className="border-b border-border p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Log Activity Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="text-center py-8 text-sm text-muted-foreground">
            {error ||
              'No log activity data available. Upload logs to see analytics.'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const {
    totalCount,
    totalLineCount,
    lineCountByPlatform,
    lineCountByService,
    topEventCategories,
  } = statistics

  // Calculate total from platform counts
  const platformTotal = Object.values(lineCountByPlatform).reduce(
    (sum, count) => sum + count,
    0
  )

  // Convert service map to sorted array for display
  const topServices = Object.entries(lineCountByService)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <Card className="shadow-accent">
      <CardHeader className="border-b border-border p-4 md:p-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Log Activity Analytics
        </CardTitle>
        <Button
          variant="link"
          size="sm"
          className="text-primary"
          onClick={() => router.push(Route.LOG_LINES)}
        >
          Query Log Lines →
        </Button>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {/* Total Count Header */}
        <div className="mb-6 text-center pb-4 border-b border-border">
          <div className="text-4xl font-bold text-foreground">
            {totalLineCount.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Log Lines across {totalCount} log{totalCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Platform Distribution */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              By Platform
            </h4>
            <div className="space-y-2">
              {Object.entries(lineCountByPlatform).map(([platform, count]) => {
                const percentage =
                  platformTotal > 0
                    ? Math.round((count / platformTotal) * 100)
                    : 0
                return (
                  <div
                    key={platform}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {PLATFORM_LABELS[platform as Platform] || platform}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
              {Object.keys(lineCountByPlatform).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No data</p>
              )}
            </div>
          </div>

          {/* Top Services */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Top Services
            </h4>
            <div className="space-y-2">
              {topServices.map((item) => {
                const percentage =
                  totalLineCount > 0
                    ? Math.round((item.count / totalLineCount) * 100)
                    : 0
                return (
                  <div
                    key={item.service}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm truncate max-w-[120px]">
                      {item.service}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
              {topServices.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No data</p>
              )}
            </div>
          </div>

          {/* Top Event Categories */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Top Event Categories
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {topEventCategories.slice(0, 8).map((item) => (
                <Badge
                  key={item.eventCategory}
                  variant="secondary"
                  className="text-xs"
                >
                  {formatEnumTitleCase(item.eventCategory)} (
                  {item.count.toLocaleString()})
                </Badge>
              ))}
              {topEventCategories.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No data</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
