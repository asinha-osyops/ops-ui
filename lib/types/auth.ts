/**
 * User roles for authorization
 */
export enum UserRole {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
}

/**
 * Authentication error codes for typed error handling
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CSRF_INVALID = 'CSRF_INVALID',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

/**
 * Custom error class for authentication errors
 * Provides typed error codes for better error handling
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AuthError'
    // Maintains proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError)
    }
  }

  /**
   * Check if an error is an AuthError
   */
  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError
  }

  /**
   * Create an AuthError from an HTTP status code
   */
  static fromStatusCode(statusCode: number, message?: string): AuthError {
    switch (statusCode) {
      case 401:
        return new AuthError(
          AuthErrorCode.UNAUTHORIZED,
          message || 'Unauthorized',
          statusCode
        )
      case 403:
        return new AuthError(
          AuthErrorCode.UNAUTHORIZED,
          message || 'Forbidden',
          statusCode
        )
      default:
        return new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          message || `HTTP error ${statusCode}`,
          statusCode
        )
    }
  }
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string | null
  companyName: string | null
  enabled?: boolean
  createdAt?: string
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Login response from API
 */
export interface LoginResponse {
  token: string
  expiresAt: string
  email: string
  name: string
  role: UserRole
  companyId: string | null
  companyName: string | null
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string
  /** Expiration time of the refresh token (ISO-8601) */
  refreshTokenExpiresAt?: string
}

/**
 * Request to refresh an access token
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Response from token refresh
 */
export interface RefreshTokenResponse {
  token: string
  expiresAt: string
  refreshToken?: string
  refreshTokenExpiresAt?: string
}

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null
  token: string | null
  expiresAt: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Full user DTO from API (includes all fields)
 */
export interface UserDto {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string | null
  companyName: string | null
  enabled: boolean
  createdAt: string
}

/**
 * Request to create a new user (admin only)
 */
export interface CreateUserRequest {
  email: string
  password: string
  name: string
  role: UserRole
  companyId?: string
}

/**
 * Request to update a user (admin only)
 */
export interface UpdateUserRequest {
  name?: string
  password?: string
  role?: UserRole
  enabled?: boolean
}

/**
 * Request to change current user's password
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
