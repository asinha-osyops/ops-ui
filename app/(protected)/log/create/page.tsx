'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiClient, LoggingSource } from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PageLayout } from '@/components/PageLayout'
import { logSchema, type LogFormValues } from '@/lib/schemas/log'
import { useFileUpload } from '@/lib/hooks/useFileUpload'
import { useAppContext } from '@/lib/app-context'
import { usePostCreateRedirect } from '@/lib/hooks/usePostCreateRedirect'
import { useEntityColorScheme } from '@/lib/hooks/useColorScheme'
import { useRequireCompany } from '@/lib/hooks/useRequireCompany'
import { useValidatedFileUpload } from '@/lib/hooks/useValidatedFileUpload'
import {
  showFileUploadSuccessToast,
  showFileUploadFailedToast,
} from '@/lib/utils/notifications'
import { FileUploadButton } from '@/components/ui/FileUploadButton'
import { VALIDATION } from '@/lib/constants/ui-strings'

export default function CreateLog() {
  const { refreshLogs, selectedCompany } = useAppContext()

  // Use consolidated hooks
  const { classes: logClasses, buttonClasses: logButtonClasses } =
    useEntityColorScheme('Log')

  // Company requirement guard
  const { hasCompany, companyRequiredFallback } = useRequireCompany({
    title: 'Upload Log',
    titleClassName: logClasses.text,
    breadcrumbs: Breadcrumbs.log.create,
  })

  const { handlePostCreate } = usePostCreateRedirect({
    refreshFn: refreshLogs,
    redirectTo: Route.LOG_HOME,
  })
  const [metadataJson, setMetadataJson] = useState('{}')

  // Compute metadata error during render instead of in useEffect
  const metadataError = (() => {
    try {
      JSON.parse(metadataJson)
      return ''
    } catch {
      return 'Invalid JSON format'
    }
  })()

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      logName: '',
      loggingSource: LoggingSource.GOOGLE_WORKSPACE,
      metadata: {},
    },
  })

  const { uploading, triggerFileInput, fileInputProps } = useFileUpload({
    accept: '.log,.txt,.csv,.json',
    onUpload: async (file) => {
      const values = form.getValues()

      // Validate company is selected (from context)
      if (!selectedCompany?.id) {
        throw new Error(VALIDATION.companyRequired)
      }

      // Create request DTO with metadata as string (per OpenAPI spec)
      const requestDto = {
        companyId: selectedCompany.id,
        name: values.logName,
        loggingSource: values.loggingSource,
        metadata: JSON.stringify(values.metadata || {}),
      }

      // Single API call with both metadata and REQUIRED file
      await apiClient.createLogWithFile(requestDto, file)
    },
    onSuccess: async () => {
      showFileUploadSuccessToast('Log')
      await handlePostCreate()
    },
    onError: (message) => {
      showFileUploadFailedToast(message)
    },
  })

  // Use validated file upload hook with additional metadata validation
  const handleUploadClick = useValidatedFileUpload({
    form,
    triggerFileInput,
    additionalValidation: () => ({
      isValid: !metadataError,
      error: 'Please fix the JSON error before uploading',
    }),
  })

  // Update form value when metadata JSON changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(metadataJson)
      form.setValue('metadata', parsed)
    } catch {
      // Invalid JSON - error is computed during render
    }
  }, [metadataJson, form])

  // Show alert if no company selected
  if (!hasCompany) {
    return companyRequiredFallback
  }

  return (
    <PageLayout
      title="Upload Log"
      titleClassName={logClasses.text}
      breadcrumbs={Breadcrumbs.log.create}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Log Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4 max-w-2xl">
              {/* Log Name */}
              <FormField
                control={form.control}
                name="logName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter log name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logging Source */}
              <FormField
                control={form.control}
                name="loggingSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logging Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a logging source..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LoggingSource.GOOGLE_WORKSPACE}>
                          Google Workspace
                        </SelectItem>
                        <SelectItem value={LoggingSource.MICROSOFT_OFFICE}>
                          Microsoft Office
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Metadata JSON */}
              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  placeholder='Enter metadata as JSON (e.g., {"key": "value"})'
                  className={cn(
                    'font-mono text-sm',
                    metadataError &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  rows={6}
                  aria-invalid={!!metadataError}
                  aria-describedby={
                    metadataError ? 'metadata-error' : 'metadata-hint'
                  }
                />
                {metadataError && (
                  <p
                    id="metadata-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {metadataError}
                  </p>
                )}
                <p id="metadata-hint" className="text-xs text-muted-foreground">
                  Enter valid JSON format. Example:{' '}
                  {`{"period": "Jan 2025", "recordCount": 100}`}
                </p>
              </div>

              {/* Upload Button */}
              <FileUploadButton
                entityType="Log"
                uploading={uploading}
                fileInputProps={fileInputProps}
                onUploadClick={handleUploadClick}
                buttonClassName={logButtonClasses}
              />
            </div>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
