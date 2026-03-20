'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatEnumTitleCase } from '@/lib/utils/format-helpers'
import { Route } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PageLayout } from '@/components/PageLayout'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient, Pillar } from '@/lib/api-client'
import { companySchema, type CompanyFormValues } from '@/lib/schemas/company'
import { useAppContext } from '@/lib/app-context'
import { usePostCreateRedirect } from '@/lib/hooks/usePostCreateRedirect'
import { executeWithToast } from '@/lib/utils/error-handling'
import { COMPANY_PRESETS } from '@/lib/utils/entity-presets'
import { useColorScheme } from '@/lib/hooks/useColorScheme'

export default function Home() {
  const router = useRouter()
  const { refetchCompanies, setCompanyAsSelected } = useAppContext()
  const { getEntityOutlineButtonClasses } = useColorScheme()
  const companyOutlineClasses = getEntityOutlineButtonClasses('Company')

  const { handlePostCreate } = usePostCreateRedirect({
    refreshFn: refetchCompanies,
    redirectTo: Route.COMPANY_HOME,
    setAsSelected: setCompanyAsSelected,
  })

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      ceoId: null,
      pointOfContactId: null,
      pillars: [],
    },
  })

  // All available pillars for the checkbox group
  const allPillars = Object.values(Pillar)

  const clearAll = () => {
    form.reset()
  }

  const fillPreset = (index: number) => {
    const preset = COMPANY_PRESETS[index]
    if (!preset) return
    form.setValue('name', preset.data.name)
    form.setValue('address', preset.data.address)
    form.setValue('phoneNumber', preset.data.phoneNumber)
    form.setValue('email', preset.data.email)
    form.setValue('pillars', preset.data.pillars)
  }

  const onSubmit = async (data: CompanyFormValues) => {
    const createdCompany = await executeWithToast(
      () =>
        apiClient.createCompany({
          name: data.name,
          phoneNumber: data.phoneNumber,
          email: data.email,
          address: data.address,
          ceoId: data.ceoId,
          pointOfContactId: data.pointOfContactId,
          pillars: data.pillars,
        }),
      {
        success: 'Company created successfully!',
        error: 'Failed to create company',
      }
    )

    if (createdCompany) {
      await handlePostCreate(createdCompany.id)
    }
  }

  return (
    <PageLayout
      title="Create Company"
      breadcrumbs={[
        { label: 'Companies', route: Route.COMPANY_HOME },
        { label: 'Create' },
      ]}
      headerActions={
        <>
          <Button variant="ghost" onClick={clearAll}>
            Clear
          </Button>
          {COMPANY_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              className={companyOutlineClasses}
              onClick={() => fillPreset(COMPANY_PRESETS.indexOf(preset))}
            >
              Fill: {preset.label}
            </Button>
          ))}
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Company Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., +1-555-123-4567 or 555-123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter company address"
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Organizational Pillars Section */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Organizational Pillars
            </h2>
            <FormField
              control={form.control}
              name="pillars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Pillars *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                    {allPillars.map((pillar) => (
                      <div key={pillar} className="flex items-center space-x-2">
                        <Checkbox
                          id={pillar}
                          checked={field.value?.includes(pillar)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || []
                            if (checked) {
                              field.onChange([...currentValue, pillar])
                            } else {
                              field.onChange(
                                currentValue.filter((p) => p !== pillar)
                              )
                            }
                          }}
                        />
                        <label
                          htmlFor={pillar}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {formatEnumTitleCase(pillar)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Section */}
          <div className="flex justify-between pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push(Route.COMPANY_HOME)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  )
}
