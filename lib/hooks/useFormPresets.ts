'use client'

import { useCallback } from 'react'
import { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form'

interface Preset<T> {
  label: string
  data: Partial<T>
}

/**
 * Hook that provides preset filling functionality for forms.
 * Eliminates duplicate preset filling logic across create forms.
 *
 * @example
 * ```tsx
 * const SOP_PRESETS = [
 *   { label: 'Basic', data: { sopName: 'My SOP', basicDescription: 'Description' } },
 * ];
 *
 * const { fillPreset } = useFormPresets(form, SOP_PRESETS);
 *
 * <Button onClick={() => fillPreset(0)}>Fill: Basic</Button>
 * ```
 */
export function useFormPresets<T extends FieldValues>(
  form: UseFormReturn<T>,
  presets: Preset<T>[]
) {
  const fillPreset = useCallback(
    (index: number) => {
      const preset = presets[index]
      if (!preset) return

      Object.entries(preset.data).forEach(([key, value]) => {
        form.setValue(key as Path<T>, value as PathValue<T, Path<T>>)
      })
    },
    [form, presets]
  )

  return { fillPreset, presets }
}
