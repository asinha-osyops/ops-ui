'use client'

import { useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

interface ValidationResult {
  isValid: boolean
  error?: string
}

interface UseValidatedFileUploadOptions {
  /** The react-hook-form instance */
  form: UseFormReturn<any>
  /** Function to trigger file input */
  triggerFileInput: () => void
  /** Optional additional validation before upload */
  additionalValidation?: () => ValidationResult
}

/**
 * Hook that handles form validation before triggering file upload.
 * Eliminates duplicate validation logic across create forms.
 *
 * @example
 * ```tsx
 * const { uploading, triggerFileInput, fileInputProps } = useFileUpload({...});
 *
 * const handleUploadClick = useValidatedFileUpload({
 *   form,
 *   triggerFileInput,
 *   additionalValidation: () => ({
 *     isValid: !metadataError,
 *     error: 'Please fix the JSON error before uploading',
 *   }),
 * });
 *
 * <Button onClick={handleUploadClick}>Upload</Button>
 * ```
 */
export function useValidatedFileUpload({
  form,
  triggerFileInput,
  additionalValidation,
}: UseValidatedFileUploadOptions): () => Promise<void> {
  const handleValidatedUpload = useCallback(async () => {
    // Validate form before allowing file upload
    const isValid = await form.trigger()

    if (!isValid) {
      toast.error('Form validation failed', {
        description: 'Please fix the errors before uploading',
      })
      return
    }

    // Run additional validation if provided
    if (additionalValidation) {
      const result = additionalValidation()
      if (!result.isValid) {
        toast.error('Validation failed', {
          description: result.error || 'Please fix the errors before uploading',
        })
        return
      }
    }

    // All validations passed, trigger file input
    triggerFileInput()
  }, [form, triggerFileInput, additionalValidation])

  return handleValidatedUpload
}
