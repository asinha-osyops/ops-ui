# Frontend Authentication Guide

This guide explains how authentication is configured for the ops-api and how frontend applications should integrate with it.

## Overview

The API uses **JWT (JSON Web Token)** based authentication with Bearer tokens. All requests to protected endpoints must include a valid JWT token in the `Authorization` header.

## Authentication Flow

```
┌─────────────┐     POST /api/auth/login      ┌─────────────┐
│   Frontend  │  ─────────────────────────►   │   Backend   │
│             │   {email, password}           │             │
│             │                               │             │
│             │   ◄─────────────────────────  │             │
│             │   {token, expiresAt, ...}     │             │
└─────────────┘                               └─────────────┘
       │
       │  Store token (memory/localStorage)
       ▼
┌─────────────┐     GET /api/company          ┌─────────────┐
│   Frontend  │  ─────────────────────────►   │   Backend   │
│             │   Authorization: Bearer <token>│             │
└─────────────┘                               └─────────────┘
```

## Endpoints

### Public Endpoints (No Authentication Required)

| Endpoint          | Method | Description                    |
| ----------------- | ------ | ------------------------------ |
| `/api/auth/login` | POST   | Authenticate and get JWT token |
| `/api/auth/csrf`  | GET    | Get CSRF token (optional)      |
| `/api/health`     | GET    | Health check                   |
| `/swagger-ui/**`  | GET    | API documentation              |
| `/v3/api-docs/**` | GET    | OpenAPI spec                   |

### Protected Endpoints (Authentication Required)

All `/api/**` endpoints except those listed above require authentication.

### Admin-Only Endpoints

| Endpoint             | Method | Description     |
| -------------------- | ------ | --------------- |
| `/api/auth/users/**` | ALL    | User management |
| `/api/company`       | POST   | Create company  |
| `/api/company/{id}`  | PUT    | Update company  |
| `/api/company/{id}`  | DELETE | Delete company  |

## Login

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response (Success - 200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-01-11T05:30:00Z",
  "email": "user@example.com",
  "name": "User Name",
  "role": "VIEWER",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Acme Corp"
}
```

### Response (Failure - 401)

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid email or password",
  "timestamp": "2026-01-10T05:30:00Z",
  "path": "/api/auth/login"
}
```

## Using the Token

Include the token in all requests to protected endpoints:

```http
GET /api/company
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JavaScript/Fetch Example

```javascript
const token = localStorage.getItem('authToken')

const response = await fetch('http://localhost:8080/api/company', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### Axios Example

```javascript
// Set up axios instance with interceptor
const api = axios.create({
  baseURL: 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## User Roles

| Role     | Description   | Capabilities                                                 |
| -------- | ------------- | ------------------------------------------------------------ |
| `ADMIN`  | Administrator | Full access to all endpoints, all companies, user management |
| `VIEWER` | Regular user  | Access scoped to assigned company only                       |

### Role-Based Access

- **ADMIN users**: Can access all companies and manage users
- **VIEWER users**: Can only access resources belonging to their assigned company

## Token Details

### JWT Claims

The JWT token contains:

| Claim         | Description                             |
| ------------- | --------------------------------------- |
| `userId`      | User's UUID                             |
| `email`       | User's email                            |
| `name`        | User's display name                     |
| `role`        | User role (ADMIN or VIEWER)             |
| `companyId`   | Assigned company UUID (null for admins) |
| `companyName` | Assigned company name (null for admins) |

### Token Expiration

- Default expiration: Configured via `JWT_EXPIRATION_HOURS` (default: 12 hours)
- The `expiresAt` field in the login response indicates when the token expires
- Frontends should handle token expiration gracefully (redirect to login)

### Token Invalidation

Tokens can be invalidated when:

- User changes their password
- Admin disables the user account
- User is deleted

## Error Responses

### 401 Unauthorized

Returned when:

- No token provided
- Token is invalid or malformed
- Token has expired
- Token was invalidated (password changed, account disabled)

```json
{
  "error": "UNAUTHORIZED",
  "message": "Full authentication is required to access this resource",
  "timestamp": "2026-01-10T05:30:00Z",
  "path": "/api/company"
}
```

### 403 Forbidden

Returned when:

- User doesn't have required role (e.g., VIEWER accessing admin endpoints)
- User trying to access another company's resources

```json
{
  "error": "FORBIDDEN",
  "message": "Access denied",
  "timestamp": "2026-01-10T05:30:00Z",
  "path": "/api/auth/users"
}
```

## CORS Configuration

The API is configured to allow cross-origin requests from frontend applications.

### Default Configuration

| Setting           | Value                                  |
| ----------------- | -------------------------------------- |
| Allowed Origins   | `http://localhost:3000` (configurable) |
| Allowed Methods   | GET, POST, PUT, DELETE, OPTIONS        |
| Allowed Headers   | All (`*`)                              |
| Exposed Headers   | `Authorization`                        |
| Allow Credentials | `true`                                 |

### Configuring Allowed Origins

Set via environment variable:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://app.example.com
```

## Current User

### Get Current User Info

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "User Name",
  "role": "VIEWER",
  "companyId": "660e8400-e29b-41d4-a716-446655440000",
  "companyName": "Acme Corp",
  "enabled": true
}
```

### Change Password

```http
PUT /api/auth/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

Response: `204 No Content`

**Note:** After changing password, the current token is invalidated. The user must log in again.

## Best Practices for Frontends

### Token Storage

| Method            | Pros                     | Cons                     |
| ----------------- | ------------------------ | ------------------------ |
| Memory (variable) | Most secure, no XSS risk | Lost on page refresh     |
| localStorage      | Persists across sessions | Vulnerable to XSS        |
| httpOnly cookie   | Protected from XSS       | Requires backend changes |

**Recommendation:** Use memory storage for high-security apps, localStorage for convenience with proper XSS protections.

### Token Refresh Strategy

Since tokens expire, implement one of these strategies:

1. **Proactive refresh**: Check `expiresAt` and refresh before expiration
2. **Reactive refresh**: On 401 response, redirect to login
3. **Silent refresh**: Implement a refresh token flow (not currently supported)

### Handling 401 Responses

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored token
      localStorage.removeItem('authToken')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Logout

To log out, simply:

1. Clear the stored token
2. Redirect to login page

There is no server-side logout endpoint needed since JWTs are stateless.

## Example: Complete Login Flow

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  const data = await response.json()

  // Store token and user info
  localStorage.setItem('authToken', data.token)
  localStorage.setItem('tokenExpires', data.expiresAt)
  localStorage.setItem('userRole', data.role)
  localStorage.setItem('userName', data.name)

  return data
}

// Check if token is expired
function isTokenExpired() {
  const expires = localStorage.getItem('tokenExpires')
  if (!expires) return true
  return new Date(expires) <= new Date()
}

// Logout function
function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('tokenExpires')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  window.location.href = '/login'
}
```

## Troubleshooting

| Issue                     | Cause                            | Solution                             |
| ------------------------- | -------------------------------- | ------------------------------------ |
| 401 on all requests       | Missing or invalid token         | Check Authorization header format    |
| 403 on admin endpoints    | User is VIEWER, not ADMIN        | Use admin account                    |
| CORS errors               | Origin not allowed               | Add origin to `CORS_ALLOWED_ORIGINS` |
| Token expired immediately | Clock skew between client/server | Sync system clocks                   |
| "Account disabled" error  | Admin disabled the account       | Contact admin                        |
