/**
 * Shared configuration constants for ReactFlow graph components.
 * Extracted to module level to prevent inline object recreation on each render.
 */

export const REACTFLOW_FIT_VIEW_OPTIONS = {
  padding: 0.3,
  includeHiddenNodes: false,
} as const

export const REACTFLOW_DEFAULT_VIEWPORT = {
  x: 50,
  y: 50,
  zoom: 0.8,
} as const

export const REACTFLOW_PRO_OPTIONS = {
  hideAttribution: true,
} as const

export const REACTFLOW_BACKGROUND_STYLE = {
  opacity: 0.5,
} as const
