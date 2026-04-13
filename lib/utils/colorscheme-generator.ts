import { ChartColor, ColorScheme, EntityColor } from '@/lib/types/colorscheme'
import {
  RoleTitle,
  LoggingSource,
  Platform,
  EventCategory,
} from '@/lib/api-client'

// All available chart colors (35 total)
const CHART_COLORS: ChartColor[] = [
  'blue-1',
  'blue-2',
  'blue-3',
  'blue-4',
  'blue-5',
  'green-1',
  'green-2',
  'green-3',
  'green-4',
  'green-5',
  'orange-1',
  'orange-2',
  'orange-3',
  'orange-4',
  'orange-5',
  'red-1',
  'red-2',
  'red-3',
  'red-4',
  'red-5',
  'rose-1',
  'rose-2',
  'rose-3',
  'rose-4',
  'rose-5',
  'violet-1',
  'violet-2',
  'violet-3',
  'violet-4',
  'violet-5',
  'yellow-1',
  'yellow-2',
  'yellow-3',
  'yellow-4',
  'yellow-5',
]

// Shuffle algorithm for random assignment
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Assign colors to enum values
function assignEnumColors<T extends string>(
  enumValues: T[]
): Record<T, ChartColor> {
  const shuffled = shuffleArray(CHART_COLORS)
  const result: any = {}

  enumValues.forEach((value, index) => {
    // Use modulo to cycle through colors if more values than colors
    result[value] = shuffled[index % shuffled.length]
  })

  return result
}

// Assign colors for platforms
function assignPlatformColors(): Record<Platform, ChartColor> {
  return {
    [Platform.GOOGLE]: 'green-5',
    [Platform.SLACK]: 'violet-5',
    [Platform.MICROSOFT]: 'blue-5',
  }
}

// Assign colors for common services
function assignServiceColors(): Record<string, ChartColor> {
  return {
    drive: 'green-4',
    mail: 'blue-4',
    tasks: 'red-4',
    devices: 'orange-4',
    calendar: 'violet-4',
    chat: 'rose-4',
    teams: 'blue-3',
    outlook: 'blue-2',
    onedrive: 'green-3',
  }
}

// Create entity color configuration
function createEntityColor(
  primary: ChartColor,
  light: ChartColor
): EntityColor {
  return {
    primary,
    light,
    badge: `bg-chart-${primary}/10 text-chart-${primary} border border-chart-${primary}/20`,
    borderLeft: `border-l-4 border-l-chart-${primary}`,
    borderTop: `border-t-4 border-t-chart-${primary}`,
  }
}

// Generate complete colorscheme
// All entities use the same primary color (orange) for consistent highlighting
export function generateColorScheme(): ColorScheme {
  return {
    entities: {
      SOP: createEntityColor('orange-4', 'orange-2'),
      Step: createEntityColor('orange-4', 'orange-2'),
      Log: createEntityColor('orange-4', 'orange-2'),
      LogLine: createEntityColor('orange-4', 'orange-2'),
      ActivityEvent: createEntityColor('orange-4', 'orange-2'),
      Company: createEntityColor('orange-4', 'orange-2'),
      Employee: createEntityColor('orange-4', 'orange-2'),
      Role: createEntityColor('orange-4', 'orange-2'),
    },
    roleTitle: assignEnumColors(Object.values(RoleTitle)),
    loggingSource: assignEnumColors(Object.values(LoggingSource)),
    platform: assignPlatformColors(),
    eventCategory: assignEnumColors(Object.values(EventCategory)),
    service: assignServiceColors(),
  }
}
