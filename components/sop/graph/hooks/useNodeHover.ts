import { useState, useRef, useCallback } from 'react'

interface NodeHoverState {
  hoveredNodeId: string | null
  onNodeMouseEnter: (nodeId: string) => void
  onNodeMouseLeave: () => void
}

const ENTER_DELAY = 300
const LEAVE_DELAY = 150

export function useNodeHover(): NodeHoverState {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onNodeMouseEnter = useCallback((nodeId: string) => {
    // Cancel pending leave
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    // Cancel pending enter for different node
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
    }
    enterTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(nodeId)
    }, ENTER_DELAY)
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    // Cancel pending enter
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null)
    }, LEAVE_DELAY)
  }, [])

  return { hoveredNodeId, onNodeMouseEnter, onNodeMouseLeave }
}
