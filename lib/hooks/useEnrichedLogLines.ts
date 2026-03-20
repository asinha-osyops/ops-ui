import { useMemo } from 'react'
import { LogLineDto } from '@/lib/api-client'

/**
 * Log line enriched with pre-computed employee names
 */
export type EnrichedLogLine = LogLineDto & {
  actorName: string
  ownerName: string
  targetName: string
}

/**
 * Enriches log lines with employee names to avoid repeated function calls during rendering
 * @param logLines - Array of log line DTOs
 * @param getEmployeeName - Function to get employee name by ID
 * @returns Enriched log lines with pre-computed employee names
 */
export function useEnrichedLogLines(
  logLines: LogLineDto[],
  getEmployeeName: (id: string | undefined) => string
): EnrichedLogLine[] {
  return useMemo(() => {
    return logLines.map((line) => ({
      ...line,
      actorName: getEmployeeName(line.actorEmployeeId),
      ownerName: getEmployeeName(line.ownerEmployeeId),
      targetName: getEmployeeName(line.targetEmployeeId),
    }))
  }, [logLines, getEmployeeName])
}
