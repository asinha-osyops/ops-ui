# JWT Authentication Frontend Implementation RFC

## Overview

Implemented JWT-based authentication for the ops-ui frontend, including login/logout flow, protected routes, landing page migration, and user profile display in the sidebar.

## Implementation Date

January 2026

---

## Key Design Decisions

### Route Structure

- `/` - Public landing page
- `/login` - Login page
- `/home` - Protected dashboard (moved from `/`)
- `/admin/users` - Admin-only user management

### Authentication Flow

- JWT tokens stored in localStorage
- Token included in all API requests via Authorization header
- 401 responses trigger automatic logout and redirect to login
- Auth state managed via React Context

### Route Groups

- `(public)` - No authentication required (landing, login, about, contact)
- `(protected)` - Authentication required (dashboard, SOPs, logs, etc.)

---

## Files Created

### Auth Types

**`lib/types/auth.ts`**

```typescript
export enum UserRole {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string | null
  companyName: string | null
}
```

### Auth Context

**`lib/auth-context.tsx`**

- Provides: `user`, `token`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `isAdmin`
- Persists to localStorage: `ops-ui-auth-token`, `ops-ui-auth-user`
- Initializes from localStorage on mount

### Auth Guard Hook

**`lib/hooks/useRequireAuth.ts`**

- Redirects to `/login` if not authenticated
- Optional `requireAdmin` flag for admin-only pages
- Returns `{ isLoading, isAuthenticated, isAdmin }`

### Route Groups

**`app/(public)/layout.tsx`**

- Header with logo, Login button, theme toggle
- Footer with copyright
- No sidebar

**`app/(protected)/layout.tsx`**

- Requires authentication via `useRequireAuth()`
- Wraps with `AppProvider`, `SidebarProvider`
- Shows loading state while checking auth

### Pages

**`app/(public)/login/page.tsx`**

- Email/password form with React Hook Form + Zod validation
- Handles expired session query param
- Redirects to `/home` on success

**`app/(public)/page.tsx`**

- Landing page with hero, features, contact form

**`app/(protected)/home/page.tsx`**

- Dashboard (moved from root `/`)

**`app/(protected)/admin/users/page.tsx`**

- Admin-only user management
- Uses `useRequireAuth({ requireAdmin: true })`

### Landing Page Components

Copied from ops-ui-landing-tmp:

- `components/landing/hero-section.tsx`
- `components/landing/features-section.tsx`
- `components/landing/contact-form.tsx`
- `components/landing/divider-shapes.tsx`
- `components/landing/hero-curve.tsx`
- `components/landing/screenshot-placeholder.tsx`
- `components/landing/logo.tsx`
- `hooks/use-scroll-fade.ts`
- `lib/landing/constants.ts`

---

## Files Modified

### API Client

**`lib/api-client.ts`**

- Added `authToken` field and management methods
- Added `login()` and `getCurrentUser()` methods
- All API methods now include auth token in headers

```typescript
private authToken: string | null = null;

setAuthToken(token: string | null): void { ... }
clearAuthToken(): void { ... }
getAuthToken(): string | null { ... }

private getAuthHeaders(): Record<string, string> {
  const headers = { 'Content-Type': 'application/json' };
  if (this.authToken) {
    headers['Authorization'] = `Bearer ${this.authToken}`;
  }
  return headers;
}
```

**`lib/api-client-helpers.ts`**

- Added 401 response handling
- Clears auth storage and redirects to `/login?expired=true`

### Routes

**`lib/routes.ts`**

```typescript
export const Route = {
  LANDING: '/',
  LOGIN: '/login',
  HOME: '/home',
  // ... existing routes
  ADMIN_USERS: '/admin/users',
}
```

### Root Layout

**`app/layout.tsx`**

- Simplified to just fonts, theme, and `AuthProvider`
- Removed `SidebarProvider`, `AppProvider`, `AppSidebar` (moved to protected layout)

### Sidebar

**`components/app-sidebar.tsx`**

- Added user profile section in footer
- Shows user name, email, and role badge
- Admin link (visible only for admins)
- Logout button

### Button Component

**`components/ui/button.tsx`**

- Added `cta` variant for landing page buttons

### App Context

**`lib/app-context.tsx`**

- Modified `useAppContext` to return default values during SSR
- Prevents build failures when context is accessed outside provider

### Styles

**`app/globals.css`**

- Added landing page styles (hero, dividers, orange theme)
- Added CSS variables for bento layout

---

## Build Configuration

### Next.js Config

**`next.config.js`**

- Added `output: 'standalone'` for deployment

### Dynamic Rendering

All pages now have `export const dynamic = 'force-dynamic'` to prevent static generation issues with authentication.

---

## Authentication Flow

### Login

1. User submits email/password on `/login`
2. `useAuth().login()` calls `apiClient.login()`
3. Token stored in localStorage and API client
4. User redirected to `/home`

### Page Load

1. `AuthProvider` initializes from localStorage
2. `useRequireAuth()` checks auth state
3. If not authenticated, redirect to `/login`
4. If authenticated, render protected content

### Logout

1. User clicks Logout in sidebar
2. `useAuth().logout()` clears storage and API client
3. User redirected to `/login`

### Token Expiry

1. API returns 401 Unauthorized
2. `handleUnauthorized()` clears storage
3. User redirected to `/login?expired=true`

---

## Testing

### Manual Tests

1. Visit `/` - see landing page (no auth required)
2. Click Login - redirected to `/login`
3. Submit valid credentials - redirected to `/home`
4. Navigate protected routes - all work
5. Admin: Visit `/admin/users` - see user management
6. Non-admin: Visit `/admin/users` - redirected to `/home`
7. Click Logout - redirected to `/login`
8. Try accessing protected route - redirected to `/login`

### Build Verification

```bash
npm run build
# Should complete successfully with mix of static and dynamic routes
```

---

## Route Summary

| Route          | Group     | Auth Required | Admin Required |
| -------------- | --------- | ------------- | -------------- |
| `/`            | public    | No            | No             |
| `/login`       | public    | No            | No             |
| `/about`       | public    | No            | No             |
| `/contact`     | public    | No            | No             |
| `/home`        | protected | Yes           | No             |
| `/sop/**`      | protected | Yes           | No             |
| `/log/**`      | protected | Yes           | No             |
| `/org`         | protected | Yes           | No             |
| `/analysis`    | protected | Yes           | No             |
| `/settings`    | protected | Yes           | No             |
| `/admin/users` | protected | Yes           | Yes            |

---

## localStorage Keys

| Key                          | Description                        |
| ---------------------------- | ---------------------------------- |
| `ops-ui-auth-token`          | JWT token                          |
| `ops-ui-auth-user`           | Serialized user object             |
| `ops-ui-selected-company-id` | Selected company ID (existing)     |
| `ops-ui-selected-company`    | Selected company object (existing) |
