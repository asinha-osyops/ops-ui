import { useRef, useState } from 'react'
import { extractErrorMessage } from '@/lib/utils/error-handling'

interface UseFileUploadOptions<T = void> {
  accept?: string
  onUpload: (file: File) => Promise<T>
  onSuccess?: (result: T) => void
  onError?: (message: string) => void
}

export function useFileUpload<T = void>({
  accept = '*',
  onUpload,
  onSuccess,
  onError,
}: UseFileUploadOptions<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const result = await onUpload(file)
      onSuccess?.(result)
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'An unexpected error occurred during upload'
      )
      onError?.(message)
    } finally {
      setUploading(false)

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const fileInputProps = {
    ref: fileInputRef,
    type: 'file' as const,
    onChange: handleFileChange,
    accept,
    style: { display: 'none' },
  }

  return {
    uploading,
    triggerFileInput,
    fileInputProps,
  }
}
