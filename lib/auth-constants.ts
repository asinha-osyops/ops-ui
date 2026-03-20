/**
 * Centralized authentication constants
 * Single source of truth for auth-related keys, endpoints, and headers
 */

/**
 * localStorage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'ops-ui-auth-token',
  USER: 'ops-ui-auth-user',
  CSRF_TOKEN: 'ops-ui-csrf-token',
  EXPIRES_AT: 'ops-ui-token-expires',
  REFRESH_TOKEN: 'ops-ui-refresh-token',
  REFRESH_EXPIRES_AT: 'ops-ui-refresh-expires',
} as const

/**
 * Cookie name for auth token (used by middleware)
 */
export const AUTH_COOKIE_NAME = 'ops-ui-auth-token'

/**
 * API endpoints for authentication
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  CSRF: '/api/auth/csrf',
  REFRESH: '/api/auth/refresh',
  CHANGE_PASSWORD: '/api/auth/me/password',
  USERS: '/api/auth/users',
} as const

/**
 * HTTP headers for authentication
 */
export const AUTH_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CSRF_TOKEN: 'X-CSRF-Token',
} as const

/**
 * Auth-related query parameters
 */
export const AUTH_QUERY_PARAMS = {
  EXPIRED: 'expired',
  REDIRECT: 'redirect',
} as const

/**
 * Public paths that don't require authentication
 */
export const PUBLIC_PATHS = ['/', '/login', '/about', '/contact'] as const

/**
 * Auth error messages for user display
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  CSRF_INVALID: 'Security token expired. Please refresh the page.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  LOGOUT_FAILED: 'Failed to log out. Please try again.',
} as const
