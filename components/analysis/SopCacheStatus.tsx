'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, SopCacheInfoDto } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, Database, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SopCacheStatusProps {
  sopId: string
  sopName?: string
  className?: string
  /** Called after cache is invalidated */
  onCacheInvalidated?: () => void
}

export function SopCacheStatus({
  sopId,
  sopName,
  className,
  onCacheInvalidated,
}: SopCacheStatusProps) {
  const [cacheInfo, setCacheInfo] = useState<SopCacheInfoDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [invalidating, setInvalidating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchCacheInfo = useCallback(async () => {
    if (!sopId) return
    setLoading(true)
    try {
      const info = await apiClient.getSopCacheInfo(sopId)
      setCacheInfo(info)
    } catch (error) {
      console.error('Failed to fetch cache info:', error)
    } finally {
      setLoading(false)
    }
  }, [sopId])

  useEffect(() => {
    if (isOpen && sopId) {
      fetchCacheInfo()
    }
  }, [isOpen, sopId, fetchCacheInfo])

  const handleInvalidateCache = async () => {
    if (!sopId) return
    setInvalidating(true)
    try {
      await apiClient.invalidateSopCache(sopId)
      toast.success('Analysis results cleared')
      setCacheInfo(null)
      onCacheInvalidated?.()
    } catch (error) {
      toast.error('Failed to clear analysis results')
      console.error('Failed to invalidate cache:', error)
    } finally {
      setInvalidating(false)
    }
  }

  const hasResults = cacheInfo && cacheInfo.stepsWithResults > 0
  const totalLogLineTasks = cacheInfo?.progress?.totalLogLineTasks ?? 0

  return (
    <Card className={cn('', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                Analysis Results
              </CardTitle>
              {hasResults && (
                <Badge variant="secondary" className="text-xs">
                  {cacheInfo.stepsWithResults}/{cacheInfo.totalSteps} steps
                </Badge>
              )}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CardDescription className="text-xs">
            {sopName
              ? `Stored results for ${sopName}`
              : 'View and manage stored analysis results'}
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading results...
                </span>
              </div>
            ) : cacheInfo ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {cacheInfo.stepsWithResults}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Steps w/ Results
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {cacheInfo.totalSteps}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Steps
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {totalLogLineTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Log Line Tasks
                    </div>
                  </div>
                </div>

                {/* Step Details */}
                {cacheInfo.stepResults && cacheInfo.stepResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      Step Results
                    </div>
                    <ScrollArea className="h-48">
                      <div className="space-y-1 pr-4">
                        {cacheInfo.stepResults.map((step) => {
                          const logLineResults = step.logLineResults ?? []
                          const totalLogLines = logLineResults.reduce(
                            (sum, r) => sum + r.matchingLogLineCount,
                            0
                          )
                          return (
                            <div
                              key={step.stepId}
                              className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                            >
                              <span
                                className="truncate max-w-[150px]"
                                title={step.stepName}
                              >
                                {step.stepName}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {step.activityEventCount} AE
                                </Badge>
                                {logLineResults.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {totalLogLines} log lines
                                  </Badge>
                                )}
                                {step.fullyComplete ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-green-500 text-green-600"
                                  >
                                    Done
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-yellow-500 text-yellow-600"
                                  >
                                    {step.completedLogLineTasks}/
                                    {step.totalLogLineTasks}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCacheInfo}
                    disabled={loading}
                    className="text-xs"
                  >
                    <RefreshCw
                      className={cn('h-3 w-3 mr-1', loading && 'animate-spin')}
                    />
                    Refresh
                  </Button>
                  {hasResults && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleInvalidateCache}
                      disabled={invalidating}
                      className="text-xs"
                    >
                      <Trash2
                        className={cn(
                          'h-3 w-3 mr-1',
                          invalidating && 'animate-pulse'
                        )}
                      />
                      Clear Results
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No analysis results stored for this SOP
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
