import { EventCategory, Platform } from '@/lib/api-client'

export type PerformanceTier = 'fast' | 'medium' | 'slow'
export type QueryTab = 'basic' | 'multiAttribute' | 'advanced'
export type QueryCategory = 'user' | 'event' | 'infrastructure' | 'resource'

export interface QueryFieldConfig {
  name: string
  label: string
  type: 'text' | 'enum' | 'datetime'
  enumType?: 'Platform' | 'EventCategory'
  placeholder?: string
  required?: boolean
}

export interface QueryConfig {
  id: string
  label: string
  description?: string
  category?: QueryCategory
  tab: QueryTab
  performanceTier: PerformanceTier
  performanceWarning?: string
  fields: QueryFieldConfig[]
}

// Event category groups for better UX in dropdown
export const EVENT_CATEGORY_GROUPS = {
  'Document Operations': [
    EventCategory.DOCUMENT_VIEW,
    EventCategory.DOCUMENT_EDIT,
    EventCategory.DOCUMENT_CREATE,
    EventCategory.DOCUMENT_DELETE,
    EventCategory.DOCUMENT_COPY,
    EventCategory.DOCUMENT_MOVE,
    EventCategory.DOCUMENT_RENAME,
    EventCategory.DOCUMENT_UPLOAD,
    EventCategory.DOCUMENT_DOWNLOAD,
    EventCategory.DOCUMENT_SYNC,
  ],
  'Permission Changes': [
    EventCategory.PERMISSION_CHANGE,
    EventCategory.OWNERSHIP_CHANGE,
    EventCategory.MEMBERSHIP_CHANGE,
  ],
  Communication: [
    EventCategory.MESSAGE_SEND,
    EventCategory.MESSAGE_RECEIVE,
    EventCategory.MESSAGE_VIEW,
    EventCategory.MESSAGE_DRAFT,
    EventCategory.MESSAGE_LINK_CLICK,
    EventCategory.COMMENT_ADD,
  ],
  Tasks: [
    EventCategory.TASK_CREATE,
    EventCategory.TASK_COMPLETE,
    EventCategory.TASK_REOPEN,
    EventCategory.TASK_ASSIGN,
    EventCategory.TASK_MODIFY,
    EventCategory.TASK_DELETE,
    EventCategory.TASK_LIST_CREATE,
  ],
  Other: [
    EventCategory.DEVICE_SYNC,
    EventCategory.USER_LOGIN,
    EventCategory.USER_LOGOUT,
    EventCategory.OTHER,
  ],
} as const

