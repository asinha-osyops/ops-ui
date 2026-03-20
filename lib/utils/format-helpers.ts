import { StepAnalysisDto } from '@/lib/api-client'

/**
 * Returns 's' if count !== 1, otherwise empty string.
 * Used for pluralizing words like "1 item" vs "2 items".
 *
 * @param count - The number to check
 * @returns 's' if count !== 1, '' otherwise
 *
 * @example
 * `${count} item${pluralize(count)}` // "1 item" or "3 items"
 */
export function pluralize(count: number): string {
  return count !== 1 ? 's' : ''
}

/**
 * Replaces underscores with spaces.
 * Used for displaying enum values in a human-readable format.
 *
 * @param value - The enum string to format
 * @returns String with underscores replaced by spaces
 *
 * @example
 * formatEnumSimple('GOOGLE_DRIVE') // "GOOGLE DRIVE"
 */
export function formatEnumSimple(value: string): string {
  return value.replace(/_/g, ' ')
}

/**
 * Formats an enum value to title case.
 * Replaces underscores with spaces and capitalizes first letter of each word.
 *
 * @param value - The enum string to format
 * @returns Title case formatted string
 *
 * @example
 * formatEnumTitleCase('HUMAN_RESOURCES') // "Human Resources"
 */
export function formatEnumTitleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Truncates a UUID or long ID for display purposes.
 *
 * @param id - The ID to truncate
 * @param length - Number of characters to show (default: 8)
 * @returns Truncated ID with ellipsis, or original if shorter than length
 *
 * @example
 * truncateId('123e4567-e89b-12d3-a456-426614174000') // "123e4567..."
 */
export function truncateId(id: string, length: number = 8): string {
  if (id.length <= length) return id
  return `${id.slice(0, length)}...`
}

/**
 * Calculates total log lines across all activity events in a step analysis.
 * Sums up all log lines from all logs in each activity event's log line analysis.
 *
 * @param stepAnalysis - The step analysis containing matching activity events
 * @returns Total count of log lines
 */
export function calculateTotalLogLines(stepAnalysis: StepAnalysisDto): number {
  return stepAnalysis.matchingActivityEvents.reduce((sum, aeAnalysis) => {
    const logLineAnalysis = aeAnalysis.logLineAnalysis

    if (
      logLineAnalysis?.matchingLogs &&
      Array.isArray(logLineAnalysis.matchingLogs)
    ) {
      return (
        sum +
        logLineAnalysis.matchingLogs.reduce(
          (lineSum, log) =>
            lineSum + (log.matchCount || log.matchingLogLines?.length || 0),
          0
        )
      )
    }

    return sum
  }, 0)
}

/**
 * Formats a date string to locale date string.
 * Provides consistent date formatting across the app.
 *
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customizing output
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(undefined, options)
}

/**
 * Formats a date string to locale date and time string.
 * Provides consistent datetime formatting across the app.
 *
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customizing output
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(undefined, options)
}
