import { useMemo } from 'react'
import { useAppContext } from '@/lib/app-context'
import { EntityType, ChartColor } from '@/lib/types/colorscheme'
import {
  RoleTitle,
  LoggingSource,
  Platform,
  EventCategory,
} from '@/lib/api-client'

export function useColorScheme() {
  const { colorScheme } = useAppContext()

  return {
    // Entity colors
    getEntityColor: (entity: EntityType) => colorScheme.entities[entity],

    // Enum colors
    getRoleTitleColor: (role: RoleTitle): ChartColor =>
      colorScheme.roleTitle[role],

    getPlatformColor: (platform: Platform): ChartColor =>
      colorScheme.platform[platform],

    getEventCategoryColor: (category: EventCategory): ChartColor =>
      colorScheme.eventCategory[category],

    getServiceColor: (service: string): ChartColor =>
      colorScheme.service[service.toLowerCase()] || 'blue-3',

    getLoggingSourceColor: (source: LoggingSource): ChartColor =>
      colorScheme.loggingSource[source],

    // Utility functions
    getChartColorClass: (
      color: ChartColor,
      type: 'text' | 'bg' | 'border' = 'text'
    ) => `${type}-chart-${color}`,

    getBadgeClasses: (color: ChartColor) =>
      `bg-chart-${color}/10 text-chart-${color} border border-chart-${color}/20`,

    // Get all color classes for an entity (eliminates duplicate color class logic)
    getEntityColorClasses: (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return {
        borderL: `border-l-chart-${color.primary}`,
        text: `text-chart-${color.primary}`,
        textOpacity: `text-chart-${color.primary}/50`,
        textHover: `hover:text-chart-${color.primary}/90`,
        bgHover: `hover:bg-chart-${color.primary}/5`,
      }
    },

    // Get button classes for entity-specific primary action buttons
    getEntityButtonClasses: (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return `bg-chart-${color.primary} hover:bg-chart-${color.primary}/90 text-white`
    },

    // Get outline button classes for entity-specific secondary action buttons
    getEntityOutlineButtonClasses: (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return `border border-chart-${color.primary} text-chart-${color.primary} hover:bg-chart-${color.primary}/10`
    },
  }
}

/**
 * Convenience hook that returns all color-related classes for a specific entity type.
 * Reduces boilerplate when you need multiple color classes for the same entity.
 *
 * @example
 * ```tsx
 * // Before (4 lines):
 * const { getEntityColor, getEntityColorClasses, getEntityButtonClasses } = useColorScheme();
 * const sopColor = getEntityColor('SOP');
 * const sopClasses = getEntityColorClasses('SOP');
 * const sopButtonClasses = getEntityButtonClasses('SOP');
 *
 * // After (1 line):
 * const { color, classes, buttonClasses } = useEntityColorScheme('SOP');
 * ```
 */
export function useEntityColorScheme(entityType: EntityType) {
  const { colorScheme } = useAppContext()

  // Memoize based on the stable colorScheme from context and the entityType
  return useMemo(() => {
    const getEntityColor = (entity: EntityType) => colorScheme.entities[entity]
    const getEntityColorClasses = (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return {
        borderL: `border-l-chart-${color.primary}`,
        text: `text-chart-${color.primary}`,
        textOpacity: `text-chart-${color.primary}/50`,
        textHover: `hover:text-chart-${color.primary}/90`,
        bgHover: `hover:bg-chart-${color.primary}/5`,
      }
    }
    const getEntityButtonClasses = (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return `bg-chart-${color.primary} hover:bg-chart-${color.primary}/90 text-white`
    }
    const getEntityOutlineButtonClasses = (entity: EntityType) => {
      const color = colorScheme.entities[entity]
      return `border border-chart-${color.primary} text-chart-${color.primary} hover:bg-chart-${color.primary}/10`
    }
    const getRoleTitleColor = (role: RoleTitle): ChartColor =>
      colorScheme.roleTitle[role]

    return {
      // Pre-computed values for this entity
      color: getEntityColor(entityType),
      classes: getEntityColorClasses(entityType),
      buttonClasses: getEntityButtonClasses(entityType),
      outlineButtonClasses: getEntityOutlineButtonClasses(entityType),
      // Include commonly used functions
      getRoleTitleColor,
      getEntityColor,
      getEntityColorClasses,
      getEntityButtonClasses,
      getEntityOutlineButtonClasses,
    }
  }, [colorScheme, entityType])
}
