'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { LOADING, ERRORS } from '@/lib/constants/ui-strings'

interface UseEntityDetailOptions<T> {
  /** The entity ID to fetch */
  entityId: string
  /** Function to fetch the entity by ID */
  fetchFn: (id: string) => Promise<T | null>
  /** The entity type name for error messages (e.g., 'SOP', 'Log') */
  entityTypeName: string
}

interface UseEntityDetailResult<T> {
  /** The fetched entity, or null if not loaded */
  entity: T | null
  /** Whether the entity is currently loading */
  loading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Function to refetch the entity */
  refetch: () => Promise<void>
  /** Loading message for this entity type */
  loadingMessage: string
  /** Not found error message for this entity type */
  notFoundMessage: string
}

/**
 * Hook for fetching and managing entity detail state.
 * Handles loading, error, and refetch patterns common to detail pages.
 *
 * @example
 * const { entity: sop, loading, error, refetch } = useEntityDetail({
 *   entityId: sopId,
 *   fetchFn: (id) => apiClient.getSopById(id),
 *   entityTypeName: 'SOP',
 * });
 */
export function useEntityDetail<T>({
  entityId,
  fetchFn,
  entityTypeName,
}: UseEntityDetailOptions<T>): UseEntityDetailResult<T> {
  const [entity, setEntity] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to store fetchFn to avoid infinite loops when passed inline
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const loadingMessage = LOADING.entity(entityTypeName)
  const notFoundMessage = ERRORS.notFound(entityTypeName)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFnRef.current(entityId)
      if (!data) {
        setError(notFoundMessage)
        return
      }
      setEntity(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : ERRORS.loadFailed(entityTypeName)
      )
    } finally {
      setLoading(false)
    }
  }, [entityId, entityTypeName, notFoundMessage])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    entity,
    loading,
    error,
    refetch,
    loadingMessage,
    notFoundMessage,
  }
}
