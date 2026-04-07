# API Client Integration RFC

**Date:** 2026-01-11
**Status:** Implemented

## Summary

This RFC documents the integration of the updated api-client across the ops-ui codebase, covering deprecated method migration, new UX enhancements, and new features.

## What Was Implemented

### Phase 1: Required Updates (Breaking Changes Migration)

#### 1.1 Deprecated Method Migration

Migrated 2 files from `analyzeLog()` to `processLog()`:

- `app/(protected)/log/[id]/page.tsx` - Line 59
- `app/(protected)/log/LogPageContent.tsx` - Line 44

#### 1.2 Documentation Updates

Updated `docs/howto/sop-dag-frontend-guide.md` to change all references from `/api/sop/analyze/` to `/api/sop/process/`.

### Phase 2: Token Refresh Integration

Implemented automatic token refresh to prevent abrupt logouts when tokens expire.

**Key Files:**

- `lib/auth-constants.ts` - Added `REFRESH_TOKEN` and `REFRESH_EXPIRES_AT` storage keys
- `lib/auth-context.tsx` - Full token refresh implementation

**Features:**

- Stores refresh token from login response
- Schedules automatic refresh 1 minute before token expiry
- On refresh success: updates tokens, resets timer
- On refresh failure: silently redirects to `/login?expired=true`
- Multi-tab synchronization via localStorage events
- Cleanup on logout

### Phase 3: Cache Status Display

#### 3.1 Analysis Page Cache Status

Created `components/analysis/SopCacheStatus.tsx`:

- Collapsible cache info panel
- Shows cached steps, activity events, and log line matches
- Cache invalidation button
- Step-by-step cache breakdown

Integrated into `app/(protected)/analysis/page.tsx` after SOP selector.

### Phase 4: Admin Health Dashboard

Created new admin health monitoring page at `/admin/health`.

**New Files:**

- `app/(protected)/admin/health/page.tsx` - Main health dashboard page
- `components/admin/SystemHealthCard.tsx` - Service health status display
- `components/admin/DatabaseHealthCard.tsx` - Database connection pool stats
- `components/admin/DatabaseTablesPanel.tsx` - Table metrics with row counts
- `components/admin/SystemStatusQuickView.tsx` - Quick status widget for home page

**Features:**

- Service health status (healthy/degraded/unhealthy)
- Database connection pool visualization
- Table row counts and sizes
- Sync counts button
- Auto-refresh on 30s interval

**Access Control:** Admin users only (via `useAuth().isAdmin`)

### Phase 5: Home Page System Status Widget

Integrated `SystemStatusQuickView` into `app/(protected)/home/page.tsx`:

- Only visible to admin users
- Shows API service and database status
- Quick link to full admin health dashboard
- Auto-refreshes every 60 seconds

## Key Files Changed

| File                                     | Changes                           |
| ---------------------------------------- | --------------------------------- |
| `app/(protected)/log/[id]/page.tsx`      | Migrated to `processLog()`        |
| `app/(protected)/log/LogPageContent.tsx` | Migrated to `processLog()`        |
| `docs/howto/sop-dag-frontend-guide.md`   | Updated API paths                 |
| `lib/auth-constants.ts`                  | Added refresh token storage keys  |
| `lib/auth-context.tsx`                   | Full token refresh implementation |
| `lib/routes.ts`                          | Added `ADMIN_HEALTH` route        |
| `app/(protected)/analysis/page.tsx`      | Added cache status component      |
| `app/(protected)/home/page.tsx`          | Added admin system status widget  |

## New Files Created

| File                                         | Purpose                |
| -------------------------------------------- | ---------------------- |
| `components/analysis/SopCacheStatus.tsx`     | SOP cache info display |
| `components/admin/SystemHealthCard.tsx`      | Service health status  |
| `components/admin/DatabaseHealthCard.tsx`    | Database health stats  |
| `components/admin/DatabaseTablesPanel.tsx`   | Table metrics display  |
| `components/admin/SystemStatusQuickView.tsx` | Quick status widget    |
| `app/(protected)/admin/health/page.tsx`      | Admin health dashboard |

## Design Decisions

1. **Token Refresh Strategy**: Proactive refresh 1 minute before expiry rather than reactive refresh on 401 responses. This provides smoother UX without interruptions.

2. **Silent Logout on Refresh Failure**: Rather than showing modals or retrying multiple times, we silently redirect to login with an "expired" flag. This matches the existing auth flow.

3. **Cache Status as Collapsible**: The cache info is shown in a collapsible panel to avoid cluttering the UI while still being accessible.

4. **Admin-Only System Status**: The system status widget on the home page is only shown to admins to avoid confusing regular users with technical details.

5. **Lazy Loading**: Heavy components like cache status and results are lazy-loaded for better performance.

## Testing Performed

- TypeScript compilation passes with no errors
- Deprecated method aliases work for backward compatibility
- Admin routes accessible only by admin users

## Future Considerations

1. **Token Rotation**: The refresh token implementation supports token rotation if the backend returns new refresh tokens.

2. **Cache Invalidation Hooks**: The cache status component supports an `onCacheInvalidated` callback for triggering re-analysis.

3. **Database Index Panel**: A `DatabaseIndexesPanel` component could be added to show detailed index information.

4. **Activity Event Cache Inspector**: The Settings page could be enhanced to show cache info per activity event.
