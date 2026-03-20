'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/PageLayout'
import { useAuth } from '@/lib/auth-context'
import { Route } from '@/lib/routes'
import { SystemHealthCard } from '@/components/admin/SystemHealthCard'
import { DatabaseHealthCard } from '@/components/admin/DatabaseHealthCard'
import { DatabaseTablesPanel } from '@/components/admin/DatabaseTablesPanel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminHealthPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push(Route.HOME)
    }
  }, [isAdmin, isLoading, isAuthenticated, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <PageLayout
        title="System Health"
        breadcrumbs={[
          { label: 'Admin', route: Route.ADMIN_USERS },
          { label: 'Health' },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    )
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <PageLayout
        title="System Health"
        breadcrumbs={[
          { label: 'Admin', route: Route.ADMIN_USERS },
          { label: 'Health' },
        ]}
      >
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Admin access is
            required.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={Route.HOME}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </Button>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="System Health"
      breadcrumbs={[
        { label: 'Admin', route: Route.ADMIN_USERS },
        { label: 'Health' },
      ]}
      headerActions={
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            User Management
          </Link>
        </Button>
      }
    >
      {/* Service and Database Health Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <SystemHealthCard autoRefresh refreshInterval={30000} />
        <DatabaseHealthCard />
      </div>

      {/* Database Tables */}
      <DatabaseTablesPanel />
    </PageLayout>
  )
}
