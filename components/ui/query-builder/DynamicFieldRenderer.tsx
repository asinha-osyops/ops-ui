'use client'

import { QueryFieldConfig } from '@/lib/config/logline-query-config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { EnumSelect } from './EnumSelect'

interface DynamicFieldRendererProps {
  field: QueryFieldConfig
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: DynamicFieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'enum':
        return (
          <EnumSelect
            enumType={field.enumType!}
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        )

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  )
}
