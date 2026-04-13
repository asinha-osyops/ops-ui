/**
 * Centralized constants for analysis-related operations
 * Provides single source of truth for error messages, display formatting, and configuration
 */

/**
 * Analysis-related constants
 */
export const ANALYSIS_CONSTANTS = {
  // Log display formatting
  LOG_ID_TRUNCATE_LENGTH: 8,
  LOG_NAME_PREFIX: 'Log',

  // Default values
  DEFAULT_LOGGING_SOURCE: 'GOOGLE_WORKSPACE' as const,

  // Error messages
  ERRORS: {
    LOAD_SOPS: 'Failed to load SOPs',
    FETCH_RESULTS: 'Failed to fetch trace results',
    START_TRACE: 'Failed to start trace',
    SOP_NOT_FOUND: 'SOP not found',
    TRACE_NOT_COMPLETE: 'Trace processing not yet complete',
    NO_TRACE_DATA: 'No trace data returned from aggregate',
    TASKS_FAILED: (count: number) => `${count} trace task(s) failed`,
  },

  // Success messages
  SUCCESS: {
    TRACE_COMPLETE: 'Trace complete!',
  },

  // Warning messages
  WARNINGS: {
    TRACE_WITH_FAILURES: (stepFailures: number, logMatchingFailures: number) =>
      `Trace complete with ${stepFailures} step failure(s) and ${logMatchingFailures} log matching failure(s)`,
  },

  // Info messages
  INFO: {
    NO_STEPS: 'No steps to analyze',
    NO_STEPS_DESCRIPTION: 'No step analysis to perform.',
    ANALYZING_STEPS: (count: number) => `Analyzing ${count} step(s)...`,
  },

  // Default fallback values
  FALLBACKS: {
    UNKNOWN_ERROR: 'Unknown error',
    UNKNOWN_EVENT: 'Unknown Event',
    NO_TIMESTAMP: 'No timestamp',
    NO_DETAILS: 'No details provided',
    NO_ACTIVITY_EVENTS: 'No matching activity events',
    NO_LOG_LINES: 'No matching log lines',
  },
} as const

/**
 * Format log ID for display with truncation
 *
 * @param logId - The full log ID to format
 * @returns Formatted log name with truncated ID (e.g., "Log 123e4567...")
 */
export function formatLogIdForDisplay(logId: string): string {
  return `${ANALYSIS_CONSTANTS.LOG_NAME_PREFIX} ${logId.substring(
    0,
    ANALYSIS_CONSTANTS.LOG_ID_TRUNCATE_LENGTH
  )}...`
}

/**
 * Get error description from an error object
 *
 * @param error - The error to extract message from
 * @returns Error message string
 */
export function getErrorDescription(error: unknown): string {
  return error instanceof Error
    ? error.message
    : ANALYSIS_CONSTANTS.FALLBACKS.UNKNOWN_ERROR
}
