import { toast } from 'sonner'

/**
 * Extracts error message from unknown error type
 * Handles Error objects, string errors, and unknown types
 *
 * @param error - The error to extract message from
 * @param fallback - Optional fallback message if extraction fails
 * @returns Extracted error message
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Unknown error'
): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return fallback
}

/**
 * Shows standardized error toast notification
 * Automatically extracts error message from error object
 *
 * @param title - The error title to display
 * @param error - The error object to extract message from
 */
export function showErrorToast(title: string, error: unknown): void {
  const message = extractErrorMessage(error)
  toast.error(title, {
    description: message,
  })
}

/**
 * Shows standardized success toast notification
 *
 * @param title - The success message to display
 * @param description - Optional additional description
 */
export function showSuccessToast(title: string, description?: string): void {
  if (description) {
    toast.success(title, { description })
  } else {
    toast.success(title)
  }
}

/**
 * Shows standardized warning toast notification
 *
 * @param title - The warning message to display
 * @param description - Optional additional description
 */
export function showWarningToast(title: string, description?: string): void {
  if (description) {
    toast.warning(title, { description })
  } else {
    toast.warning(title)
  }
}

/**
 * Wraps async operations with automatic error handling
 * Shows success/error toasts and handles exceptions
 * Returns null if operation fails, otherwise returns the result
 *
 * @param operation - The async operation to execute
 * @param messages - Success and error message configuration
 * @returns The result of the operation, or null if it fails
 */
export async function executeWithToast<T>(
  operation: () => Promise<T>,
  messages: {
    success: string
    successDescription?: string
    error: string
  }
): Promise<T | null> {
  try {
    const result = await operation()
    showSuccessToast(messages.success, messages.successDescription)
    return result
  } catch (error) {
    showErrorToast(messages.error, error)
    return null
  }
}

/**
 * Handles validation errors with formatted messages
 * For Zod or custom validation errors
 *
 * @param error - The validation error object
 * @returns Formatted validation error message
 */
export function handleValidationError(error: unknown): string {
  if (error && typeof error === 'object') {
    // Handle Zod validation errors
    if ('errors' in error && Array.isArray(error.errors)) {
      return error.errors
        .map((err: any) => `${err.path?.join('.')}: ${err.message}`)
        .join('; ')
    }

    // Handle React Hook Form errors
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
  }

  return extractErrorMessage(error, 'Validation failed')
}

/**
 * Formats validation errors from React Hook Form
 *
 * @param errors - Record of field errors from form.formState.errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: Record<string, any>): string {
  return Object.entries(errors)
    .map(([field, error]) => {
      const message = error?.message || 'Invalid value'
      return `${field}: ${message}`
    })
    .join('; ')
}
