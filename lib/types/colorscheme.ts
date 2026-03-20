// Entity types
export type EntityType =
  | 'SOP'
  | 'Step'
  | 'Log'
  | 'LogLine'
  | 'ActivityEvent'
  | 'Company'
  | 'Employee'
  | 'Role'

// Color variants for each chart color
export type ColorVariant = '1' | '2' | '3' | '4' | '5'
export type ColorFamily =
  | 'blue'
  | 'green'
  | 'primary'
  | 'orange'
  | 'red'
  | 'rose'
  | 'violet'
  | 'yellow'

export type ChartColor = `${ColorFamily}-${ColorVariant}`

// Entity color configuration
export interface EntityColor {
  primary: ChartColor // Main color
  light: ChartColor // Light variant
  badge: string // Tailwind classes for badges
  borderLeft: string // Tailwind classes for card/accordion left border
  borderTop: string // Tailwind classes for card top border
}

// Enum color mappings
export interface ColorScheme {
  entities: Record<EntityType, EntityColor>
  roleTitle: Record<string, ChartColor>
  loggingSource: Record<string, ChartColor>
  platform: Record<string, ChartColor>
  eventCategory: Record<string, ChartColor>
  service: Record<string, ChartColor>
}
