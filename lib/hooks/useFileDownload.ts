import { useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/lib/utils/error-handling'

/**
 * Hook for downloading binary files (blobs) from the API
 *
 * Handles the complete file download lifecycle:
 * - Creates blob URL from downloaded file
 * - Triggers browser download
 * - Cleans up resources (revokes URL, removes anchor element)
 * - Shows success/error toast notifications
 * - Provides loading state for UI feedback
 *
 * @param downloadFn - Function that fetches the file blob from API
 * @returns Object with downloadFile function and downloading state
 *
 * @example
 * const { downloadFile, downloading } = useFileDownload(
 *   (fileId) => apiClient.downloadSopFile(fileId)
 * );
 *
 * // Later in a button click handler:
 * <Button
 *   onClick={() => downloadFile(fileId, 'document.pdf')}
 *   disabled={downloading}
 * >
 *   {downloading ? 'Downloading...' : 'Download File'}
 * </Button>
 */
export function useFileDownload(downloadFn: (fileId: string) => Promise<Blob>) {
  const [downloading, setDownloading] = useState(false)

  const downloadFile = async (fileId: string, fileName: string) => {
    setDownloading(true)
    try {
      const blob = await downloadFn(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showSuccessToast('File downloaded successfully')
    } catch (error) {
      showErrorToast('Failed to download file', error)
    } finally {
      setDownloading(false)
    }
  }

  return { downloadFile, downloading }
}
