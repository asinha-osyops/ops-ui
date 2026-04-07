import { Play, Square, CircleDot, type LucideIcon } from 'lucide-react'
import { StepNodeType } from '@/lib/api-client'

export interface NodeTypeConfig {
  icon: LucideIcon
  iconColor: string
  accentBorder: string
  label: string
  width: number
  height: number
}

export const NODE_CONFIG: Record<StepNodeType, NodeTypeConfig> = {
  START: {
    icon: Play,
    iconColor: 'text-green-600 dark:text-green-400',
    accentBorder: 'border-l-green-500 dark:border-l-green-400',
    label: 'Start',
    width: 200,
    height: 80,
  },
  STEP: {
    icon: CircleDot,
    iconColor: 'text-orange-600 dark:text-orange-400',
    accentBorder: 'border-l-orange-500',
    label: 'Step',
    width: 260,
    height: 120,
  },
  END: {
    icon: Square,
    iconColor: 'text-red-600 dark:text-red-400',
    accentBorder: 'border-l-destructive',
    label: 'End',
    width: 200,
    height: 80,
  },
}

export const LAYOUT_DEFAULTS = {
  direction: 'TB' as const,
  nodeWidth: 260,
  nodeHeight: 120,
  rankSep: 100,
  nodeSep: 60,
}
