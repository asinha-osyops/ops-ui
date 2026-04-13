/**
 * Utility functions for parsing and formatting durations and timestamps
 * Supports both ISO-8601 strings and Java Duration objects from the API
 */

/**
 * Duration threshold for edge label coloring (in milliseconds)
 * Durations >= this threshold show RED (warning), below show GREEN (ok)
 * Default: 1 week = 7 * 24 * 60 * 60 * 1000 = 604800000ms
 */
export const EDGE_DURATION_WARNING_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

/**
 * Java Duration object format from API
 */
export interface DurationObject {
  seconds: number
  nano?: number
  zero?: boolean
  negative?: boolean
  positive?: boolean
}

/**
 * Duration input type - can be ISO-8601 string, Duration object, or raw seconds number
 */
export type DurationInput = string | number | DurationObject | null | undefined

/**
 * Type guard to check if input is a Duration object
 */
function isDurationObject(input: DurationInput): input is DurationObject {
  return typeof input === 'object' && input !== null && 'seconds' in input
}

/**
 * Parse duration to milliseconds
 * Handles:
 * - Duration objects ({ seconds: 900 })
 * - Raw numbers (seconds as number, e.g., 82366 or -82366)
 * - ISO-8601 strings (e.g., "PT15M30S") - legacy
 *
 * @param duration - ISO-8601 string, Duration object, or raw seconds number
 * @returns Duration in milliseconds, or null if invalid/empty
 */
export function parseDuration(duration: DurationInput): number | null {
  if (duration === null || duration === undefined) return null

  // Handle Duration object format from API
  if (isDurationObject(duration)) {
    const seconds = duration.seconds || 0
    const nanos = duration.nano || 0
    const ms = seconds * 1000 + nanos / 1_000_000
    return duration.negative ? -ms : ms
  }

  // Handle raw number format (seconds) - API sometimes returns this
  if (typeof duration === 'number') {
    return duration * 1000 // Convert seconds to milliseconds
  }

  // Must be a string at this point - guard against unexpected types
  if (typeof duration !== 'string') {
    console.warn('parseDuration: unexpected duration format', duration)
    return null
  }

  // Handle ISO-8601 string format (legacy)
  const iso8601 = duration

  // Handle negative durations (prefix with -)
  const isNegative = iso8601.startsWith('-') || iso8601.startsWith('PT-')
  const normalized = iso8601.replace(/^-/, '').replace('PT-', 'PT')

  const match = normalized.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
  )
  if (!match) return null

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseFloat(match[3] || '0')

  const ms = (hours * 3600 + minutes * 60 + seconds) * 1000
  return isNegative ? -ms : ms
}

/**
 * Format duration for display
 * Produces human-readable strings like "15m 30s", "2h 5m", "45s"
 *
 * @param duration - ISO-8601 string or Duration object
 * @returns Formatted duration string, or "N/A" if invalid
 */
export function formatDuration(duration: DurationInput): string {
  const ms = parseDuration(duration)
  if (ms === null) return 'N/A'

  const isNegative = ms < 0
  const totalSeconds = Math.abs(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const sign = isNegative ? '-' : ''

  if (hours > 0) {
    return `${sign}${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${sign}${minutes}m ${seconds}s`
  }
  return `${sign}${seconds}s`
}

/**
 * Format ISO-8601 timestamp for display
 * Produces localized date/time string
 *
 * @param iso8601 - ISO-8601 timestamp string
 * @returns Formatted timestamp string, or "N/A" if invalid
 */
export function formatTimestamp(iso8601: string | null | undefined): string {
  if (!iso8601) return 'N/A'

  try {
    const date = new Date(iso8601)
    if (isNaN(date.getTime())) return 'N/A'

    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}

/**
 * Check if duration is negative (indicates concurrent/overlapping execution)
 *
 * @param duration - ISO-8601 string, Duration object, or raw seconds number
 * @returns true if duration is negative, false otherwise
 */
export function isNegativeDuration(duration: DurationInput): boolean {
  // Quick check for Duration object
  if (isDurationObject(duration)) {
    return duration.negative === true
  }
  // Quick check for raw number
  if (typeof duration === 'number') {
    return duration < 0
  }
  const ms = parseDuration(duration)
  return ms !== null && ms < 0
}

/**
 * Format duration for edge labels (compact format)
 * Returns shorter strings suitable for edge labels
 *
 * @param duration - ISO-8601 string or Duration object
 * @returns Compact formatted duration, or empty string if invalid
 */
export function formatEdgeDuration(duration: DurationInput): string {
  const ms = parseDuration(duration)
  if (ms === null) return ''

  const isNegative = ms < 0
  const sign = isNegative ? '-' : '+'
  const totalSeconds = Math.abs(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    return `${sign}${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    if (seconds > 0) {
      return `${sign}${minutes}m ${seconds}s`
    }
    return `${sign}${minutes}m`
  }
  return `${sign}${seconds}s`
}

/**
 * Check if duration exceeds the warning threshold
 * Used for conditional coloring of edge duration labels
 *
 * @param duration - ISO-8601 string or Duration object
 * @returns true if duration >= EDGE_DURATION_WARNING_THRESHOLD_MS, false otherwise
 */
export function isDurationOverThreshold(duration: DurationInput): boolean {
  const ms = parseDuration(duration)
  if (ms === null) return false
  // Use absolute value to handle negative durations correctly
  return Math.abs(ms) >= EDGE_DURATION_WARNING_THRESHOLD_MS
}
