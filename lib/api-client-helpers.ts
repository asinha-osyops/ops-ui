import { Route } from './routes'
import {
  AUTH_STORAGE_KEYS,
  AUTH_QUERY_PARAMS,
  AUTH_COOKIE_NAME,
} from './auth-constants'

// Generic request options
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string | FormData
}

/**
 * Clear auth cookie by setting it to expire immediately
 */
export function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

/**
 * Handle 401 unauthorized responses
 * Clears auth storage and redirects to login with expired flag
 */
function handleUnauthorized(): void {
  // Only run in browser
  if (typeof window === 'undefined') return

  // Clear auth from storage
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN)
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
  clearAuthCookie()

  // Redirect to login with expired flag
  const currentPath = window.location.pathname
  if (currentPath !== Route.LOGIN) {
    window.location.href = `${Route.LOGIN}?${AUTH_QUERY_PARAMS.EXPIRED}=true`
  }
}

// Generic response handler
export async function handleResponse<T>(
  response: Response,
  errorContext: string
): Promise<T | null> {
  if (response.status === 401) {
    handleUnauthorized()
    throw new Error('Session expired. Please log in again.')
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  const hasJsonContent = contentType && contentType.includes('application/json')

  if (!hasJsonContent) {
    return null
  }

  const text = await response.text()
  if (!text || text.length === 0) {
    return null
  }

  return JSON.parse(text)
}

// Generic error handler
export function handleError(
  error: unknown,
  context: string
): { success: false; message: string } {
  console.error(`Error ${context}:`, error)
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
  }
}

// Generic API request wrapper with success response
export async function makeRequest<T extends { success: boolean }>(
  url: string,
  options: RequestOptions,
  errorContext: string
): Promise<T> {
  try {
    const response = await fetch(url, options)
    const data = await handleResponse<Omit<T, 'success'>>(
      response,
      errorContext
    )
    return {
      success: true,
      ...(data || {}),
    } as T
  } catch (error) {
    return handleError(error, errorContext) as unknown as T
  }
}

// Simpler request wrapper for array responses
export async function makeArrayRequest<T>(
  url: string,
  options: RequestOptions,
  errorContext: string,
  config?: { throwOnError?: boolean }
): Promise<T[]> {
  try {
    const response = await fetch(url, options)
    if (response.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Handle empty responses gracefully
    const text = await response.text()
    if (!text || text.length === 0) {
      return []
    }

    const parsed = JSON.parse(text)

    // Handle Spring Boot Page responses (e.g. { content: [...], totalElements: N })
    if (
      !Array.isArray(parsed) &&
      parsed?.content &&
      Array.isArray(parsed.content)
    ) {
      return parsed.content
    }

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`Error ${errorContext}:`, error)
    if (config?.throwOnError) throw error
    return []
  }
}

// Simpler request wrapper for single object responses (nullable)
// `silent: true` skips the console.error on failure — use for best-effort
// endpoints where the caller handles null gracefully and we don't want
// backend outages to fill the Next.js dev overlay with console errors.
export async function makeNullableRequest<T>(
  url: string,
  options: RequestOptions,
  errorContext: string,
  config?: { throwOnError?: boolean; silent?: boolean }
): Promise<T | null> {
  try {
    const response = await fetch(url, options)
    if (response.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Handle empty responses gracefully
    const text = await response.text()
    if (!text || text.length === 0) {
      return null
    }

    return JSON.parse(text)
  } catch (error) {
    if (!config?.silent) {
      console.error(`Error ${errorContext}:`, error)
    }
    if (config?.throwOnError) throw error
    return null
  }
}

// Request wrapper for single object responses (non-nullable)
export async function makeObjectRequest<T>(
  url: string,
  options: RequestOptions,
  errorContext: string
): Promise<T> {
  try {
    const response = await fetch(url, options)
    if (response.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Handle empty responses (204 No Content or empty body)
    const contentType = response.headers.get('content-type')
    const hasJsonContent =
      contentType && contentType.includes('application/json')

    // If no JSON content type, try to read as text first
    const text = await response.text()
    if (!text || text.length === 0) {
      throw new Error('No data returned from server')
    }

    const data = JSON.parse(text)
    if (!data) {
      throw new Error('No data returned from server')
    }
    return data
  } catch (error) {
    console.error(`Error ${errorContext}:`, error)
    throw error
  }
}

// Simple success-only response wrapper
export async function makeSimpleRequest(
  url: string,
  options: RequestOptions,
  errorContext: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(url, options)
    if (response.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return { success: true }
  } catch (error) {
    return handleError(error, errorContext)
  }
}
