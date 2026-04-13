import { LogLineDto, Platform } from '@/lib/api-client'

/**
 * Type guard functions for LogLine platform/service combinations
 * These help identify log lines from specific services
 */

/**
 * Check if log line is from Google Drive
 */
export function isGoogleDriveLogLine(line: LogLineDto): boolean {
  return (
    line.platform === Platform.GOOGLE && line.service?.toLowerCase() === 'drive'
  )
}

/**
 * Check if log line is from Google Mail
 */
export function isGoogleMailLogLine(line: LogLineDto): boolean {
  return (
    line.platform === Platform.GOOGLE && line.service?.toLowerCase() === 'mail'
  )
}

/**
 * Check if log line is from Google Tasks
 */
export function isGoogleTasksLogLine(line: LogLineDto): boolean {
  return (
    line.platform === Platform.GOOGLE && line.service?.toLowerCase() === 'tasks'
  )
}

/**
 * Check if log line is from Google Devices
 */
export function isGoogleDeviceLogLine(line: LogLineDto): boolean {
  return (
    line.platform === Platform.GOOGLE &&
    line.service?.toLowerCase() === 'devices'
  )
}

/**
 * Get a display-friendly service name from a log line
 */
export function getServiceDisplayName(line: LogLineDto): string {
  if (line.service) {
    return (
      line.service.charAt(0).toUpperCase() + line.service.slice(1).toLowerCase()
    )
  }
  return 'Unknown'
}

/**
 * Get the platform display name from a log line
 */
export function getPlatformDisplayName(line: LogLineDto): string {
  if (line.platform) {
    return line.platform.charAt(0) + line.platform.slice(1).toLowerCase()
  }
  return 'Unknown'
}

/**
 * Get a combined platform/service display name
 */
export function getFullServiceName(line: LogLineDto): string {
  const platform = getPlatformDisplayName(line)
  const service = getServiceDisplayName(line)
  return `${platform} ${service}`
}
