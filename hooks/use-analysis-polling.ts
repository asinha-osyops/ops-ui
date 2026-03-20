'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, ProcessingStatus, SopAnalysisDto } from '@/lib/api-client'

/**
 * Analysis session state from trigger response
 */
export interface AnalysisSession {
  sopId: string
  correlationId: string
  stepTaskMap: Record<string, string>
}

/**
 * Polling progress state
 */
export interface AnalysisProgress {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  allComplete: boolean
  message?: string
}

/**
 * Hook result
 */
export interface AnalysisPollingResult {
  // Progress tracking
  progress: AnalysisProgress
  isPolling: boolean

  // Final result (when allComplete)
  sopAnalysis: SopAnalysisDto | null

  // Error state
  error: string | null
}

const INITIAL_PROGRESS: AnalysisProgress = {
  totalTasks: 0,
  completedTasks: 0,
  failedTasks: 0,
  pendingTasks: 0,
  allComplete: false,
}

/**
 * Simplified polling hook for orchestrated SOP analysis.
 *
 * Since step tasks now wait for all child LogLine tasks to complete,
 * we only need to poll the aggregate endpoint - no two-level polling required.
 *
 * @param session Analysis session from trigger response (null to disable)
 * @param options Polling configuration
 */
export function useAnalysisPolling(
  session: AnalysisSession | null,
  options: {
    /** Initial poll interval in ms (default: 2000) */
    initialInterval?: number
    /** Maximum poll interval in ms for exponential backoff (default: 10000) */
    maxInterval?: number
    /** Whether polling is enabled (default: true) */
    enabled?: boolean
  } = {}
): AnalysisPollingResult {
  const {
    initialInterval = 2000,
    maxInterval = 10000,
    enabled = true,
  } = options

  const [progress, setProgress] = useState<AnalysisProgress>(INITIAL_PROGRESS)
  const [sopAnalysis, setSopAnalysis] = useState<SopAnalysisDto | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup and interval management
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef(initialInterval)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Poll function
  const poll = useCallback(async () => {
    if (!session) return

    try {
      const result = await apiClient.getAnalysisAggregateResult(
        session.correlationId,
        session.sopId
      )

      setProgress({
        totalTasks: result.totalTasks,
        completedTasks: result.completedTasks,
        failedTasks: result.failedTasks,
        pendingTasks: result.pendingTasks,
        allComplete: result.allComplete,
        message: result.message,
      })

      if (result.allComplete) {
        // Done! Store the analysis result
        setSopAnalysis(result.sopAnalysis || null)
        setIsPolling(false)
        return true // Signal completion
      }

      return false // Continue polling
    } catch (err) {
      console.error('[useAnalysisPolling] Poll error:', err)
      setError(err instanceof Error ? err.message : 'Polling failed')
      setIsPolling(false)
      return true // Stop polling on error
    }
  }, [session])

  // Start/stop polling when session changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Reset state when session changes
    if (!session) {
      setProgress(INITIAL_PROGRESS)
      setSopAnalysis(null)
      setIsPolling(false)
      setError(null)
      intervalRef.current = initialInterval
      return
    }

    if (!enabled) {
      setIsPolling(false)
      return
    }

    // Initialize progress from stepTaskMap
    const taskCount = Object.keys(session.stepTaskMap).length
    setProgress({
      totalTasks: taskCount,
      completedTasks: 0,
      failedTasks: 0,
      pendingTasks: taskCount,
      allComplete: false,
    })
    setSopAnalysis(null)
    setError(null)
    setIsPolling(true)
    intervalRef.current = initialInterval

    // Polling loop with exponential backoff
    const scheduleNextPoll = async () => {
      const done = await poll()

      if (!done) {
        // Exponential backoff
        intervalRef.current = Math.min(intervalRef.current * 1.5, maxInterval)
        timeoutRef.current = setTimeout(scheduleNextPoll, intervalRef.current)
      }
    }

    // Start first poll immediately
    scheduleNextPoll()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [session, enabled, initialInterval, maxInterval, poll])

  return {
    progress,
    isPolling,
    sopAnalysis,
    error,
  }
}
