'use client'

import { EventCategory, Platform } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EVENT_CATEGORY_GROUPS,
  PLATFORM_LABELS,
} from '@/lib/config/logline-query-config'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'

interface EnumSelectProps {
  enumType: 'Platform' | 'EventCategory'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function EnumSelect({
  enumType,
  value,
  onChange,
  placeholder,
  disabled = false,
}: EnumSelectProps) {
  if (enumType === 'Platform') {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || 'Select platform'} />
        </SelectTrigger>
        <SelectContent>
          {Object.values(Platform).map((platform) => (
            <SelectItem key={platform} value={platform}>
              {PLATFORM_LABELS[platform]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // EventCategory with grouped options
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || 'Select event category'} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(EVENT_CATEGORY_GROUPS).map(
          ([groupName, categories]) => (
            <SelectGroup key={groupName}>
              <SelectLabel className="text-xs font-semibold text-muted-foreground">
                {groupName}
              </SelectLabel>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {formatEnumTitleCase(category)}
                </SelectItem>
              ))}
            </SelectGroup>
          )
        )}
      </SelectContent>
    </Select>
  )
}
