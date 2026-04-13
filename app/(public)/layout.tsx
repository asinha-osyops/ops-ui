'use client'

import Link from 'next/link'
import { Route } from '@/lib/routes'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to home if already authenticated (except for landing page)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const currentPath = window.location.pathname
      if (currentPath === '/login') {
        router.push(Route.HOME)
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href={Route.LANDING} className="flex items-center gap-2">
            <span className="font-bold text-xl">OSY Operations</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isAuthenticated && (
              <Button asChild variant="default">
                <Link href={Route.LOGIN}>Login</Link>
              </Button>
            )}
            {isAuthenticated && (
              <Button asChild variant="default">
                <Link href={Route.HOME}>Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} OSY Operations. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
