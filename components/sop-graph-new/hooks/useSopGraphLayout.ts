import { useMemo } from 'react'
import { StepDto, EdgeDto } from '@/lib/api-client'
import {
  useDagLayoutGeneric,
  type StepAccessors,
  type EdgeAccessors,
  type LayoutDirection,
} from '@/lib/hooks/useDagLayoutGeneric'
import { LAYOUT_DEFAULTS } from '../nodes/node-config'

const stepAccessors: StepAccessors<StepDto> = {
  getId: (s) => s.id,
  getName: (s) => s.name,
  getDetails: (s) => s.details,
  getNodeType: (s) => s.nodeType,
  getIsFork: (s) => s.isFork,
  getIsJoin: (s) => s.isJoin,
  getActorRoleTitle: (s) => s.actorRoleTitle,
}

const edgeAccessors: EdgeAccessors<EdgeDto> = {
  getId: (e) => e.id,
  getFrom: (e) => e.from,
  getTo: (e) => e.to,
}

export function useSopGraphLayout(
  steps: StepDto[],
  edges: EdgeDto[],
  selectedStepId: string | null = null,
  direction: LayoutDirection = LAYOUT_DEFAULTS.direction
) {
  const options = useMemo(
    () => ({
      direction,
      nodeWidth: LAYOUT_DEFAULTS.nodeWidth,
      nodeHeight: LAYOUT_DEFAULTS.nodeHeight,
      rankSep: LAYOUT_DEFAULTS.rankSep,
      nodeSep: LAYOUT_DEFAULTS.nodeSep,
      edgeType: 'animated',
    }),
    [direction]
  )

  return useDagLayoutGeneric<StepDto, EdgeDto>(
    steps,
    edges,
    stepAccessors,
    edgeAccessors,
    selectedStepId,
    null,
    'sopGraphNewNode',
    options
  )
}
