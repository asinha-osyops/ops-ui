'use client'

import { useState, useCallback } from 'react'
import {
  apiClient,
  LogLineDto,
  EventCategory,
  Platform,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { QueryTypeSelector } from './QueryTypeSelector'
import { DynamicFieldRenderer } from './DynamicFieldRenderer'
import {
  QueryTab,
  getQueryConfigById,
  getQueriesByTab,
  QUERY_CONFIGS,
} from '@/lib/config/logline-query-config'
import { AlertTriangle, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface UnifiedQueryBuilderProps {
  onResults: (results: LogLineDto[]) => void
  loading?: boolean
  onLoadingChange?: (loading: boolean) => void
}

export function UnifiedQueryBuilder({
  onResults,
  loading = false,
  onLoadingChange,
}: UnifiedQueryBuilderProps) {
  const [activeTab, setActiveTab] = useState<QueryTab>('basic')
  const [selectedQueryId, setSelectedQueryId] = useState('actor')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const selectedConfig = getQueryConfigById(selectedQueryId)
  const multiAttributeConfig = getQueryConfigById('multiAttribute')
  const advancedConfigs = getQueriesByTab('advanced')

  const setLoading = useCallback(
    (value: boolean) => {
      onLoadingChange?.(value)
    },
    [onLoadingChange]
  )

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleClear = () => {
    setFieldValues({})
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      let results: LogLineDto[] = []

      if (activeTab === 'basic' && selectedConfig) {
        results = await executeBasicQuery(selectedConfig.id, fieldValues)
      } else if (activeTab === 'multiAttribute') {
        results = await executeMultiAttributeQuery(fieldValues)
      } else if (activeTab === 'advanced') {
        // For advanced tab, we use resourceTitle query
        results = await executeAdvancedQuery(fieldValues)
      }

      onResults(results)
    } catch (error) {
      console.error('Query error:', error)
      toast.error('Failed to execute query', {
        description: 'Please check your parameters and try again.',
      })
      onResults([])
    } finally {
      setLoading(false)
    }
  }

  const executeBasicQuery = async (
    queryId: string,
    values: Record<string, string>
  ): Promise<LogLineDto[]> => {
    switch (queryId) {
      case 'actor':
        return values.actor ? apiClient.getLogLinesByActor(values.actor) : []
      case 'owner':
        return values.owner ? apiClient.getLogLinesByOwner(values.owner) : []
      case 'user':
        return values.user ? apiClient.getLogLinesByUser(values.user) : []
      case 'sharingDetection':
        return values.owner
          ? apiClient.getLogLinesSharingDetection(values.owner)
          : []
      case 'eventCategory':
        return values.eventCategory
          ? apiClient.getLogLinesByEventCategory(
              values.eventCategory as EventCategory
            )
          : []
      case 'event':
        return values.event ? apiClient.getLogLinesByEvent(values.event) : []
      case 'dateRange':
        if (values.start && values.end) {
          const startInstant = new Date(values.start).toISOString()
          const endInstant = new Date(values.end).toISOString()
          return apiClient.getLogLinesByDateRange(startInstant, endInstant)
        }
        return []
      case 'platform':
        return values.platform
          ? apiClient.getLogLinesByPlatform(values.platform as Platform)
          : []
      case 'platformService':
        return values.platform && values.service
          ? apiClient.getLogLinesByPlatformAndService(
              values.platform as Platform,
              values.service
            )
          : []
      case 'service':
        return values.service
          ? apiClient.getLogLinesByService(values.service)
          : []
      case 'domain':
        return values.domain ? apiClient.getLogLinesByDomain(values.domain) : []
      case 'ip':
        return values.ipAddress
          ? apiClient.getLogLinesByIp(values.ipAddress)
          : []
      case 'resourceId':
        return values.resourceId
          ? apiClient.getLogLinesByResourceId(values.resourceId)
          : []
      default:
        return []
    }
  }

  const executeMultiAttributeQuery = async (
    values: Record<string, string>
  ): Promise<LogLineDto[]> => {
    const filters: Record<
      string,
      string | EventCategory | Platform | undefined
    > = {}

    if (values.event?.trim()) filters.event = values.event.trim()
    if (values.eventCategory)
      filters.eventCategory = values.eventCategory as EventCategory
    if (values.platform) filters.platform = values.platform as Platform
    if (values.service?.trim()) filters.service = values.service.trim()
    if (values.actor?.trim()) filters.actor = values.actor.trim()
    if (values.owner?.trim()) filters.owner = values.owner.trim()
    if (values.target?.trim()) filters.target = values.target.trim()
    if (values.domain?.trim()) filters.domain = values.domain.trim()
    if (values.resourceId?.trim()) filters.resourceId = values.resourceId.trim()
    if (values.ipAddress?.trim()) filters.ipAddress = values.ipAddress.trim()
    if (values.startDate)
      filters.startDate = new Date(values.startDate).toISOString()
    if (values.endDate) filters.endDate = new Date(values.endDate).toISOString()

    return apiClient.getLogLinesByMultiAttribute(filters)
  }

  const executeAdvancedQuery = async (
    values: Record<string, string>
  ): Promise<LogLineDto[]> => {
    // Currently only resourceTitle is in advanced
    if (values.resourceTitle?.trim()) {
      return apiClient.getLogLinesByResourceTitle(values.resourceTitle.trim())
    }
    return []
  }

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="mb-2">Query Type</Label>
        <QueryTypeSelector
          value={selectedQueryId}
          onChange={(value) => {
            setSelectedQueryId(value)
            setFieldValues({})
          }}
          disabled={loading}
        />
        {selectedConfig?.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {selectedConfig.description}
          </p>
        )}
      </div>

      {selectedConfig && (
        <div
          className={`grid gap-4 ${selectedConfig.fields.length > 1 ? 'grid-cols-1 md:grid-cols-2' : ''}`}
        >
          {selectedConfig.fields.map((field) => (
            <DynamicFieldRenderer
              key={field.name}
              field={field}
              value={fieldValues[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              disabled={loading}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderMultiAttributeTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Combine multiple filters for precise results. Only non-empty fields will
        be used.
      </p>
      {multiAttributeConfig && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {multiAttributeConfig.fields.map((field) => (
            <DynamicFieldRenderer
              key={field.name}
              field={field}
              value={fieldValues[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              disabled={loading}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">
          Performance Warning
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          These queries may take longer to execute on large datasets.
        </AlertDescription>
      </Alert>

      {advancedConfigs.map((config) => (
        <Card
          key={config.id}
          className="border-amber-200 dark:border-amber-900"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{config.label}</CardTitle>
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
            {config.performanceWarning && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {config.performanceWarning}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {config.fields.map((field) => (
                <DynamicFieldRenderer
                  key={field.name}
                  field={field}
                  value={fieldValues[field.name] || ''}
                  onChange={(value) => handleFieldChange(field.name, value)}
                  disabled={loading}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Query Log Lines</CardTitle>
        <CardDescription>
          Search and filter log lines using various query types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as QueryTab)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Queries</TabsTrigger>
            <TabsTrigger value="multiAttribute">Multi-Attribute</TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="text-amber-600 dark:text-amber-400"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-0">
            {renderBasicTab()}
          </TabsContent>

          <TabsContent value="multiAttribute" className="mt-0">
            {renderMultiAttributeTab()}
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            {renderAdvancedTab()}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
