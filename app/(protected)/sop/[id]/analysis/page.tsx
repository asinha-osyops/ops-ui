'use client'

import { useEffect, useState, useCallback, lazy, Suspense, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiClient, SopDto, TraceSopStepsResponseDto } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/PageLayout'
import { Spinner } from '@/components/ui/spinner'
import { useAppContext } from '@/lib/app-context'
import { toast } from 'sonner'
import { CompanyRequiredAlert } from '@/components/ui/CompanyRequiredAlert'
import {
  useAnalysisPolling,
  AnalysisSession,
} from '@/hooks/use-analysis-polling'
import { useAnalysisCache } from '@/hooks/use-analysis-cache'
import { useEntityDetail } from '@/lib/hooks/useEntityDetail'
import { Route, Breadcrumbs } from '@/lib/routes'
import { getStringParam } from '@/lib/utils/route-params'
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  ANALYSIS_CONSTANTS,
  getErrorDescription,
} from '@/lib/utils/analysis-constants'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'

// Lazy load the heavy analysis results component
const TraceSopStepsResults = lazy(() =>
  import('@/components/analysis/TraceSopStepsResults').then((m) => ({
    default: m.TraceSopStepsResults,
  }))
)

// Lazy load cache status component
const SopCacheStatus = lazy(() =>
  import('@/components/analysis/SopCacheStatus').then((m) => ({
    default: m.SopCacheStatus,
  }))
)

/**
 * Error fallback component for results rendering errors
 */
function ResultsErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown
  resetErrorBoundary: () => void
}) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Error displaying results</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Format a timestamp for display
 */
function formatAnalysisTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  return date.toLocaleString()
}

