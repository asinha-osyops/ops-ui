'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth-context'
import { Route } from '../routes'
import { AUTH_QUERY_PARAMS } from '../auth-constants'

interface UseRequireAuthOptions {
  requireAdmin?: boolean
}

/**
 * Hook that requires authentication before rendering a page.
 * Redirects to /login if not authenticated, preserving the original URL.
 * Optionally requires admin role.
 *
 * @returns The auth state
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requireAdmin = false } = options
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for loading to complete
    if (auth.isLoading) return

    // Redirect to login if not authenticated, preserving the current URL
    if (!auth.isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search
      const redirectParam = encodeURIComponent(currentPath)
      router.push(
        `${Route.LOGIN}?${AUTH_QUERY_PARAMS.REDIRECT}=${redirectParam}`
      )
      return
    }

    // Redirect if admin is required but user is not admin
    if (requireAdmin && !auth.isAdmin) {
      router.push(Route.HOME)
      return
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.isAdmin, requireAdmin, router])

  return auth
}
