# Per-SOP Analysis Page Refactor RFC

## Summary

Refactored the centralized `/analysis` page to per-SOP analysis pages at `/sop/[id]/analysis`. Each SOP now has its own analysis sub-page accessible via a "Run Analysis" button on the SOP detail page.

## What Was Implemented

1. **New Route**: `/sop/[id]/analysis` - Per-SOP analysis page
2. **Auto-Start**: Analysis kicks off automatically when navigating to the page (unless cached results exist)
3. **Results Caching**: Session-based caching for quick reload on navigation back
4. **Stale Detection**: Warns when SOP has been modified since last analysis
5. **Re-run Capability**: Button to re-run analysis when viewing cached results

## Key Files Changed

### Created

| File                                         | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `app/(protected)/sop/[id]/analysis/page.tsx` | Per-SOP analysis page with auto-start, caching, and progress display |
| `hooks/use-analysis-cache.ts`                | SessionStorage-based caching hook for analysis results               |

### Modified

| File                                | Changes                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `lib/routes.ts`                     | Added `SOP_ANALYSIS` route, added `Breadcrumbs.sop.analysis()`, removed `ANALYSIS_HOME` and `Breadcrumbs.analysis` |
| `app/(protected)/sop/[id]/page.tsx` | Added "Run Analysis" button in header with LineChart icon                                                          |
| `components/app-sidebar.tsx`        | Removed "Analysis" navigation item                                                                                 |

### Deleted

| File                                | Reason                             |
| ----------------------------------- | ---------------------------------- |
| `app/(protected)/analysis/page.tsx` | Replaced by per-SOP analysis pages |

## Design Decisions

### 1. SessionStorage for Caching

- **Choice**: Use `sessionStorage` instead of `localStorage`
- **Rationale**: Analysis results are temporary and should be cleared when the tab closes. Session storage survives page navigation but not tab/browser close.

### 2. Staleness Detection

- **Choice**: Use `lastValidatedAt` (or `createdAt` as fallback) to detect stale cache
- **Rationale**: `SopDto` doesn't have an `updatedAt` field. `lastValidatedAt` is updated when the DAG structure changes, which is the most relevant indicator for analysis invalidation.

### 3. Auto-Start with Cache Check

- **Choice**: Auto-start analysis only if no cached results exist
- **Rationale**: Provides instant results for recently analyzed SOPs while ensuring fresh analysis for first-time visitors. Users can always re-run manually.

### 4. Progress UI Reuse

- **Choice**: Reuse the exact same progress splash screen from the old analysis page
- **Rationale**: Maintains consistent UX and avoids duplicating complex progress tracking code.

## Component Structure

```
SopAnalysisPage
├── useEntityDetail (fetch SOP by ID)
├── useAnalysisCache (check/store cached results)
├── useAnalysisPolling (existing hook - unchanged)
│
├── [Loading] → Spinner
├── [Error/Not Found] → Error message with back button
├── [No Company] → CompanyRequiredAlert
│
├── [Cached Results]
│   ├── Stale warning (if SOP modified since cache)
│   ├── "Last analyzed: [timestamp]" indicator
│   ├── "Re-run Analysis" button
│   └── TraceSopStepsResults
│
├── [Analyzing]
│   └── Progress splash screen (step progress, ESC to cancel)
│
└── [Results]
    └── TraceSopStepsResults
```

## Testing Performed

1. **TypeScript**: `npx tsc --noEmit` passes with no errors
2. **Linting**: All modified files pass ESLint
3. **Route verification**: New route constant properly typed with `StaticRouteValue` cast for breadcrumbs

## Verification Checklist

- [ ] Navigate to SOP detail page → "Run Analysis" button visible
- [ ] Click "Run Analysis" → Navigates to `/sop/[id]/analysis`
- [ ] Analysis starts automatically on first visit
- [ ] Progress UI shows step count and ESC to cancel
- [ ] Results display correctly with TraceSopStepsResults
- [ ] Navigate away and back → Cached results shown instantly
- [ ] "Re-run Analysis" button triggers fresh analysis
- [ ] Stale warning appears if SOP is modified after caching
- [ ] Sidebar no longer shows "Analysis" nav item
- [ ] Old `/analysis` route returns 404

## Migration Notes

- No data migration required
- Users accessing bookmarked `/analysis` links will get 404
- Session cache will be empty for all users after deployment (expected behavior)
