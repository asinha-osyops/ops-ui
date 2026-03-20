import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, PUBLIC_PATHS } from './lib/auth-constants'

/**
 * Static file extensions to skip (files served from public/)
 */
const STATIC_FILE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.css',
  '.js',
  '.json',
  '.xml',
  '.txt',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
]

/**
 * Static file patterns to skip middleware
 */
const SKIP_PATTERNS = [
  '/_next',
  '/favicon.ico',
  '/api', // Skip API routes (handled by API itself)
  '/.well-known',
]

/**
 * Check if a path should skip middleware
 */
function shouldSkipMiddleware(pathname: string): boolean {
  // Skip known patterns
  if (SKIP_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
    return true
  }
  // Skip static files (from public/ folder)
  if (STATIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return true
  }
  return false
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

  // Skip middleware for static files and API routes
  if (shouldSkipMiddleware(pathname)) {
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

  // Token exists - allow the request
  // Note: Token validity is checked client-side by getCurrentUser()
  // The middleware only checks for token presence for performance
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
