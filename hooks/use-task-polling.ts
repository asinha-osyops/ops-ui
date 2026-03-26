'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, ProcessingStatus } from '@/lib/api-client'

export interface TaskStatus {
  taskId: string
  status: ProcessingStatus
  errorMessage?: string
}

export interface TaskPollingOptions {
  interval?: number // default: 1000ms
  enabled?: boolean // default: true
}

export interface TaskPollingResult {
  statuses: Map<string, TaskStatus> // entityId -> TaskStatus
  isPolling: boolean
  completedCount: number
  failedCount: number
  totalCount: number
  allComplete: boolean
}

/**
 * Hook for polling Gemini task statuses
 * @param tasks Map of entityId -> taskId to poll
 * @param options Polling configuration
 * @returns Current statuses and progress metrics
 */
export function useTaskPolling(
  tasks: Map<string, string>, // entityId -> taskId
  options?: TaskPollingOptions
): TaskPollingResult {
  const { interval = 1000, enabled = true } = options || {}

  const [statuses, setStatuses] = useState<Map<string, TaskStatus>>(new Map())
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress metrics
  const totalCount = tasks.size
  const completedCount = Array.from(statuses.values()).filter(
    (s) => s.status === ProcessingStatus.COMPLETED
  ).length
  const failedCount = Array.from(statuses.values()).filter(
    (s) => s.status === ProcessingStatus.FAILED
  ).length
  const allComplete =
    totalCount > 0 && completedCount + failedCount === totalCount

  // Poll all tasks - use ref for statuses to avoid stale closure
  const statusesRef = useRef(statuses)
  useEffect(() => {
    statusesRef.current = statuses
  }, [statuses])

  const pollTasks = useCallback(async () => {
    if (tasks.size === 0) return

    const newStatuses = new Map<string, TaskStatus>()
    const currentStatuses = statusesRef.current

    await Promise.all(
      Array.from(tasks.entries()).map(async ([entityId, taskId]) => {
        try {
          const taskStatus = await apiClient.getGeminiTaskStatus(taskId)
          newStatuses.set(entityId, {
            taskId,
            status: taskStatus.status,
            errorMessage: taskStatus.errorMessage,
          })
        } catch (error) {
          // Keep previous status on error, or mark as failed if no previous
          const prevStatus = currentStatuses.get(entityId)
          newStatuses.set(entityId, {
            taskId,
            status: prevStatus?.status || ProcessingStatus.FAILED,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })
    )

    setStatuses(newStatuses)

    // Check if all complete
    const allDone = Array.from(newStatuses.values()).every(
      (s) =>
        s.status === ProcessingStatus.COMPLETED ||
        s.status === ProcessingStatus.FAILED
    )

    if (allDone && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsPolling(false)
    }
  }, [tasks])

  // Start/stop polling based on tasks and enabled
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Handle empty tasks case
    if (tasks.size === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting state when tasks become empty is intentional
      setStatuses(new Map())
      setIsPolling(false)
      return
    }

    if (!enabled) {
      setIsPolling(false)
      return
    }

    // Initialize statuses with PENDING
    const initialStatuses = new Map<string, TaskStatus>()
    tasks.forEach((taskId, entityId) => {
      initialStatuses.set(entityId, {
        taskId,
        status: ProcessingStatus.PENDING,
      })
    })
    setStatuses(initialStatuses)
    setIsPolling(true)

    // Start polling after initial state is set
    const timeoutId = setTimeout(() => {
      pollTasks()
      intervalRef.current = setInterval(pollTasks, interval)
    }, 0)

    // Cleanup on unmount or when dependencies change
    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [tasks, enabled, interval, pollTasks])

  return {
    statuses,
    isPolling,
    completedCount,
    failedCount,
    totalCount,
    allComplete,
  }
}
