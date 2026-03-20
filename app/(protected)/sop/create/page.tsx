'use client'

export const dynamic = 'force-dynamic'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiClient, SopDto } from '@/lib/api-client'
import { Route, Breadcrumbs } from '@/lib/routes'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { sopSchema, type SopFormValues } from '@/lib/schemas/sop'
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

export default function CreateSop() {
  const { refreshSops, selectedCompany } = useAppContext()

  // Use consolidated hooks
  const { classes: sopClasses, buttonClasses: sopButtonClasses } =
    useEntityColorScheme('SOP')

  // Company requirement guard
  const { hasCompany, companyRequiredFallback } = useRequireCompany({
    title: 'Upload SOP',
    titleClassName: sopClasses.text,
    breadcrumbs: Breadcrumbs.sop.create,
  })

  const { handlePostCreate } = usePostCreateRedirect({
    refreshFn: refreshSops,
    redirectTo: Route.SOP_HOME,
  })

  const form = useForm<SopFormValues>({
    resolver: zodResolver(sopSchema),
    defaultValues: {
      sopName: '',
      basicDescription: '',
      steps: [],
    },
  })

  const { uploading, triggerFileInput, fileInputProps } = useFileUpload<SopDto>(
    {
      accept: '.pdf,.doc,.docx',
      onUpload: async (file) => {
        const values = form.getValues()

        // Validate company is selected (from context)
        if (!selectedCompany?.id) {
          throw new Error(VALIDATION.companyRequired)
        }
        if (!values.sopName || values.sopName.trim() === '') {
          throw new Error('SOP name is required. Please enter an SOP name.')
        }
        if (!values.basicDescription || values.basicDescription.trim() === '') {
          throw new Error(
            'Description is required. Please enter a description.'
          )
        }

        // Create request DTO
        const requestDto = {
          companyId: selectedCompany.id,
          name: values.sopName,
          basicDescription: values.basicDescription,
          steps: [],
        }

        // Single API call with both metadata and file - return the created SOP
        return await apiClient.createSopWithFile(requestDto, file)
      },
      onSuccess: async (createdSop) => {
        showFileUploadSuccessToast('SOP')
        await handlePostCreate(createdSop.id)
      },
      onError: (message) => {
        showFileUploadFailedToast(message)
      },
    }
  )

  // Use validated file upload hook
  const handleUploadClick = useValidatedFileUpload({
    form,
    triggerFileInput,
  })

  // Show alert if no company selected
  if (!hasCompany) {
    return companyRequiredFallback
  }

  return (
    <PageLayout
      title="Upload SOP"
      titleClassName={sopClasses.text}
      breadcrumbs={Breadcrumbs.sop.create}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            SOP Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4 max-w-2xl">
              {/* SOP Name */}
              <FormField
                control={form.control}
                name="sopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SOP name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Description */}
              <FormField
                control={form.control}
                name="basicDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter SOP description"
                        rows={4}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload Button */}
              <FileUploadButton
                entityType="SOP"
                uploading={uploading}
                fileInputProps={fileInputProps}
                onUploadClick={handleUploadClick}
                buttonClassName={sopButtonClasses}
              />
            </div>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
