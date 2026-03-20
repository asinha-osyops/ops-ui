'use client'

import { useState } from 'react'
import { Platform, LogLineEventTypeMappingDto } from '@/lib/api-client'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Badge } from './badge'
import { Plus, Trash2 } from 'lucide-react'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'

interface LogLineEventTypeMappingsEditorProps {
  mappings: LogLineEventTypeMappingDto[]
  onChange: (mappings: LogLineEventTypeMappingDto[]) => void
  disabled?: boolean
}

export function LogLineEventTypeMappingsEditor({
  mappings,
  onChange,
  disabled = false,
}: LogLineEventTypeMappingsEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newMapping, setNewMapping] = useState<
    Partial<LogLineEventTypeMappingDto>
  >({
    platform: undefined,
    service: '',
    event: '',
  })

  const handleAddMapping = () => {
    if (
      !newMapping.platform ||
      !newMapping.service?.trim() ||
      !newMapping.event?.trim()
    ) {
      return
    }

    const mapping: LogLineEventTypeMappingDto = {
      platform: newMapping.platform,
      service: newMapping.service.trim(),
      event: newMapping.event.trim(),
    }

    onChange([...mappings, mapping])
    setNewMapping({ platform: undefined, service: '', event: '' })
    setIsAdding(false)
  }

  const handleRemoveMapping = (index: number) => {
    const updated = mappings.filter((_, i) => i !== index)
    onChange(updated)
  }

  const canAdd =
    newMapping.platform &&
    newMapping.service?.trim() &&
    newMapping.event?.trim()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Log Line Event Type Mappings</Label>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Mapping
          </Button>
        )}
      </div>

      {/* Existing mappings */}
      {mappings.length > 0 ? (
        <div className="space-y-2">
          {mappings.map((mapping, index) => (
            <div
              key={`${mapping.platform}-${mapping.service}-${mapping.event}-${index}`}
              className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
            >
              <Badge variant="outline" className="shrink-0">
                {formatEnumTitleCase(mapping.platform)}
              </Badge>
              <span className="text-sm text-muted-foreground">/</span>
              <Badge variant="secondary" className="shrink-0">
                {mapping.service}
              </Badge>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm flex-1 truncate">{mapping.event}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMapping(index)}
                disabled={disabled}
                className="h-7 w-7 p-0 shrink-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <p className="text-sm text-muted-foreground italic">(none)</p>
        )
      )}

      {/* Add new mapping form */}
      {isAdding && (
        <div className="border rounded-md p-3 space-y-3 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="new-platform" className="text-xs">
                Platform *
              </Label>
              <Select
                value={newMapping.platform}
                onValueChange={(value) =>
                  setNewMapping((prev) => ({
                    ...prev,
                    platform: value as Platform,
                  }))
                }
                disabled={disabled}
              >
                <SelectTrigger id="new-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Platform).map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {formatEnumTitleCase(platform)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-service" className="text-xs">
                Service *
              </Label>
              <Input
                id="new-service"
                value={newMapping.service || ''}
                onChange={(e) =>
                  setNewMapping((prev) => ({
                    ...prev,
                    service: e.target.value,
                  }))
                }
                placeholder="e.g., Drive, Mail"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-event" className="text-xs">
                Event *
              </Label>
              <Input
                id="new-event"
                value={newMapping.event || ''}
                onChange={(e) =>
                  setNewMapping((prev) => ({ ...prev, event: e.target.value }))
                }
                placeholder="e.g., edit, view"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddMapping}
              disabled={disabled || !canAdd}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewMapping({ platform: undefined, service: '', event: '' })
              }}
              disabled={disabled}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
