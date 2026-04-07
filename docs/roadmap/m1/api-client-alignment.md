# API Client Alignment RFC

## What was implemented

Aligned `lib/api-client.ts` with the new OpenAPI specification in `docs/postman/openapi.json`. This update adds new enums, DTOs, and endpoints for enhanced log line querying and activity event management.

### Summary of Changes

| Category        | Count | Description                                                                                                        |
| --------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| New Enums       | 2     | `EventCategory` (30 values), `Platform` (3 values)                                                                 |
| New DTOs        | 4     | `LogLineStatisticsDto`, `CategoryCount`, `ServiceCount`, `UpdateActivityEventEventCategoriesRequestDto`            |
| New API Methods | 8     | 7 log line query methods + 1 activity event method                                                                 |
| Updated DTOs    | 4     | `LogLineEventTypeMappingDto`, `ActivityEventDto`, `CreateActivityEventRequestDto`, `UpdateActivityEventRequestDto` |
| Parameter Fixes | 2     | `getLogLinesByEvent`, `getLogLinesByMultiAttribute`                                                                |

## Key Files Changed

### API Client

- `lib/api-client.ts` - Main changes:
  - Added `EventCategory` enum (30 cross-platform event categories)
  - Added `Platform` enum (GOOGLE, SLACK, MICROSOFT)
  - Updated `LogLineEventTypeMappingDto` from `{logLineType, eventType}` to `{platform, service, event}`
  - Added `associatedEventCategories` field to `ActivityEventDto`
  - Added statistics DTOs for log line analytics
  - Added 7 new log line query methods:
    - `getLogLineStatistics(companyId)`
    - `getLogLinesByPlatform(platform)`
    - `getLogLinesByPlatformAndService(platform, service)`
    - `getLogLinesByService(service)`
    - `getLogLinesByResourceId(resourceId)`
    - `getLogLinesByResourceTitle(resourceTitle)`
    - `getLogLinesByEventCategory(eventCategory)`
  - Added `updateActivityEventEventCategories(id, eventCategories)` method
  - Fixed `getLogLinesByEvent` parameter: `eventType` → `event`
  - Expanded `getLogLinesByMultiAttribute` with 9 new filter options

### Type Definitions

- `lib/types/logline-query.ts`:
  - Updated `QueryParams.eventType` → `QueryParams.event`
  - Expanded `MultiAttributeFilters` with 9 new fields

### UI Components

- `app/(protected)/log/lines/page.tsx` - Updated to use `params.event`
- `components/ui/LogLinesQueryPanel.tsx` - Updated paramKey from `eventType` to `event`
- `components/ui/MultiAttributeQueryPanel.tsx` - Updated all `eventType` references to `event`

## Design Decisions

1. **Full Migration for LogLineEventTypeMappingDto**: Changed from `{logLineType, eventType}` to `{platform, service, event}` per new API spec. The old structure is no longer supported.

2. **Backward Compatibility for associatedLogLineTypes**: Kept the deprecated `associatedLogLineTypes` field as required in `ActivityEventDto` to maintain compatibility with existing UI components that haven't been migrated yet.

3. **Parameter Naming**: Changed `eventType` to `event` throughout to align with OpenAPI spec. This affects both API methods and UI type definitions.

4. **Expanded MultiAttributeFilters**: Added all filter options from the spec including `eventCategory`, `platform`, `service`, `resourceId`, `resourceTitle`, `domain`, `ipAddress`, `startDate`, `endDate`.

## Testing Performed

1. **TypeScript Compilation**: `npx tsc --noEmit` - Passed with no errors
2. **Lint Check**: `npm run lint` - No new errors (pre-existing issues in unrelated files)

## Notes

- Pre-existing lint errors in `SystemStatusQuickView.tsx`, `CompanyManagementTab.tsx`, and `auth-context.tsx` are unrelated to these changes
- Components using `LogLineEventTypeMappingDto` will need updates to use the new `{platform, service, event}` structure when creating/editing activity events
