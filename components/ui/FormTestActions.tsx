'use client'

import { Button } from '@/components/ui/button'

interface FormTestActionsProps {
  onFill?: () => void
  onClear: () => void
  onSubmit: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function FormTestActions({
  onFill,
  onClear,
  onSubmit,
  submitLabel = 'Create',
  isSubmitting = false,
}: FormTestActionsProps) {
  return (
    <>
      {onFill && (
        <Button variant="ghost" onClick={onFill} type="button">
          Fill
        </Button>
      )}
      <Button variant="outline" onClick={onClear} type="button">
        Clear
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating...' : submitLabel}
      </Button>
    </>
  )
}
