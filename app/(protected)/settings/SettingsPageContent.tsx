'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { PageLayout } from '@/components/PageLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompanyManagementTab } from '@/components/settings/CompanyManagementTab'
import { ActivityEventManagementTab } from '@/components/settings/ActivityEventManagementTab'
import { Building2, Activity } from 'lucide-react'

export function SettingsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'companies'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/settings?${params.toString()}`)
  }

  return (
    <PageLayout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Companies</span>
          </TabsTrigger>
          <TabsTrigger
            value="activityevents"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            <span>Activity Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <CompanyManagementTab />
        </TabsContent>

        <TabsContent value="activityevents">
          <ActivityEventManagementTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
