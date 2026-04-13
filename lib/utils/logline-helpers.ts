/**
 * Helper functions for working with log lines
 * Provides access to log line fields
 */

import { LogLineDto } from '@/lib/api-client'

/**
 * Extract event name from a log line.
 *
 * @param logLine - The log line to extract event from
 * @returns Event name string, or 'Unknown Event' if not found
 *
 * @example
 * const event = getEventFromLogLine(logLine); // "EDIT", "VIEW", "SEND", etc.
 */
export function getEventFromLogLine(logLine: LogLineDto): string {
  return logLine.event || 'Unknown Event'
}

/**
 * Get event category from a log line
 */
export function getEventCategoryFromLogLine(logLine: LogLineDto): string {
  return logLine.eventCategory || 'OTHER'
}

/**
 * Get resource title from a log line
 */
export function getResourceTitleFromLogLine(logLine: LogLineDto): string {
  return logLine.resourceTitle || logLine.resourceId || 'Unknown Resource'
}
