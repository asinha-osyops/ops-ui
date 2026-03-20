import { useState } from 'react'
import { extractErrorMessage } from '@/lib/utils/error-handling'

interface UseDeleteConfirmationOptions<T> {
  onDelete: (item: T) => Promise<{ success: boolean; message?: string }>
  onSuccess?: () => void
  onError?: (message: string) => void
  getConfirmMessage: (item: T) => string
}

export function useDeleteConfirmation<T>({
  onDelete,
  onSuccess,
  onError,
  getConfirmMessage,
}: UseDeleteConfirmationOptions<T>) {
  const [deleting, setDeleting] = useState(false)

  const confirmAndDelete = async (item: T) => {
    const confirmed = window.confirm(getConfirmMessage(item))

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      const response = await onDelete(item)

      if (response.success) {
        onSuccess?.()
      } else {
        onError?.(response.message || 'Delete operation failed')
      }
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'An unexpected error occurred during deletion'
      )
      onError?.(message)
    } finally {
      setDeleting(false)
    }
  }

  return {
    confirmAndDelete,
    deleting,
  }
}

interface UseBulkDeleteConfirmationOptions {
  onDeleteAll: () => Promise<{ success: boolean; message?: string }>
  onSuccess?: () => void
  onError?: (message: string) => void
  getConfirmMessage: (count: number) => string
}

export function useBulkDeleteConfirmation({
  onDeleteAll,
  onSuccess,
  onError,
  getConfirmMessage,
}: UseBulkDeleteConfirmationOptions) {
  const [deleting, setDeleting] = useState(false)

  const confirmAndDeleteAll = async (count: number) => {
    const confirmed = window.confirm(getConfirmMessage(count))

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      const response = await onDeleteAll()

      if (response.success) {
        onSuccess?.()
      } else {
        onError?.(response.message || 'Bulk delete operation failed')
      }
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'An unexpected error occurred during bulk deletion'
      )
      onError?.(message)
    } finally {
      setDeleting(false)
    }
  }

  return {
    confirmAndDeleteAll,
    deleting,
  }
}
