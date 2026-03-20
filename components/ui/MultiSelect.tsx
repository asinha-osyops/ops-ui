'use client'

import { useState } from 'react'
import { formatEnumSimple } from '@/lib/utils/format-helpers'
import { Label } from './label'
import { Badge } from './badge'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectProps<T extends string> {
  id: string
  label: string
  options: T[]
  selectedValues: T[]
  onChange: (values: T[]) => void
  formatLabel?: (value: T) => string
  required?: boolean
  placeholder?: string
}

export function MultiSelect<T extends string>({
  id,
  label,
  options,
  selectedValues,
  onChange,
  formatLabel = formatEnumSimple,
  required = false,
  placeholder = 'Select options...',
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false)

  const toggleOption = (option: T) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option))
    } else {
      onChange([...selectedValues, option])
    }
  }

  const removeOption = (option: T) => {
    onChange(selectedValues.filter((v) => v !== option))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {/* Selected values display */}
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2 border border-input rounded-md bg-card">
        {selectedValues.length > 0 ? (
          selectedValues.map((value) => (
            <Badge key={value} variant="default" className="gap-1">
              {formatLabel(value)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeOption(value)
                }}
                className="ml-1 hover:text-destructive"
                aria-label={`Remove ${formatLabel(value)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm py-1">
            {placeholder}
          </span>
        )}
      </div>

      {/* Popover with Command for selection */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option)
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => toggleOption(option)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {formatLabel(option)}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
