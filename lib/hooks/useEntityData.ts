import { useMemo } from 'react'

/**
 * Converts Map to Array with standardized naming and utility properties
 * @param entityMap - Map of entities from app context
 * @param isLoading - Loading state from app context
 */
export function useEntityData<T>(
  entityMap: Map<string, T>,
  isLoading: boolean
) {
  const entities = useMemo(() => Array.from(entityMap.values()), [entityMap])

  return {
    entities,
    loading: isLoading,
    count: entities.length,
    isEmpty: entities.length === 0 && !isLoading,
  }
}
