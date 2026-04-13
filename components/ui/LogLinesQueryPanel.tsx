import { useState } from 'react'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { QueryType, QueryParams } from '@/lib/types/logline-query'

interface LogLinesQueryPanelProps {
  onQuery: (queryType: QueryType, params: QueryParams) => void
  loading?: boolean
}

interface QueryFieldConfig {
  type: 'text' | 'datetime-local'
  label: string
  paramKey: keyof QueryParams
  placeholder?: string
  gridClass?: string
}

interface QueryConfig {
  value: QueryType
  label: string
  fields: QueryFieldConfig[]
}

const QUERY_CONFIGS: QueryConfig[] = [
  {
    value: 'actor',
    label: 'By Actor',
    fields: [
      {
        type: 'text',
        label: 'Actor',
        paramKey: 'actor',
        placeholder: 'Enter actor name...',
      },
    ],
  },
  {
    value: 'owner',
    label: 'By Owner',
    fields: [
      {
        type: 'text',
        label: 'Owner',
        paramKey: 'owner',
        placeholder: 'Enter owner name...',
      },
    ],
  },
  {
    value: 'event',
    label: 'By Event Type',
    fields: [
      {
        type: 'text',
        label: 'Event Type',
        paramKey: 'event',
        placeholder: 'Enter event type...',
      },
    ],
  },
  {
    value: 'domain',
    label: 'By Domain',
    fields: [
      {
        type: 'text',
        label: 'Domain',
        paramKey: 'domain',
        placeholder: 'Enter domain...',
      },
    ],
  },
  {
    value: 'ip',
    label: 'By IP Address',
    fields: [
      {
        type: 'text',
        label: 'IP Address',
        paramKey: 'ipAddress',
        placeholder: 'Enter IP address...',
      },
    ],
  },
  {
    value: 'dateRange',
    label: 'By Date Range',
    fields: [
      { type: 'datetime-local', label: 'Start Date', paramKey: 'start' },
      { type: 'datetime-local', label: 'End Date', paramKey: 'end' },
    ],
  },
  {
    value: 'user',
    label: 'By User (All Activity)',
    fields: [
      {
        type: 'text',
        label: 'User',
        paramKey: 'user',
        placeholder: 'Enter user email or name...',
      },
    ],
  },
  {
    value: 'sharingDetection',
    label: 'Sharing Detection',
    fields: [
      {
        type: 'text',
        label: 'File Owner',
        paramKey: 'owner',
        placeholder: 'Enter file owner to find who accessed their files...',
      },
    ],
  },
]

export function LogLinesQueryPanel({
  onQuery,
  loading = false,
}: LogLinesQueryPanelProps) {
  const [selectedQuery, setSelectedQuery] = useState<QueryType>('actor')
  const [params, setParams] = useState<QueryParams>({})

  const currentConfig = QUERY_CONFIGS.find(
    (config) => config.value === selectedQuery
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onQuery(selectedQuery, params)
  }

  const handleReset = () => {
    setParams({})
  }

  const handleInputChange = (key: keyof QueryParams, value: string) => {
    setParams({ ...params, [key]: value })
  }

  const renderQueryFields = () => {
    if (!currentConfig) return null

    const containerClass =
      currentConfig.fields.length > 1
        ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'
        : ''

    return (
      <div className={containerClass}>
        {currentConfig.fields.map((field) => (
          <div key={field.paramKey}>
            <Label className="mb-2">{field.label}</Label>
            <Input
              type={field.type}
              value={(params[field.paramKey] as string) || ''}
              onChange={(e) =>
                handleInputChange(field.paramKey, e.target.value)
              }
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Query Log Lines</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Query Type Selector */}
        <div className="mb-4">
          <Label className="mb-2">Query Type</Label>
          <Select
            value={selectedQuery}
            onValueChange={(value) => {
              setSelectedQuery(value as QueryType)
              setParams({})
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select query type" />
            </SelectTrigger>
            <SelectContent>
              {QUERY_CONFIGS.map((config) => (
                <SelectItem key={config.value} value={config.value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Query Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">{renderQueryFields()}</div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
