import { useState } from 'react'

/**
 * Custom hook for managing expandable item state
 *
 * @returns Object with expandedId state, toggle function, and isExpanded checker
 *
 * @example
 * const { expandedId, toggle, isExpanded } = useExpanded();
 *
 * // In render:
 * <ExpandableCard
 *   isExpanded={isExpanded(item.id)}
 *   onToggle={() => toggle(item.id)}
 * />
 */
export function useExpanded() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const isExpanded = (id: string) => expandedId === id

  return { expandedId, setExpandedId, toggle, isExpanded }
}
