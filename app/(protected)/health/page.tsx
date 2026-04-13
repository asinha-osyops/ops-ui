'use client'

import { useRef, useCallback } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { useAuth } from '@/lib/auth-context'
import { Breadcrumbs } from '@/lib/routes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion } from '@/components/ui/accordion'
import { RefreshCw } from 'lucide-react'
import {
  AppHealthRow,
  AdminSystemRow,
  DbPoolRow,
  DbStatsRow,
} from '@/components/health'
import type {
  AppHealthRowHandle,
  AdminSystemRowHandle,
  DbPoolRowHandle,
  DbStatsRowHandle,
} from '@/components/health'

export default function HealthPage() {
  const { isAdmin } = useAuth()

  const appRef = useRef<AppHealthRowHandle>(null)
  const systemRef = useRef<AdminSystemRowHandle>(null)
  const poolRef = useRef<DbPoolRowHandle>(null)
  const statsRef = useRef<DbStatsRowHandle>(null)

  const handleRefreshAll = useCallback(() => {
    appRef.current?.refresh()
    systemRef.current?.refresh()
    poolRef.current?.refresh()
    statsRef.current?.refresh()
  }, [])

  return (
    <PageLayout
      title="System Health"
      breadcrumbs={Breadcrumbs.health.home}
      headerActions={
        <Button variant="outline" size="sm" onClick={handleRefreshAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      }
    >
      <Card className="p-2">
        <Accordion
          type="multiple"
          defaultValue={['app-health']}
          className="space-y-2"
        >
          <AppHealthRow ref={appRef} />

          {isAdmin && (
            <>
              <AdminSystemRow ref={systemRef} />
              <DbPoolRow ref={poolRef} />
              <DbStatsRow ref={statsRef} />
            </>
          )}
        </Accordion>
      </Card>
    </PageLayout>
  )
}