export default function SopAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const sopId = getStringParam(params.id)
  const { selectedCompany } = useAppContext()

  const [results, setResults] = useState<TraceSopStepsResponseDto | null>(null)
  const [analysisSession, setAnalysisSession] =
    useState<AnalysisSession | null>(null)
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null)
  const [isCacheStale, setIsCacheStale] = useState(false)

  // Track if we've already auto-started to prevent multiple triggers
  const hasAutoStarted = useRef(false)

  // Fetch SOP using the entity detail hook
  const {
    entity: sop,
    loading: sopLoading,
    error: sopError,
  } = useEntityDetail<SopDto>({
    entityId: sopId,
    fetchFn: (id) => apiClient.getSopById(id),
    entityTypeName: 'SOP',
  })

  // Analysis cache
  const { getCached, setCached, clearCache, isStale } = useAnalysisCache(sopId)

  // Polling hook
  const { progress, isPolling, sopAnalysis, error } =
    useAnalysisPolling(analysisSession)

  // Get the SOP's "last modified" timestamp for staleness detection
  // Use lastValidatedAt if available, otherwise fall back to createdAt
  const getSopTimestamp = useCallback((s: SopDto): string => {
    return s.lastValidatedAt || s.createdAt
  }, [])

  // Check for cached results on mount and auto-start if needed
  useEffect(() => {
    if (!sop || hasAutoStarted.current) return

    const cached = getCached()
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restoring cached state on mount is intentional, not a cascading render
      setResults(cached.results)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedTimestamp(cached.timestamp)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCacheStale(isStale(getSopTimestamp(sop)))
      hasAutoStarted.current = true
    }
  }, [sop, getCached, isStale, getSopTimestamp])

  // Keep a ref to handleTrace to avoid circular useEffect dependency
  const handleTraceRef = useRef<() => void>(() => {})

  // Auto-start analysis if no cached results and SOP is loaded
  useEffect(() => {
    if (!sop || !selectedCompany?.id || hasAutoStarted.current) return

    // No cached results, auto-start analysis
    hasAutoStarted.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Triggering analysis on mount via ref is intentional
    handleTraceRef.current()
  }, [sop, selectedCompany?.id])

  // Handle polling completion
  useEffect(() => {
    if (!sopAnalysis || !analysisSession || !sop) return

    const buildResults = async () => {
      try {
        // Build the response from sopAnalysis
        const aggregatedResults: TraceSopStepsResponseDto = {
          sop,
          stepAnalyses: sopAnalysis.steps,
          edges: sopAnalysis.edges,
        }

        setResults(aggregatedResults)
        setAnalysisSession(null)
        setCachedTimestamp(new Date().toISOString())
        setIsCacheStale(false)

        // Cache the results
        setCached(aggregatedResults, getSopTimestamp(sop))

        // Show completion message
        if (progress.failedTasks > 0) {
          toast.warning(
            ANALYSIS_CONSTANTS.ERRORS.TASKS_FAILED(progress.failedTasks)
          )
        } else {
          toast.success(ANALYSIS_CONSTANTS.SUCCESS.TRACE_COMPLETE)
        }
      } catch (err) {
        toast.error(ANALYSIS_CONSTANTS.ERRORS.FETCH_RESULTS, {
          description: getErrorDescription(err),
        })
        setAnalysisSession(null)
      }
    }

    buildResults()
  }, [
    sopAnalysis,
    analysisSession,
    sop,
    progress.failedTasks,
    setCached,
    getSopTimestamp,
  ])

  // Handle polling errors
  useEffect(() => {
    if (error) {
      toast.error(ANALYSIS_CONSTANTS.ERRORS.FETCH_RESULTS, {
        description: error,
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clearing session on error is intentional cleanup
      setAnalysisSession(null)
    }
  }, [error])

  const handleTrace = async () => {
    if (!selectedCompany?.id) {
      toast.error('Please select a company from the sidebar')
      return
    }
    if (!sopId) {
      toast.error('SOP ID is required')
      return
    }

    setResults(null)
    setCachedTimestamp(null)
    setIsCacheStale(false)
    clearCache()

    try {
      const response = await apiClient.analyzeSopOrchestrated({
        companyId: selectedCompany.id,
        sopId: sopId,
      })

      if (response) {
        const taskCount = Object.keys(response.stepTaskMap).length
        if (taskCount === 0) {
          toast.warning(ANALYSIS_CONSTANTS.INFO.NO_STEPS, {
            description: ANALYSIS_CONSTANTS.INFO.NO_STEPS_DESCRIPTION,
          })
          return
        }

        setAnalysisSession({
          sopId: response.sopId,
          correlationId: response.correlationId,
          stepTaskMap: response.stepTaskMap,
        })
        toast.info(ANALYSIS_CONSTANTS.INFO.ANALYZING_STEPS(taskCount))
      }
    } catch (err) {
      toast.error(ANALYSIS_CONSTANTS.ERRORS.START_TRACE, {
        description: getErrorDescription(err),
      })
    }
  }

  // Keep ref in sync for auto-start effect
  useEffect(() => {
    handleTraceRef.current = handleTrace
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel analysis
      if (e.key === 'Escape') {
        if (isPolling) {
          e.preventDefault()
          setAnalysisSession(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPolling])

  // Check if tracing is in progress
  const isTracing = isPolling || analysisSession !== null

  // Loading state
  if (sopLoading) {
    return (
      <main className="flex-1 p-8 overflow-auto font-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">Loading SOP...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show alert if no company selected
  if (!selectedCompany) {
    return (
      <PageLayout
        title="SOP Analysis"
        breadcrumbs={[
          { label: 'SOPs', route: Route.SOP_HOME },
          { label: 'Analysis' },
        ]}
      >
        <CompanyRequiredAlert />
      </PageLayout>
    )
  }

  // Error state
  if (sopError || !sop) {
    return (
      <PageLayout
        title="SOP Not Found"
        breadcrumbs={[
          { label: 'SOPs', route: Route.SOP_HOME },
          { label: 'Not Found' },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {sopError || 'SOP not found'}
          </p>
          <Button onClick={() => router.push(Route.SOP_HOME)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to SOPs
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`Analysis: ${sop.name}`}
      breadcrumbs={Breadcrumbs.sop.analysis(sop.name, sop.id)}
      headerActions={
        <div className="flex items-center gap-2">
          {!isTracing && results && (
            <Button variant="outline" onClick={handleTrace}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-run Analysis
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(Route.SOP_DETAIL(sop.id))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to SOP
          </Button>
        </div>
      }
    >
      {/* Stale cache warning */}
      {isCacheStale && results && !isTracing && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            The SOP has been modified since this analysis was run. Results may
            be outdated.
            <Button
              variant="link"
              className="text-yellow-700 dark:text-yellow-300 underline ml-2 p-0 h-auto"
              onClick={handleTrace}
            >
              Re-run analysis
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cached results timestamp */}
      {cachedTimestamp && results && !isTracing && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last analyzed: {formatAnalysisTime(cachedTimestamp)}</span>
        </div>
      )}

      {/* Splash Screen while tracing */}
      {isTracing && (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">
            Analyzing SOP, please stay on page...
          </p>

          {/* Progress section */}
          <div className="mt-4 mb-6 w-full max-w-md space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  Step Analysis
                </span>
                <span className="text-muted-foreground">
                  {progress.completedTasks + progress.failedTasks} /{' '}
                  {progress.totalTasks}
                </span>
              </div>
              <Progress
                value={
                  progress.totalTasks > 0
                    ? ((progress.completedTasks + progress.failedTasks) /
                        progress.totalTasks) *
                      100
                    : 0
                }
                className="h-2"
              />
              {progress.failedTasks > 0 && (
                <p className="text-xs text-destructive">
                  {progress.failedTasks} task
                  {progress.failedTasks > 1 ? 's' : ''} failed
                </p>
              )}
            </div>

            {/* Status message */}
            {progress.message && (
              <p className="text-sm text-muted-foreground text-center">
                {progress.message}
              </p>
            )}

            {/* Escape hint */}
            <p className="text-xs text-muted-foreground text-center">
              Press{' '}
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                Esc
              </kbd>{' '}
              to cancel
            </p>
          </div>

          {/* Step list showing status */}
          <div className="w-full max-w-lg space-y-2">
            {sop.steps.map((step) => {
              const taskId = analysisSession?.stepTaskMap[step.id]
              const hasTask = !!taskId

              return (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                >
                  <span className="text-sm truncate flex-1 mr-2">
                    {step.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${hasTask ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground/60'}`}
                  >
                    {hasTask ? 'Queued' : 'Skipped'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Backend Cache Status (shown when not tracing) */}
      {!isTracing && (
        <Suspense
          fallback={
            <div className="h-16 animate-pulse bg-muted rounded-lg mb-6" />
          }
        >
          <SopCacheStatus sopId={sop.id} sopName={sop.name} className="mb-6" />
        </Suspense>
      )}

      {/* Results with Error Boundary */}
      {results && !isTracing && (
        <ErrorBoundary
          FallbackComponent={ResultsErrorFallback}
          onReset={() => {
            setResults(null)
          }}
        >
          <Suspense
            fallback={
              <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <Skeleton className="h-6 w-64 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex h-[700px]">
                  <div className="flex-1 p-4">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                </div>
              </div>
            }
          >
            <TraceSopStepsResults results={results} />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* No results yet and not tracing - shouldn't happen normally but handle it */}
      {!results && !isTracing && (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-card rounded-lg shadow-sm border border-border p-6">
          <p className="text-muted-foreground mb-4">
            No analysis results available.
          </p>
          <Button onClick={handleTrace}>Run Analysis</Button>
        </div>
      )}
    </PageLayout>
  )
}
