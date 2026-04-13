import { useState } from 'react'

/**
 * Custom hook for managing expandable table rows
 * Allows only one row to be expanded at a time
 */
export function useExpandableRows() {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id)
  }

  const isExpanded = (id: string) => expandedRowId === id

  const collapseAll = () => setExpandedRowId(null)

  return {
    expandedRowId,
    toggleRow,
    isExpanded,
    collapseAll,
  }
}
