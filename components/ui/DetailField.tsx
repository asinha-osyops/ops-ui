import { ReactNode } from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface DetailFieldProps {
  label: string
  value: string | number | ReactNode
  className?: string
  valueClassName?: string
  mono?: boolean // Use monospace font for IDs, codes, etc.
}

/**
 * Reusable component for rendering a detail field with label and value
 * Used in expandable log line details across different log types
 * Now uses shadcn Label component for consistent styling
 */
export function DetailField({
  label,
  value,
  className = '',
  valueClassName = '',
  mono = false,
}: DetailFieldProps) {
  const defaultValueClass = mono
    ? 'text-sm text-foreground font-mono text-xs'
    : 'text-sm text-foreground'

  return (
    <div className={className}>
      <Label className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </Label>
      <div className={cn(defaultValueClass, valueClassName)}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <p>{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
