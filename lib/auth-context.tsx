'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from './api-client'
import {
  AUTH_STORAGE_KEYS,
  AUTH_COOKIE_NAME,
  AUTH_QUERY_PARAMS,
} from './auth-constants'
import { Route } from './routes'
import { clearAuthCookie } from './api-client-helpers'
import {
  UserRole,
  type AuthUser,
  type AuthState,
  type LoginRequest,
  type LoginResponse,
} from './types/auth'

// Refresh token 1 minute before expiry
const REFRESH_BUFFER_MS = 60 * 1000

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Parse user data from login response
 */
function parseUserFromResponse(response: LoginResponse): AuthUser {
  return {
    id: '', // ID not returned from login response
    email: response.email,
    name: response.name,
    role: response.role,
    companyId: response.companyId,
    companyName: response.companyName,
  }
}

/**
 * Set auth cookie for middleware to read
 * Cookie is httpOnly-like (not actually httpOnly since we set it client-side)
 * but provides server-side access for middleware checks
 */
function setAuthCookie(token: string): void {
  // Set cookie with SameSite=Lax for security, path=/ for all routes
  // No expiry set - will be a session cookie that expires when browser closes
  // This matches the localStorage behavior
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; SameSite=Lax`
}

/**
 * Clear all auth storage (localStorage + cookie)
 */
function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
  localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT)
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT)
  clearAuthCookie()
}

/**
 * Calculate time until token expiry in milliseconds
 * Returns 0 if already expired or invalid
 */
function getTimeUntilExpiry(expiresAt: string | null): number {
  if (!expiresAt) return 0
  const expiryTime = new Date(expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, expiryTime - now)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Track if we're currently validating to prevent double-validation
  const isValidating = useRef(false)
  // Track refresh timer
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Clear any existing refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  /**
   * Attempt to refresh the access token
   * On failure: silently redirect to login with expired flag
   */
  const attemptTokenRefresh = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(
      AUTH_STORAGE_KEYS.REFRESH_TOKEN
    )

    if (!storedRefreshToken) {
      // No refresh token available - redirect to login
      console.warn('No refresh token available, redirecting to login')
      clearAuthStorage()
      apiClient.clearAuthToken()
      router.push(`${Route.LOGIN}?${AUTH_QUERY_PARAMS.EXPIRED}=true`)
      return
    }

    try {
      const response = await apiClient.refreshToken(storedRefreshToken)

      // Update stored tokens
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.token)
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, response.expiresAt)
      setAuthCookie(response.token)

      // Update refresh token if a new one was provided (token rotation)
      if (response.refreshToken) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          response.refreshToken
        )
      }
      if (response.refreshTokenExpiresAt) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT,
          response.refreshTokenExpiresAt
        )
      }

      // Update state with new token
      setState((prev) => ({
        ...prev,
        token: response.token,
        expiresAt: response.expiresAt,
      }))

      // Schedule next refresh
      const timeUntilExpiry = getTimeUntilExpiry(response.expiresAt)
      if (timeUntilExpiry > REFRESH_BUFFER_MS) {
        refreshTimerRef.current = setTimeout(
          attemptTokenRefresh,
          timeUntilExpiry - REFRESH_BUFFER_MS
        )
      }
    } catch (error) {
      // Refresh failed - silently redirect to login
      console.warn('Token refresh failed, redirecting to login:', error)
      clearAuthStorage()
      apiClient.clearAuthToken()
      setState({
        user: null,
        token: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
      })
      router.push(`${Route.LOGIN}?${AUTH_QUERY_PARAMS.EXPIRED}=true`)
    }
  }, [router])

  /**
   * Schedule token refresh based on expiry time
   */
  const scheduleTokenRefresh = useCallback(
    (expiresAt: string | null) => {
      clearRefreshTimer()

      const timeUntilExpiry = getTimeUntilExpiry(expiresAt)

      // Only schedule if we have time before expiry (accounting for buffer)
      if (timeUntilExpiry > REFRESH_BUFFER_MS) {
        refreshTimerRef.current = setTimeout(
          attemptTokenRefresh,
          timeUntilExpiry - REFRESH_BUFFER_MS
        )
      } else if (timeUntilExpiry > 0) {
        // Token expires soon but not yet - refresh immediately
        attemptTokenRefresh()
      }
      // If timeUntilExpiry is 0, token is already expired - let normal auth flow handle it
    },
    [clearRefreshTimer, attemptTokenRefresh]
  )

  // Initialize and validate auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent double validation
      if (isValidating.current) return
      isValidating.current = true

      try {
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)

        if (!storedToken) {
          setState((prev) => ({ ...prev, isLoading: false }))
          isValidating.current = false
          return
        }

        // Set token on API client for the validation request
        apiClient.setAuthToken(storedToken)

        // Validate token by calling getCurrentUser
        const currentUser = await apiClient.getCurrentUser()

        if (currentUser) {
          // Token is valid - update state with fresh user data
          const user = parseUserFromResponse(currentUser)
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user))
          setAuthCookie(storedToken)

          // Read stored expiresAt (set during login)
          const storedExpiresAt = localStorage.getItem(
            AUTH_STORAGE_KEYS.EXPIRES_AT
          )

          // Fetch CSRF token for authenticated session
          await apiClient.fetchCsrfToken()

          // Schedule token refresh if we have a refresh token
          const hasRefreshToken = localStorage.getItem(
            AUTH_STORAGE_KEYS.REFRESH_TOKEN
          )
          if (hasRefreshToken && storedExpiresAt) {
            scheduleTokenRefresh(storedExpiresAt)
          }

          setState({
            user,
            token: storedToken,
            expiresAt: storedExpiresAt,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          // Token is invalid - clear storage
          console.warn('Stored token is invalid, clearing auth state')
          clearAuthStorage()
          apiClient.clearAuthToken()
          setState({
            user: null,
            token: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear potentially corrupted data
        clearAuthStorage()
        apiClient.clearAuthToken()
        setState({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        })
      } finally {
        isValidating.current = false
      }
    }

    initializeAuth()
  }, [])

  // Multi-tab sync: Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only handle auth token changes
      if (event.key !== AUTH_STORAGE_KEYS.TOKEN) return

      if (!event.newValue) {
        // Token was removed in another tab - log out this tab
        clearRefreshTimer()
        apiClient.clearAuthToken()
        clearAuthCookie()
        setState({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        })
      } else if (event.newValue !== state.token) {
        // Token changed in another tab - reload to sync
        // This handles both login and token refresh scenarios
        window.location.reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [state.token, clearRefreshTimer])

  // Cleanup refresh timer on unmount
  useEffect(() => {
    return () => {
      clearRefreshTimer()
    }
  }, [clearRefreshTimer])

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await apiClient.login(request)
      const user = parseUserFromResponse(response)

      // Store in localStorage and cookie
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.token)
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user))
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, response.expiresAt)
      setAuthCookie(response.token)

      // Store refresh token if provided
      if (response.refreshToken) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          response.refreshToken
        )
      }
      if (response.refreshTokenExpiresAt) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.REFRESH_EXPIRES_AT,
          response.refreshTokenExpiresAt
        )
      }

      // Fetch CSRF token for the new session
      await apiClient.fetchCsrfToken()

      // Schedule token refresh if we have a refresh token
      if (response.refreshToken) {
        scheduleTokenRefresh(response.expiresAt)
      }

      setState({
        user,
        token: response.token,
        expiresAt: response.expiresAt,
        isAuthenticated: true,
        isLoading: false,
      })
    },
    [scheduleTokenRefresh]
  )

  const logout = useCallback(async () => {
    // Clear refresh timer
    clearRefreshTimer()

    // Call logout API to invalidate server-side session
    try {
      await apiClient.logout()
    } catch (error) {
      // Continue with client-side logout even if server call fails
      console.warn(
        'Server logout failed, continuing with client logout:',
        error
      )
    }

    // Clear storage and cookie
    clearAuthStorage()

    // Clear API client token
    apiClient.clearAuthToken()

    // Reset state
    setState({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [clearRefreshTimer])

  // Use proper enum comparison instead of string
  const isAdmin = state.user?.role === UserRole.ADMIN

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
