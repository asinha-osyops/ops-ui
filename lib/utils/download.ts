/**
 * Download utilities for exporting data as JSON or Text files
 */

interface DownloadOptions {
  filename: string
  data: string
  mimeType: string
}

function triggerDownload({ filename, data, mimeType }: DownloadOptions) {
  const dataBlob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download data as a JSON file
 */
export function downloadAsJSON(
  data: object,
  baseFilename: string,
  fallbackId?: string
) {
  const dataStr = JSON.stringify(data, null, 2)
  const filename = baseFilename
    ? `${baseFilename.replace(/\s+/g, '-')}.json`
    : `${fallbackId || 'download'}.json`

  triggerDownload({
    filename,
    data: dataStr,
    mimeType: 'application/json',
  })
}

/**
 * Download text content as a .txt file
 */
export function downloadAsText(
  content: string,
  baseFilename: string,
  fallbackId?: string
) {
  const filename = baseFilename
    ? `${baseFilename.replace(/\s+/g, '-')}.txt`
    : `${fallbackId || 'download'}.txt`

  triggerDownload({
    filename,
    data: content,
    mimeType: 'text/plain',
  })
}

/**
 * Helper to generate sanitized filenames
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, '-')
}

/**
 * Download log lines as JSON
 */
export function downloadLogLinesAsJSON(logLines: any[]) {
  if (logLines.length === 0) return

  const dataStr = JSON.stringify(logLines, null, 2)
  const filename = `log-lines-${new Date().toISOString()}.json`

  triggerDownload({
    filename,
    data: dataStr,
    mimeType: 'application/json',
  })
}

/**
 * Download log lines as CSV
 */
export function downloadLogLinesAsCSV(logLines: any[]) {
  if (logLines.length === 0) return

  // CSV headers - common fields
  const headers = [
    'ID',
    'Log ID',
    'Type',
    'Date',
    'Event Type',
    'Actor',
    'Owner',
    'Target',
    'Domain',
    'IP Address',
  ]

  // Convert to CSV rows
  const rows = logLines.map((line) => [
    line.id,
    line.logId,
    line.logLineType,
    new Date(line.date).toISOString(),
    line.eventType || '',
    line.actor || '',
    line.owner || '',
    line.target || '',
    line.domain || '',
    line.ipAddress || '',
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const filename = `log-lines-${new Date().toISOString()}.csv`

  triggerDownload({
    filename,
    data: csvContent,
    mimeType: 'text/csv',
  })
}
