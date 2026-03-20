'use client'

import { useCallback } from 'react'
import { TraceSopStepsResponseDto } from '@/lib/api-client'

/**
 * Cached analysis data structure
 */
export interface CachedAnalysis {
  results: TraceSopStepsResponseDto
  timestamp: string
  sopUpdatedAt: string
}

const CACHE_KEY_PREFIX = 'sop-analysis-'

/**
 * Hook for caching analysis results in sessionStorage.
 * Results persist across navigation but are cleared when the tab closes.
 *
 * @param sopId The SOP ID to cache results for
 */
export function useAnalysisCache(sopId: string) {
  const cacheKey = `${CACHE_KEY_PREFIX}${sopId}`

  /**
   * Get cached analysis results
   */
  const getCached = useCallback((): CachedAnalysis | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (!cached) return null

      return JSON.parse(cached) as CachedAnalysis
    } catch (error) {
      console.error('[useAnalysisCache] Failed to read cache:', error)
      return null
    }
  }, [cacheKey])

  /**
   * Cache analysis results
   */
  const setCached = useCallback(
    (results: TraceSopStepsResponseDto, sopUpdatedAt: string) => {
      if (typeof window === 'undefined') return

      try {
        const cacheData: CachedAnalysis = {
          results,
          timestamp: new Date().toISOString(),
          sopUpdatedAt,
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.error('[useAnalysisCache] Failed to write cache:', error)
      }
    },
    [cacheKey]
  )

  /**
   * Clear cached results
   */
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(cacheKey)
    } catch (error) {
      console.error('[useAnalysisCache] Failed to clear cache:', error)
    }
  }, [cacheKey])

  /**
   * Check if cached results are stale (SOP has been updated since cache was created)
   */
  const isStale = useCallback(
    (currentSopUpdatedAt: string): boolean => {
      const cached = getCached()
      if (!cached) return true

      // Compare timestamps - if SOP was updated after cache, it's stale
      return new Date(currentSopUpdatedAt) > new Date(cached.sopUpdatedAt)
    },
    [getCached]
  )

  return {
    getCached,
    setCached,
    clearCache,
    isStale,
  }
}