// Query configurations for all endpoints
export const QUERY_CONFIGS: QueryConfig[] = [
  // === BASIC TAB (Fast indexed queries) ===

  // User & Organization
  {
    id: 'actor',
    label: 'By Actor',
    description: 'Find log lines by the user who performed the action',
    category: 'user',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'actor',
        label: 'Actor Email',
        type: 'text',
        placeholder: 'user@company.com',
        required: true,
      },
    ],
  },
  {
    id: 'owner',
    label: 'By Owner',
    description: 'Find log lines by the owner of the resource',
    category: 'user',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'owner',
        label: 'Owner Email',
        type: 'text',
        placeholder: 'owner@company.com',
        required: true,
      },
    ],
  },
  {
    id: 'user',
    label: 'By User (All Activity)',
    description: 'Find all activity for a user (as actor, owner, or target)',
    category: 'user',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'user',
        label: 'User Email',
        type: 'text',
        placeholder: 'user@company.com',
        required: true,
      },
    ],
  },
  {
    id: 'sharingDetection',
    label: 'Sharing Detection',
    description: 'Find who accessed files owned by a specific user',
    category: 'user',
    tab: 'basic',
    performanceTier: 'medium',
    fields: [
      {
        name: 'owner',
        label: 'File Owner',
        type: 'text',
        placeholder: 'Find who accessed their files...',
        required: true,
      },
    ],
  },

  // Events
  {
    id: 'eventCategory',
    label: 'By Event Category',
    description:
      'Cross-platform event filtering (recommended for unified queries)',
    category: 'event',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'eventCategory',
        label: 'Event Category',
        type: 'enum',
        enumType: 'EventCategory',
        required: true,
      },
    ],
  },
  {
    id: 'event',
    label: 'By Event',
    description: 'Find log lines by specific event type',
    category: 'event',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'event',
        label: 'Event Type',
        type: 'text',
        placeholder: 'e.g., edit, view, send',
        required: true,
      },
    ],
  },
  {
    id: 'dateRange',
    label: 'By Date Range',
    description: 'Find log lines within a specific time period',
    category: 'event',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      { name: 'start', label: 'Start Date', type: 'datetime', required: true },
      { name: 'end', label: 'End Date', type: 'datetime', required: true },
    ],
  },

  // Infrastructure
  {
    id: 'platform',
    label: 'By Platform',
    description: 'Find log lines from a specific platform',
    category: 'infrastructure',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'platform',
        label: 'Platform',
        type: 'enum',
        enumType: 'Platform',
        required: true,
      },
    ],
  },
  {
    id: 'platformService',
    label: 'By Platform & Service',
    description: 'Find log lines from a specific platform and service',
    category: 'infrastructure',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'platform',
        label: 'Platform',
        type: 'enum',
        enumType: 'Platform',
        required: true,
      },
      {
        name: 'service',
        label: 'Service',
        type: 'text',
        placeholder: 'e.g., Drive, Mail, Tasks',
        required: true,
      },
    ],
  },
  {
    id: 'service',
    label: 'By Service',
    description: 'Find log lines from a specific service',
    category: 'infrastructure',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'service',
        label: 'Service',
        type: 'text',
        placeholder: 'e.g., Drive, Mail, Calendar',
        required: true,
      },
    ],
  },
  {
    id: 'domain',
    label: 'By Domain',
    description: 'Find log lines from a specific domain',
    category: 'infrastructure',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        placeholder: 'e.g., company.com',
        required: true,
      },
    ],
  },
  {
    id: 'ip',
    label: 'By IP Address',
    description: 'Find log lines from a specific IP address',
    category: 'infrastructure',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'ipAddress',
        label: 'IP Address',
        type: 'text',
        placeholder: 'e.g., 192.168.1.1',
        required: true,
      },
    ],
  },

  // Resource (fast)
  {
    id: 'resourceId',
    label: 'By Resource ID',
    description: 'Find log lines for a specific resource by ID',
    category: 'resource',
    tab: 'basic',
    performanceTier: 'fast',
    fields: [
      {
        name: 'resourceId',
        label: 'Resource ID',
        type: 'text',
        placeholder: 'Document or resource ID',
        required: true,
      },
    ],
  },

  // === MULTI-ATTRIBUTE TAB (Recommended for complex queries) ===
  {
    id: 'multiAttribute',
    label: 'Multi-Attribute Search',
    description:
      'Combine multiple filters with server-side filtering and pagination',
    tab: 'multiAttribute',
    performanceTier: 'medium',
    fields: [
      {
        name: 'event',
        label: 'Event',
        type: 'text',
        placeholder: 'e.g., edit, view',
      },
      {
        name: 'eventCategory',
        label: 'Event Category',
        type: 'enum',
        enumType: 'EventCategory',
      },
      {
        name: 'platform',
        label: 'Platform',
        type: 'enum',
        enumType: 'Platform',
      },
      {
        name: 'service',
        label: 'Service',
        type: 'text',
        placeholder: 'e.g., Drive, Mail',
      },
      {
        name: 'actor',
        label: 'Actor',
        type: 'text',
        placeholder: 'user@company.com',
      },
      {
        name: 'owner',
        label: 'Owner',
        type: 'text',
        placeholder: 'owner@company.com',
      },
      {
        name: 'target',
        label: 'Target',
        type: 'text',
        placeholder: 'target user or resource',
      },
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        placeholder: 'company.com',
      },
      {
        name: 'resourceId',
        label: 'Resource ID',
        type: 'text',
        placeholder: 'Document ID',
      },
      {
        name: 'ipAddress',
        label: 'IP Address',
        type: 'text',
        placeholder: '192.168.1.1',
      },
      { name: 'startDate', label: 'Start Date', type: 'datetime' },
      { name: 'endDate', label: 'End Date', type: 'datetime' },
    ],
  },

  // === ADVANCED TAB (Slow queries with warnings) ===
  {
    id: 'resourceTitle',
    label: 'By Resource Title',
    description: 'Search by document or resource title (partial match)',
    category: 'resource',
    tab: 'advanced',
    performanceTier: 'slow',
    performanceWarning:
      'Uses partial text matching (LIKE query). May take 1-5 seconds for large datasets.',
    fields: [
      {
        name: 'resourceTitle',
        label: 'Resource Title',
        type: 'text',
        placeholder: 'e.g., Q4 Report, Budget 2024',
        required: true,
      },
    ],
  },
]

// Helper to get queries by tab
export function getQueriesByTab(tab: QueryTab): QueryConfig[] {
  return QUERY_CONFIGS.filter((config) => config.tab === tab)
}

// Helper to get queries by category within a tab
export function getQueriesByCategory(
  tab: QueryTab,
  category: QueryCategory
): QueryConfig[] {
  return QUERY_CONFIGS.filter(
    (config) => config.tab === tab && config.category === category
  )
}

// Helper to get a query config by ID
export function getQueryConfigById(id: string): QueryConfig | undefined {
  return QUERY_CONFIGS.find((config) => config.id === id)
}

// Category labels for display
export const CATEGORY_LABELS: Record<QueryCategory, string> = {
  user: 'User & Organization',
  event: 'Events',
  infrastructure: 'Infrastructure',
  resource: 'Resource',
}

// Platform labels for display
export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.GOOGLE]: 'Google Workspace',
  [Platform.SLACK]: 'Slack',
  [Platform.MICROSOFT]: 'Microsoft 365',
}
