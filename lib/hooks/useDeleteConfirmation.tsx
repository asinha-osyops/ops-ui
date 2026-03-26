import { useState, type ReactNode } from 'react'
import { extractErrorMessage } from '@/lib/utils/error-handling'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface UseDeleteConfirmationOptions<T> {
  onDelete: (item: T) => Promise<{ success: boolean; message?: string }>
  onSuccess?: () => void
  onError?: (message: string) => void
  getConfirmMessage: (item: T) => string
  title?: string
}

export function useDeleteConfirmation<T>({
  onDelete,
  onSuccess,
  onError,
  getConfirmMessage,
  title = 'Confirm Delete',
}: UseDeleteConfirmationOptions<T>) {
  const [deleting, setDeleting] = useState(false)
  const [pendingItem, setPendingItem] = useState<T | null>(null)

  const requestDelete = (item: T) => {
    setPendingItem(item)
  }

  const handleConfirm = async () => {
    if (!pendingItem) return
    setPendingItem(null)
    setDeleting(true)

    try {
      const response = await onDelete(pendingItem)

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

  const confirmDialog: ReactNode = pendingItem ? (
    <ConfirmDialog
      open={!!pendingItem}
      onOpenChange={(open) => {
        if (!open) setPendingItem(null)
      }}
      title={title}
      description={getConfirmMessage(pendingItem)}
      onConfirm={handleConfirm}
      destructive
    />
  ) : null

  return {
    requestDelete,
    /** @deprecated Use requestDelete instead */
    confirmAndDelete: requestDelete,
    deleting,
    confirmDialog,
  }
}

interface UseBulkDeleteConfirmationOptions {
  onDeleteAll: () => Promise<{ success: boolean; message?: string }>
  onSuccess?: () => void
  onError?: (message: string) => void
  getConfirmMessage: (count: number) => string
  title?: string
}

export function useBulkDeleteConfirmation({
  onDeleteAll,
  onSuccess,
  onError,
  getConfirmMessage,
  title = 'Confirm Bulk Delete',
}: UseBulkDeleteConfirmationOptions) {
  const [deleting, setDeleting] = useState(false)
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  const requestDeleteAll = (count: number) => {
    setPendingCount(count)
  }

  const handleConfirm = async () => {
    setPendingCount(null)
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

  const confirmDialog: ReactNode =
    pendingCount !== null ? (
      <ConfirmDialog
        open={pendingCount !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCount(null)
        }}
        title={title}
        description={getConfirmMessage(pendingCount)}
        onConfirm={handleConfirm}
        destructive
      />
    ) : null

  return {
    requestDeleteAll,
    /** @deprecated Use requestDeleteAll instead */
    confirmAndDeleteAll: requestDeleteAll,
    deleting,
    confirmDialog,
  }
}
