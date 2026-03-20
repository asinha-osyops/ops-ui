'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { Node, Edge, MarkerType } from 'reactflow'
import {
  apiClient,
  OrgChartResponseDto,
  OrgChartNodeDto,
} from '@/lib/api-client'
import { EmployeeNodeData } from '../graph-nodes/EmployeeNode'

// Layout constants
const NODE_WIDTH = 180
const NODE_HEIGHT = 80
const HORIZONTAL_SPACING = 220
const VERTICAL_SPACING = 120

interface TreeNode {
  id: string
  parentId?: string
  children: string[]
  data: OrgChartNodeDto
}

export interface UseOrgChartDataReturn {
  nodes: Node<EmployeeNodeData>[]
  edges: Edge[]
  isInitialLoading: boolean
  loadRootNodes: (companyId: string) => Promise<void>
  loadCenteredView: (companyId: string, employeeId: string) => Promise<void>
  expandDown: (employeeId: string) => Promise<void>
  expandUp: (employeeId: string) => Promise<void>
  reset: () => void
}

export function useOrgChartData(companyId: string): UseOrgChartDataReturn {
  // Core state
  const [nodeDataMap, setNodeDataMap] = useState<Map<string, OrgChartNodeDto>>(
    new Map()
  )
  const [edgeSet, setEdgeSet] = useState<Set<string>>(new Set()) // "source:target" format
  const [expandedDownIds, setExpandedDownIds] = useState<Set<string>>(new Set())
  const [expandedUpIds, setExpandedUpIds] = useState<Set<string>>(new Set())
  const [loadingNodeIds, setLoadingNodeIds] = useState<Set<string>>(new Set())
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  // Cache for API responses
  const cacheRef = useRef<Map<string, OrgChartResponseDto>>(new Map())

  // Build parent-child relationships from edges
  const { parentMap, childrenMap } = useMemo(() => {
    const pMap = new Map<string, string>() // child -> parent
    const cMap = new Map<string, string[]>() // parent -> children

    edgeSet.forEach((edgeKey) => {
      const [source, target] = edgeKey.split(':')
      pMap.set(target, source)
      const existing = cMap.get(source) || []
      if (!existing.includes(target)) {
        cMap.set(source, [...existing, target])
      }
    })

    return { parentMap: pMap, childrenMap: cMap }
  }, [edgeSet])

  // Calculate tree layout positions
  const calculateLayout = useCallback((): Map<
    string,
    { x: number; y: number }
  > => {
    const positions = new Map<string, { x: number; y: number }>()
    const nodeIds = Array.from(nodeDataMap.keys())

    if (nodeIds.length === 0) return positions

    // Find root nodes (nodes with no parent in our current view)
    const rootIds = nodeIds.filter((id) => !parentMap.has(id))

    // Calculate subtree widths
    const subtreeWidths = new Map<string, number>()

    const calculateSubtreeWidth = (nodeId: string): number => {
      const children = childrenMap.get(nodeId) || []
      const visibleChildren = children.filter((cId) => nodeDataMap.has(cId))

      if (visibleChildren.length === 0) {
        subtreeWidths.set(nodeId, NODE_WIDTH)
        return NODE_WIDTH
      }

      const childrenWidth = visibleChildren.reduce((sum, childId) => {
        return sum + calculateSubtreeWidth(childId) + HORIZONTAL_SPACING
      }, -HORIZONTAL_SPACING) // Remove extra spacing at end

      const width = Math.max(NODE_WIDTH, childrenWidth)
      subtreeWidths.set(nodeId, width)
      return width
    }

    rootIds.forEach((rootId) => calculateSubtreeWidth(rootId))

    // Position nodes
    const positionNode = (
      nodeId: string,
      level: number,
      leftBound: number
    ): number => {
      const children = childrenMap.get(nodeId) || []
      const visibleChildren = children.filter((cId) => nodeDataMap.has(cId))
      const subtreeWidth = subtreeWidths.get(nodeId) || NODE_WIDTH

      // Position children first
      let currentLeft = leftBound
      visibleChildren.forEach((childId) => {
        currentLeft = positionNode(childId, level + 1, currentLeft)
        currentLeft += HORIZONTAL_SPACING
      })

      // Calculate this node's X position (centered over children)
      let x: number
      if (visibleChildren.length === 0) {
        x = leftBound + NODE_WIDTH / 2
      } else {
        const firstChild = positions.get(visibleChildren[0])
        const lastChild = positions.get(
          visibleChildren[visibleChildren.length - 1]
        )
        if (firstChild && lastChild) {
          x = (firstChild.x + lastChild.x) / 2
        } else {
          x = leftBound + subtreeWidth / 2
        }
      }

      const y = level * (NODE_HEIGHT + VERTICAL_SPACING)
      positions.set(nodeId, { x, y })

      return leftBound + subtreeWidth
    }

    // Position each root and its subtree
    let currentLeft = 0
    rootIds.forEach((rootId) => {
      currentLeft = positionNode(rootId, 0, currentLeft)
      currentLeft += HORIZONTAL_SPACING * 2 // Extra spacing between root subtrees
    })

    return positions
  }, [nodeDataMap, parentMap, childrenMap])

  // Convert to ReactFlow nodes
  const nodes = useMemo((): Node<EmployeeNodeData>[] => {
    const positions = calculateLayout()

    return Array.from(nodeDataMap.entries()).map(([id, nodeData]) => {
      const position = positions.get(id) || { x: 0, y: 0 }

      return {
        id,
        type: 'employeeNode',
        position,
        data: {
          employeeId: id,
          name: nodeData.name,
          email: nodeData.email,
          roleTitle: nodeData.roleTitle,
          hasDirectReports: nodeData.hasDirectReports,
          hasManager: nodeData.hasManager,
          isExpandedDown: expandedDownIds.has(id),
          isExpandedUp: expandedUpIds.has(id),
          isLoading: loadingNodeIds.has(id),
          onExpandDown: () => {}, // Will be overwritten in OrgChartGraphView
          onExpandUp: () => {}, // Will be overwritten in OrgChartGraphView
        },
      }
    })
  }, [
    nodeDataMap,
    expandedDownIds,
    expandedUpIds,
    loadingNodeIds,
    calculateLayout,
  ])

  // Convert to ReactFlow edges
  const edges = useMemo((): Edge[] => {
    return Array.from(edgeSet).map((edgeKey) => {
      const [source, target] = edgeKey.split(':')
      return {
        id: `edge-${source}-${target}`,
        source,
        target,
        type: 'smoothstep',
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
        },
      }
    })
  }, [edgeSet])

  // Merge response data into state
  const mergeResponse = useCallback((response: OrgChartResponseDto) => {
    setNodeDataMap((prev) => {
      const updated = new Map(prev)
      response.nodes.forEach((node) => {
        updated.set(node.id, node)
      })
      return updated
    })

    setEdgeSet((prev) => {
      const updated = new Set(prev)
      response.edges.forEach((edge) => {
        updated.add(`${edge.source}:${edge.target}`)
      })
      return updated
    })
  }, [])

  // Load root nodes
  const loadRootNodes = useCallback(
    async (cId: string) => {
      const cacheKey = `roots:${cId}`
      if (cacheRef.current.has(cacheKey)) {
        mergeResponse(cacheRef.current.get(cacheKey)!)
        return
      }

      setIsInitialLoading(true)
      try {
        const response = await apiClient.getOrgChartRoots(cId)
        cacheRef.current.set(cacheKey, response)
        mergeResponse(response)
      } finally {
        setIsInitialLoading(false)
      }
    },
    [mergeResponse]
  )

  // Load centered view
  const loadCenteredView = useCallback(
    async (cId: string, employeeId: string) => {
      const cacheKey = `centered:${cId}:${employeeId}`
      if (cacheRef.current.has(cacheKey)) {
        mergeResponse(cacheRef.current.get(cacheKey)!)
        return
      }

      setIsInitialLoading(true)
      try {
        const response = await apiClient.getOrgChartEmployee(cId, employeeId)
        cacheRef.current.set(cacheKey, response)
        mergeResponse(response)
      } finally {
        setIsInitialLoading(false)
      }
    },
    [mergeResponse]
  )

  // Expand down (get direct reports)
  const expandDown = useCallback(
    async (employeeId: string) => {
      if (expandedDownIds.has(employeeId)) return

      const cacheKey = `down:${companyId}:${employeeId}`
      if (cacheRef.current.has(cacheKey)) {
        mergeResponse(cacheRef.current.get(cacheKey)!)
        setExpandedDownIds((prev) => new Set(prev).add(employeeId))
        return
      }

      setLoadingNodeIds((prev) => new Set(prev).add(employeeId))
      try {
        const response = await apiClient.getOrgChartDirectReports(
          companyId,
          employeeId
        )
        cacheRef.current.set(cacheKey, response)
        mergeResponse(response)
        setExpandedDownIds((prev) => new Set(prev).add(employeeId))
      } finally {
        setLoadingNodeIds((prev) => {
          const updated = new Set(prev)
          updated.delete(employeeId)
          return updated
        })
      }
    },
    [companyId, expandedDownIds, mergeResponse]
  )

  // Expand up (get manager chain)
  const expandUp = useCallback(
    async (employeeId: string) => {
      if (expandedUpIds.has(employeeId)) return

      const cacheKey = `up:${companyId}:${employeeId}`
      if (cacheRef.current.has(cacheKey)) {
        mergeResponse(cacheRef.current.get(cacheKey)!)
        setExpandedUpIds((prev) => new Set(prev).add(employeeId))
        return
      }

      setLoadingNodeIds((prev) => new Set(prev).add(employeeId))
      try {
        const response = await apiClient.getOrgChartManagerChain(
          companyId,
          employeeId
        )
        cacheRef.current.set(cacheKey, response)
        mergeResponse(response)
        setExpandedUpIds((prev) => new Set(prev).add(employeeId))
      } finally {
        setLoadingNodeIds((prev) => {
          const updated = new Set(prev)
          updated.delete(employeeId)
          return updated
        })
      }
    },
    [companyId, expandedUpIds, mergeResponse]
  )

  // Reset all state
  const reset = useCallback(() => {
    setNodeDataMap(new Map())
    setEdgeSet(new Set())
    setExpandedDownIds(new Set())
    setExpandedUpIds(new Set())
    setLoadingNodeIds(new Set())
    cacheRef.current.clear()
  }, [])

  return {
    nodes,
    edges,
    isInitialLoading,
    loadRootNodes,
    loadCenteredView,
    expandDown,
    expandUp,
    reset,
  }
}
