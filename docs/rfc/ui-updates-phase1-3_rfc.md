# UI Updates RFC - ActivityEvent, LogLines Query, Dashboard Statistics

## What was implemented

Comprehensive UI updates to leverage the new API capabilities added in the API client alignment phase. This includes ActivityEvent field migrations, a new unified LogLines Query Builder, and dashboard statistics visualization.

## Summary of Changes

| Phase | Category       | Description                                                                                                         |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1     | ActivityEvent  | Full migration from deprecated `associatedLogLineTypes` to `associatedEventCategories` + `logLineEventTypeMappings` |
| 2     | LogLines Query | Unified Query Builder with tabbed interface supporting all 17 endpoints                                             |
| 3     | Dashboard      | Log activity analytics widget with statistics visualization                                                         |

---

## Phase 1: ActivityEvent Management Updates

### Changes Made

| Component                        | Changes                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ActivityEventManagementTab.tsx` | Replaced LogLineTypes MultiSelect with EventCategories MultiSelect + LogLineEventTypeMappingsEditor |
| `ActivityEventEditModal.tsx`     | Updated to manage `associatedEventCategories` and `logLineEventTypeMappings`                        |
| `ActivityEventList.tsx`          | Updated display to show EventCategories and Mappings; updated JSON/text export                      |
| `activityevent.ts`               | Added schema validation for new fields using EventCategory and Platform enums                       |
| `text-formatters.ts`             | Updated `formatActivityEventAsText` to include new fields                                           |

### New Component Created

**`components/ui/LogLineEventTypeMappingsEditor.tsx`**

- Editable list of `{platform, service, event}` mappings
- Add mapping dialog with Platform dropdown, Service input, Event input
- Remove mapping functionality per row
- Reusable in both management tab and edit modal

### API Methods Used

- `updateActivityEventEventCategories(id, eventCategories)`
- `updateActivityEventLogLineEventTypes(id, logLineEventTypeMappings)`

---

## Phase 2: LogLines Query Builder

### Architecture

Implemented a scalable, configuration-driven query interface with three tabs:

| Tab                 | Purpose                                      | Performance      |
| ------------------- | -------------------------------------------- | ---------------- |
| **Basic Queries**   | Single-field fast indexed queries (14 types) | Fast (< 50ms)    |
| **Multi-Attribute** | Complex filtering with multiple parameters   | Medium (< 200ms) |
| **Advanced**        | Slow queries with performance warnings       | Slow (1-5s)      |

### Files Created

| File                                                   | Purpose                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| `lib/config/logline-query-config.ts`                   | Query type configurations with performance tiers   |
| `components/ui/query-builder/UnifiedQueryBuilder.tsx`  | Main query component with tabbed interface         |
| `components/ui/query-builder/QueryTypeSelector.tsx`    | Category-grouped query type dropdown               |
| `components/ui/query-builder/DynamicFieldRenderer.tsx` | Dynamic field rendering by type                    |
| `components/ui/query-builder/EnumSelect.tsx`           | Reusable enum dropdown with EventCategory grouping |
| `components/ui/query-builder/index.ts`                 | Barrel export file                                 |

### Files Modified

| File                                 | Changes                                      |
| ------------------------------------ | -------------------------------------------- |
| `app/(protected)/log/lines/page.tsx` | Replaced old panels with UnifiedQueryBuilder |

### Query Types Supported

**Basic Tab:**

- User & Organization: Actor, Owner, User, Sharing Detection
- Events: Event Category, Event, Date Range
- Infrastructure: Platform, Platform & Service, Service, Domain, IP Address
- Resource: Resource ID

**Multi-Attribute Tab:**

- 12 combinable filter fields with server-side filtering

**Advanced Tab:**

- Resource Title (with LIKE query performance warning)

### Design Decisions

1. **Performance Tiers**: Queries categorized into fast/medium/slow based on backend guide
2. **EventCategory Grouping**: 30 categories organized into 5 groups for better UX
3. **Tabbed Interface**: Clear separation of query complexity levels
4. **Configuration-Driven**: All query types defined in centralized config for easy maintenance

---

## Phase 3: Dashboard Statistics

### New Components

| Component                                      | Purpose                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| `components/dashboard/LogStatisticsWidget.tsx` | Analytics widget showing log activity statistics |
| `components/dashboard/index.ts`                | Barrel export file                               |

### LogStatisticsWidget Features

- **Total Log Lines Count**: Large metric display
- **Platform Distribution**: Horizontal bar chart showing Google/Slack/Microsoft distribution
- **Top Services**: Bar chart showing top 5 services by log count
- **Top Event Categories**: Badge display showing top 8 event categories
- **Link to Query Page**: Direct navigation to log lines query page

### Dashboard Integration

Added LogStatisticsWidget to `app/(protected)/home/page.tsx`:

- Placed after Recent Logs table
- Fetches statistics via `getLogLineStatistics(companyId)`
- Handles loading and error states gracefully

---

## Testing Performed

1. **TypeScript Compilation**: `npx tsc --noEmit` - Passed with no errors
2. **Lint Check**: `npm run lint` - Pre-existing issues in unrelated files only

## Pre-existing Lint Issues (Unrelated)

- `components/admin/SystemStatusQuickView.tsx` - setState in effect issue
- `components/settings/CompanyManagementTab.tsx` - missing useEffect dependencies
- `lib/auth-context.tsx` - missing useEffect dependencies

---

## Files Summary

### New Files (9)

```
components/ui/LogLineEventTypeMappingsEditor.tsx
components/ui/query-builder/UnifiedQueryBuilder.tsx
components/ui/query-builder/QueryTypeSelector.tsx
components/ui/query-builder/DynamicFieldRenderer.tsx
components/ui/query-builder/EnumSelect.tsx
components/ui/query-builder/index.ts
components/dashboard/LogStatisticsWidget.tsx
components/dashboard/index.ts
lib/config/logline-query-config.ts
```

### Modified Files (7)

```
components/settings/ActivityEventManagementTab.tsx
components/ui/ActivityEventEditModal.tsx
components/ui/ActivityEventList.tsx
lib/schemas/activityevent.ts
lib/utils/text-formatters.ts
app/(protected)/log/lines/page.tsx
app/(protected)/home/page.tsx
```

---

## Migration Notes

1. **ActivityEvent Data**: Existing `associatedLogLineTypes` data remains functional but deprecated
2. **UI Components**: Components now use `associatedEventCategories` and `logLineEventTypeMappings`
3. **Backward Compatibility**: Old field kept as required with @deprecated annotation

## Future Considerations

1. **Pagination**: Multi-attribute search could benefit from pagination controls
2. **Caching**: Statistics could be cached for performance optimization
3. **Charts Library**: Consider adding a proper charting library for more sophisticated visualizations
