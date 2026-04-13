import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, PUBLIC_PATHS } from './lib/auth-constants'

/**
 * Check if a JWT token is expired by decoding the payload.
 * Does NOT verify signature (no secret available in middleware).
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    // Decode base64url payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    if (!payload.exp) return false // No expiry claim — don't block

    // exp is in seconds, Date.now() in ms. 5s buffer for clock skew.
    return payload.exp * 1000 < Date.now() - 5000
  } catch {
    // Can't decode — let the request through, client-side will handle
    return false
  }
}

/**
 * Check if a path is public (no auth required)
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path)
}

/**
 * Next.js Middleware for authentication
 *
 * This middleware runs on the Edge Runtime before every request and:
 * 1. Allows public paths without authentication
 * 2. Redirects unauthenticated users to login for protected paths
 * 3. Preserves the original URL for redirect after login
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, .well-known, and preview routes (not covered by config.matcher)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/preview')
  ) {
    return NextResponse.next()
  }

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token in cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    // No token - redirect to login with original URL preserved
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('expired', 'true')
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(AUTH_COOKIE_NAME)
    return response
  }

  // Token exists and is not expired - allow the request
  return NextResponse.next()
}

/**
 * Configure which paths the middleware should run on
 *
 * Using a matcher for better performance:
 * - Excludes _next/static (static files)
 * - Excludes _next/image (image optimization files)
 * - Excludes favicon.ico
 * - Excludes public folder
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
