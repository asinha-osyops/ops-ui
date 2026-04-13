import { toast } from 'sonner'
import { pluralize } from './format-helpers'

export const notifications = {
  success: {
    delete: (itemType: string) => `${itemType} deleted successfully!`,
    deleteAll: (itemType: string, count: number) =>
      `All ${count} ${itemType}${pluralize(count)} deleted successfully!`,
    upload: (itemType: string) => `${itemType} uploaded successfully!`,
    create: (itemType: string) => `${itemType} created successfully!`,
    analyze: (itemType: string) => `${itemType} analyzed successfully!`,
  },
  error: {
    delete: (itemType: string, message?: string) =>
      `Failed to delete ${itemType}${message ? `: ${message}` : ''}`,
    upload: (itemType: string, message?: string) =>
      `Failed to upload ${itemType}${message ? `: ${message}` : ''}`,
    analyze: (itemType: string) =>
      `Failed to analyze ${itemType}. Please try again.`,
    fetch: (itemType: string) =>
      `Failed to fetch ${itemType}s. Please refresh the page.`,
  },
  confirm: {
    delete: (itemType: string, itemName: string) =>
      `Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`,
    deleteAll: (itemType: string, count: number) =>
      `Are you sure you want to delete ALL ${itemType}s? This will permanently delete ${count} ${itemType}${pluralize(count)}. This action cannot be undone.`,
  },
} as const

// Helper function for alerts
export function showAlert(message: string) {
  alert(message)
}

// Helper function for confirmations
export function showConfirm(message: string): boolean {
  return window.confirm(message)
}

// ============================================
// Toast Helper Functions
// ============================================

/**
 * Centralized toast message templates for consistent messaging across the app.
 */
export const toastMessages = {
  entity: {
    created: (entityType: string) => ({
      title: `${entityType} created successfully!`,
      description: `Your ${entityType.toLowerCase()} has been created.`,
    }),
    updated: (entityType: string) => ({
      title: `${entityType} updated successfully!`,
      description: `Your ${entityType.toLowerCase()} has been updated.`,
    }),
    deleted: (entityType: string) => ({
      title: `${entityType} deleted`,
      description: `The ${entityType.toLowerCase()} has been successfully deleted.`,
    }),
    loadFailed: (entityType: string, error: unknown) => ({
      title: `Failed to load ${entityType.toLowerCase()}s`,
      description: error instanceof Error ? error.message : 'Unknown error',
    }),
  },
  file: {
    uploadSuccess: (entityType: string) => ({
      title: `${entityType} created successfully!`,
      description: `File uploaded and attached to ${entityType.toLowerCase()}`,
    }),
    uploadFailed: (message?: string) => ({
      title: 'Failed to upload file',
      description: message || 'Unknown error',
    }),
    downloadFailed: (message?: string) => ({
      title: 'Failed to download file',
      description: message || 'Unknown error',
    }),
  },
  analysis: {
    started: (entityType: string, count?: number) =>
      count
        ? `Analyzing ${count} ${entityType.toLowerCase()}(s)...`
        : `Analyzing ${entityType.toLowerCase()}...`,
    complete: (entityType: string) => `${entityType} analysis complete!`,
    failed: (entityType: string, error?: unknown) => ({
      title: `Failed to analyze ${entityType.toLowerCase()}`,
      description: error instanceof Error ? error.message : 'Unknown error',
    }),
  },
  validation: {
    formFailed: {
      title: 'Form validation failed',
      description: 'Please fix the errors before proceeding',
    },
    jsonInvalid: {
      title: 'Invalid JSON',
      description: 'Please fix the JSON error before proceeding',
    },
  },
} as const

/**
 * Show a success toast for entity creation.
 */
export function showEntityCreatedToast(entityType: string) {
  const msg = toastMessages.entity.created(entityType)
  toast.success(msg.title, { description: msg.description })
}

/**
 * Show a success toast for entity update.
 */
export function showEntityUpdatedToast(entityType: string) {
  const msg = toastMessages.entity.updated(entityType)
  toast.success(msg.title, { description: msg.description })
}

/**
 * Show a success toast for entity deletion.
 */
export function showEntityDeletedToast(entityType: string) {
  const msg = toastMessages.entity.deleted(entityType)
  toast.success(msg.title, { description: msg.description })
}

/**
 * Show an error toast for failed entity load.
 */
export function showLoadFailedToast(entityType: string, error: unknown) {
  const msg = toastMessages.entity.loadFailed(entityType, error)
  toast.error(msg.title, { description: msg.description })
}

/**
 * Show a success toast for file upload with entity creation.
 */
export function showFileUploadSuccessToast(entityType: string) {
  const msg = toastMessages.file.uploadSuccess(entityType)
  toast.success(msg.title, { description: msg.description })
}

/**
 * Show an error toast for failed file upload.
 */
export function showFileUploadFailedToast(message?: string) {
  const msg = toastMessages.file.uploadFailed(message)
  toast.error(msg.title, { description: msg.description })
}

/**
 * Show an error toast for failed analysis.
 */
export function showAnalysisFailedToast(entityType: string, error?: unknown) {
  const msg = toastMessages.analysis.failed(entityType, error)
  toast.error(msg.title, { description: msg.description })
}

/**
 * Show a success toast for completed analysis.
 */
export function showAnalysisCompleteToast(entityType: string) {
  toast.success(toastMessages.analysis.complete(entityType))
}

/**
 * Show an info toast for started analysis.
 */
export function showAnalysisStartedToast(entityType: string, count?: number) {
  toast.info(toastMessages.analysis.started(entityType, count))
}
