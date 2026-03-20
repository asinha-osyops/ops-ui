'use client'

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
  QueryConfig,
  QueryCategory,
  getQueriesByTab,
  getQueriesByCategory,
  CATEGORY_LABELS,
} from '@/lib/config/logline-query-config'

interface QueryTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function QueryTypeSelector({
  value,
  onChange,
  disabled = false,
}: QueryTypeSelectorProps) {
  const basicQueries = getQueriesByTab('basic')
  const categories: QueryCategory[] = [
    'user',
    'event',
    'infrastructure',
    'resource',
  ]

  // Group queries by category
  const groupedQueries = categories.reduce(
    (acc, category) => {
      const queries = getQueriesByCategory('basic', category)
      if (queries.length > 0) {
        acc[category] = queries
      }
      return acc
    },
    {} as Record<QueryCategory, QueryConfig[]>
  )

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select query type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedQueries).map(([category, queries]) => (
          <SelectGroup key={category}>
            <SelectLabel className="text-xs font-semibold text-muted-foreground">
              {CATEGORY_LABELS[category as QueryCategory]}
            </SelectLabel>
            {queries.map((query) => (
              <SelectItem key={query.id} value={query.id}>
                {query.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
