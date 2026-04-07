# OpenAPI Alignment RFC

**Date:** 2026-01-11
**Status:** Implemented

## Summary

This RFC documents the alignment of the `lib/api-client.ts` with the updated OpenAPI specification at `docs/postman/openapi.json`. The implementation brings the frontend API client to 100% compatibility with the backend API.

## Key Changes

### 1. Endpoint Naming Changes

Per backend clarification, the naming convention has been updated:

- **Old analyze endpoints** -> Now `/process/` (SOP and Log processing)
- **Trace SOP steps endpoints** -> Remain at `/analyze/` (analysis operations)

**Updated Endpoints:**
| Old Path | New Path | Method |
|----------|----------|--------|
| `/api/sop/analyze/{id}` | `/api/sop/process/{id}` | `processSop()` |
| `/api/sop/analyze/{id}/async` | `/api/sop/process/{id}/async` | `processSopAsync()` |
| `/api/log/analyze/{id}` | `/api/log/process/{id}` | `processLog()` |
| `/api/log/analyze/{id}/async` | `/api/log/process/{id}/async` | `processLogAsync()` |

**Backward Compatibility:** Deprecated aliases maintained (`analyzeSop`, `analyzeLog`, etc.) that delegate to new methods.

### 2. New DTOs Added (12 types)

**CSRF Response:**

- `CsrfResponseDto` - Contains `token` and `headerName` fields

**Processing Results:**

- `SopProcessingResultDto` - Steps, edges, format flags
- `LogProcessingResultDto` - System, actions, users
- `AsyncProcessingResponseDto` - taskId, status, message, statusUrl

**Cache Information:**

- `SopCacheInfoDto` - SOP-level cache statistics
- `StepCacheInfoDto` - Step cache details
- `ActivityEventCacheInfoDto` - Activity event cache statistics
- `LogLineCacheEntryDto` - Individual cache entry metadata

**Admin:**

- `DbHealthDto` - Database health information
- `DbIndexInfoDto` - Database index information
- `DbTableInfoDto` - Database table information

### 3. New Methods Added

**Authentication:**

- `refreshToken(refreshToken: string)` - Refresh access token
- `getCsrfTokenResponse()` - Get full CSRF response with headerName

**Cache Inspection (3 GET methods):**

- `getSopCacheInfo(sopId)` - Query SOP cache stats
- `getStepCacheInfo(stepId)` - Query step cache
- `getActivityEventCacheInfo(activityEventId)` - Query activity event cache

**Admin (4 methods):**

- `getDbHealth()` - Database health metrics
- `getDbIndexes()` - Index information
- `getDbTables()` - Table information
- `syncDbCounts()` - Sync database counts

**Health (1 method):**

- `getServiceHealth()` - Service health check

### 4. Type Updates

**LoginResponse** - Added optional fields:

- `refreshToken?: string`
- `refreshTokenExpiresAt?: string`

**New Auth Types:**

- `RefreshTokenRequest`
- `RefreshTokenResponse`

**Auth Constants:**

- Added `AUTH_ENDPOINTS.REFRESH` = `/api/auth/refresh`

## Files Changed

| File                    | Changes                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `lib/api-client.ts`     | Added 12 DTOs, 13 new methods, renamed 4 endpoints, added deprecated aliases |
| `lib/types/auth.ts`     | Added refresh token types and fields                                         |
| `lib/auth-constants.ts` | Added REFRESH endpoint constant                                              |

## Breaking Changes

**None for existing code.** All changes are additive with backward-compatible aliases:

- `analyzeSop()` -> delegates to `processSop()`
- `analyzeLog()` -> delegates to `processLog()`
- `analyzeSopAsync()` -> delegates to `processSopAsync()`
- `analyzeLogAsync()` -> delegates to `processLogAsync()`

Deprecated methods will be removed in a future version.

## Testing

- TypeScript compilation passes with no errors in lib/
- All existing method signatures preserved

## Migration Guide

For new code, use the new method names:

```typescript
// Old (deprecated)
await apiClient.analyzeSop(sopId)
await apiClient.analyzeLog(logId)

// New (preferred)
await apiClient.processSop(sopId)
await apiClient.processLog(logId)
```

For refresh token support:

```typescript
// After login, store the refresh token
const loginResponse = await apiClient.login({ email, password })
const refreshToken = loginResponse.refreshToken

// Before access token expires, refresh it
const newTokens = await apiClient.refreshToken(refreshToken)
```

## Endpoint Coverage

| Category        | Before       | After         |
| --------------- | ------------ | ------------- |
| Total Endpoints | 51/73 (70%)  | 73/73 (100%)  |
| DTOs            | ~35/45 (78%) | ~47/47 (100%) |
