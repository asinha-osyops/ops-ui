import { Play, Square, CircleDot, LucideIcon } from 'lucide-react'

/**
 * Shared configuration for step node styling based on node type.
 * Used by both SopStepNode and Analysis StepNode for consistent visual design.
 *
 * All node types share the same orange background/border for visual consistency.
 * Icons retain distinctive colors: green for START, red for END, orange for STEP.
 */
export const NODE_TYPE_CONFIG = {
  START: {
    Icon: Play as LucideIcon,
    color: 'text-green-600 dark:text-green-400', // Green icon
    bgColor: 'bg-orange-100 dark:bg-orange-900/30', // Orange background (unified)
    borderColor: 'border-orange-500', // Orange border (unified)
    handleColor: '!bg-orange-500', // Orange handle (unified)
    label: 'Start',
  },
  END: {
    Icon: Square as LucideIcon, // Square "stop" icon
    color: 'text-red-600 dark:text-red-400', // Red icon
    bgColor: 'bg-orange-100 dark:bg-orange-900/30', // Orange background (unified)
    borderColor: 'border-orange-500', // Orange border (unified)
    handleColor: '!bg-orange-500', // Orange handle (unified)
    label: 'End',
  },
  STEP: {
    Icon: CircleDot as LucideIcon,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
    handleColor: '!bg-orange-500',
    label: 'Step',
  },
} as const

export type StepNodeType = keyof typeof NODE_TYPE_CONFIG

/**
 * Get node config with fallback to STEP type
 */
export function getNodeConfig(nodeType: StepNodeType | undefined | null) {
  return NODE_TYPE_CONFIG[nodeType || 'STEP'] || NODE_TYPE_CONFIG.STEP
}
