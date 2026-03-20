'use client'

import { useState } from 'react'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { MultiAttributeFilters } from '@/lib/types/logline-query'

interface MultiAttributeQueryPanelProps {
  onSearch: (filters: MultiAttributeFilters) => void
  isLoading: boolean
}

export function MultiAttributeQueryPanel({
  onSearch,
  isLoading,
}: MultiAttributeQueryPanelProps) {
  const [filters, setFilters] = useState<MultiAttributeFilters>({
    event: '',
    actor: '',
    owner: '',
    target: '',
  })

  const handleInputChange = (
    field: keyof MultiAttributeFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    // Build filters object, only including non-empty values
    const trimmedFilters: MultiAttributeFilters = {}

    if (filters.event?.trim()) trimmedFilters.event = filters.event.trim()
    if (filters.actor?.trim()) trimmedFilters.actor = filters.actor.trim()
    if (filters.owner?.trim()) trimmedFilters.owner = filters.owner.trim()
    if (filters.target?.trim()) trimmedFilters.target = filters.target.trim()

    onSearch(trimmedFilters)
  }

  const handleClear = () => {
    setFilters({
      event: '',
      actor: '',
      owner: '',
      target: '',
    })
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <h2 className="text-lg font-medium text-foreground mb-4">
        Multi-Attribute Search
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Search log lines by multiple attributes. Leave fields empty to exclude
        them from the search.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Event */}
        <div className="space-y-2">
          <Label htmlFor="event">Event</Label>
          <Input
            id="event"
            value={filters.event || ''}
            onChange={(e) => handleInputChange('event', e.target.value)}
            placeholder="e.g., Edit, View, Send"
            disabled={isLoading}
          />
        </div>

        {/* Actor */}
        <div className="space-y-2">
          <Label htmlFor="actor">Actor</Label>
          <Input
            id="actor"
            value={filters.actor || ''}
            onChange={(e) => handleInputChange('actor', e.target.value)}
            placeholder="e.g., user@example.com"
            disabled={isLoading}
          />
        </div>

        {/* Owner */}
        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Input
            id="owner"
            value={filters.owner || ''}
            onChange={(e) => handleInputChange('owner', e.target.value)}
            placeholder="e.g., owner@example.com"
            disabled={isLoading}
          />
        </div>

        {/* Target */}
        <div className="space-y-2">
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            value={filters.target || ''}
            onChange={(e) => handleInputChange('target', e.target.value)}
            placeholder="e.g., target user or resource"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSearch} disabled={isLoading} variant="default">
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        <Button onClick={handleClear} disabled={isLoading} variant="ghost">
          Clear
        </Button>
      </div>
    </div>
  )
}
