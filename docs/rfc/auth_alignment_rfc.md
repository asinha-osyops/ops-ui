# Auth Integration Alignment RFC

**Date:** 2026-01-10
**Status:** Implemented

## Summary

Aligned the frontend authentication implementation with the backend OpenAPI specification and frontend-auth-guide.md documentation. This update adds missing type fields, implements user management endpoints, connects the admin users page to real APIs, and adds a change password flow.

## What Was Implemented

### 1. Type Definitions (`lib/types/auth.ts`)

Added missing fields and new types to align with OpenAPI spec:

- **LoginResponse**: Added `expiresAt: string` for token expiration tracking
- **AuthUser**: Added `enabled?: boolean` and `createdAt?: string` fields
- **AuthState**: Added `expiresAt: string | null` field
- **New Types**:
  - `UserDto` - Full user data from API
  - `CreateUserRequest` - Admin user creation
  - `UpdateUserRequest` - Admin user updates
  - `ChangePasswordRequest` - Password change payload

### 2. Auth Constants (`lib/auth-constants.ts`)

Added new endpoint constants:

- `AUTH_STORAGE_KEYS.EXPIRES_AT` - localStorage key for token expiration
- `AUTH_ENDPOINTS.CHANGE_PASSWORD` - `/api/auth/me/password`
- `AUTH_ENDPOINTS.USERS` - `/api/auth/users`

### 3. API Client (`lib/api-client.ts`)

Added 7 new methods:

| Method             | Endpoint                    | Purpose                        |
| ------------------ | --------------------------- | ------------------------------ |
| `changePassword()` | PUT /api/auth/me/password   | Change current user's password |
| `getUsers()`       | GET /api/auth/users         | List all users (admin)         |
| `getUserById()`    | GET /api/auth/users/{id}    | Get user by ID (admin)         |
| `createUser()`     | POST /api/auth/users        | Create new user (admin)        |
| `updateUser()`     | PUT /api/auth/users/{id}    | Update user (admin)            |
| `deleteUser()`     | DELETE /api/auth/users/{id} | Delete user (admin)            |

### 4. Auth Context (`lib/auth-context.tsx`)

- Added `expiresAt` to auth state
- Store `expiresAt` in localStorage on login
- Read `expiresAt` from localStorage on init
- Clear `expiresAt` from localStorage on logout/auth failure

### 5. Admin Users Page (`app/(protected)/admin/users/page.tsx`)

Complete rewrite from mock data to full API integration:

- Fetch users list from API on mount
- Create user dialog with React Hook Form + Zod validation
- Edit user dialog with password update option
- Delete user with confirmation dialog
- Toggle user enabled/disabled status with switch
- Refresh button to reload users
- Loading states and error handling
- Toast notifications for all operations

### 6. Change Password Modal (`components/auth/ChangePasswordModal.tsx`)

New component with:

- Current password input with visibility toggle
- New password input (min 8 chars) with visibility toggle
- Confirm password input with match validation
- Form validation using React Hook Form + Zod
- Auto-logout after successful password change
- Toast notification on success/error

### 7. Sidebar Integration (`components/app-sidebar.tsx`)

- Added "Change Password" button in expanded user menu
- Opens ChangePasswordModal on click
- Uses KeyRound icon from lucide-react

## Key Files Changed

| File                                      | Changes                          |
| ----------------------------------------- | -------------------------------- |
| `lib/types/auth.ts`                       | +50 lines (new types and fields) |
| `lib/auth-constants.ts`                   | +3 lines (new constants)         |
| `lib/api-client.ts`                       | +100 lines (7 new methods)       |
| `lib/auth-context.tsx`                    | +10 lines (expiresAt handling)   |
| `lib/app-context.tsx`                     | Fixed to use singleton apiClient |
| `app/(protected)/admin/users/page.tsx`    | Complete rewrite (~570 lines)    |
| `components/auth/ChangePasswordModal.tsx` | New file (~190 lines)            |
| `components/app-sidebar.tsx`              | +20 lines (modal integration)    |

## Bug Fix: APIClient Singleton

**Problem**: `AppContext` was creating its own `APIClient` instance via `useMemo(() => new APIClient(), [])`, which was separate from the singleton `apiClient` exported from `api-client.ts`. When auth-context called `apiClient.setAuthToken()`, it set the token on the singleton, but AppContext used its own instance which never had the token.

**Fix**: Changed `app-context.tsx` to import the singleton `apiClient` instead of creating a new instance. Now all API calls share the same authenticated client.

## Bug Fix: FormData Requests Missing Auth Headers

**Problem**: FormData-based API methods (`createSopWithFile`, `uploadSopFile`, `createLogWithFile`, `uploadLogFile`) were not including the `Authorization` header. The comment said "don't set Content-Type" but the fix accidentally omitted ALL headers.

**Fix**: Added `getFormDataAuthHeaders()` helper method that returns auth headers WITHOUT Content-Type (browser must set Content-Type with multipart boundary). Updated all 4 FormData methods to use this helper.

## Design Decisions

1. **Token Expiration**: Storing `expiresAt` in localStorage and state but not implementing proactive warnings. The existing 401 handling redirects to login on expiry.

2. **Change Password Location**: Added to sidebar user menu as a modal rather than a Settings page section. This keeps it accessible from anywhere in the app.

3. **Password Change Flow**: Automatically logs out user after successful password change since the token is invalidated server-side.

4. **Admin Users Page**: Full CRUD with inline enable/disable toggle for quick status changes without opening dialogs.

5. **Form Validation**: Using Zod schemas consistent with the rest of the codebase for all forms.

## Testing Performed

1. **Build Verification**: `npm run build` succeeds with no TypeScript errors
2. **Type Checking**: All new types align with OpenAPI spec

## Manual Testing Checklist

- [ ] Login flow captures and stores `expiresAt`
- [ ] Admin users page loads and displays users from API
- [ ] Create user flow works end-to-end
- [ ] Edit user dialog updates user correctly
- [ ] Delete user with confirmation works
- [ ] Enable/disable toggle updates user status
- [ ] Change password modal opens from sidebar
- [ ] Change password redirects to login after success
- [ ] 401 errors still redirect to login correctly

## Future Improvements

Per `docs/ideas/future_auth_improvements.md`:

- Token refresh mechanism (proactive renewal)
- httpOnly cookie storage (XSS protection)
- Complete CSRF protection validation
