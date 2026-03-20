import { EventCategory, Platform } from '@/lib/api-client'

/**
 * Shared types for log line querying
 */

export type QueryType =
  | 'actor'
  | 'owner'
  | 'event'
  | 'domain'
  | 'ip'
  | 'dateRange'
  | 'user'
  | 'sharingDetection'

export interface QueryParams {
  actor?: string
  owner?: string
  event?: string
  domain?: string
  ipAddress?: string
  start?: string
  end?: string
  user?: string
}

export interface MultiAttributeFilters {
  event?: string
  eventCategory?: EventCategory
  platform?: Platform
  service?: string
  actor?: string
  owner?: string
  target?: string
  domain?: string
  resourceId?: string
  resourceTitle?: string
  ipAddress?: string
  startDate?: string
  endDate?: string
}
