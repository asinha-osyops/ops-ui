'use client'

import { AppProvider } from '@/lib/app-context'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useRequireAuth()

  // Show loading state while checking auth
  if (isLoading || !isAuthenticated) {
    return <AuthLoadingScreen message="Verifying authentication..." />
  }

  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="font-semibold">OSY Operations</span>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  )
}
