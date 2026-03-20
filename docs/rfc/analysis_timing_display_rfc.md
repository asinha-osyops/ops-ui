# Analysis Graph Timing Display RFC

## Implementation Summary

Added timing data display to the analysis page graph view. Backend now returns step and edge timing data in ISO-8601 format which is visualized on nodes and edges.

## What Was Implemented

### 1. Duration Utility Functions (`lib/utils/duration-utils.ts`)

Created new utility functions for parsing and formatting ISO-8601 durations:

- `parseDuration(iso8601)` - Parses ISO-8601 duration to milliseconds
- `formatDuration(iso8601)` - Formats duration for display (e.g., "15m 30s")
- `formatTimestamp(iso8601)` - Formats timestamp for display
- `isNegativeDuration(iso8601)` - Checks for negative duration (concurrent execution)
- `formatEdgeDuration(iso8601)` - Compact format for edge labels

### 2. API Client DTO Updates (`lib/api-client.ts`)

Added timing fields to existing DTOs:

**StepTraceDto:**

- `firstLogTimestamp?: string` - ISO-8601 instant (earliest log)
- `lastLogTimestamp?: string` - ISO-8601 instant (latest log)
- `stepDuration?: string` - ISO-8601 duration

**EdgeDto:**

- `transitionDuration?: string` - ISO-8601 duration (only in trace responses)

**GraphStepTraceDto:**

- Same timing fields as StepTraceDto

### 3. Transform Layer Updates (`lib/utils/analysis-transforms.ts`)

Updated `transformToGraphFormat()` to preserve timing fields when transforming step traces to graph format.

### 4. Collapsed Node Footer (`components/analysis/AnalysisStepFooter.tsx`)

Added duration badge to collapsed nodes:

- Blue-styled badge with Clock icon
- Shows formatted duration (e.g., "15m 30s")
- Only appears when timing data is available

### 5. Expanded Content Timing Section (`components/analysis/AnalysisStepExpandedContent.tsx`)

Added new "Step Timing" section after Actor Role:

- Duration badge (with purple styling for negative/concurrent durations)
- First Activity timestamp
- Last Activity timestamp
- Only appears when timing data is available

### 6. Edge Duration Labels (`lib/hooks/useDagLayoutGeneric.ts`)

Added edge labels for transition duration:

- Labels appear centered on edges
- Purple color for negative durations (concurrent execution)
- Lightning bolt prefix for concurrent execution
- Semi-transparent background for readability

### 7. Increased Node Spacing

Updated default layout options:

- `rankSep: 100 → 150` - More space between levels for edge labels
- `nodeSep: 60 → 80` - More space between nodes for readability

## Key Files Changed

| File                                                  | Change Type                                        |
| ----------------------------------------------------- | -------------------------------------------------- |
| `lib/utils/duration-utils.ts`                         | NEW - Duration parsing/formatting utilities        |
| `lib/api-client.ts`                                   | UPDATE - Added timing fields to DTOs               |
| `lib/utils/analysis-transforms.ts`                    | UPDATE - Preserve timing fields in transform       |
| `components/analysis/AnalysisStepFooter.tsx`          | UPDATE - Added duration badge                      |
| `components/analysis/AnalysisStepExpandedContent.tsx` | UPDATE - Added timing section                      |
| `lib/hooks/useDagLayoutGeneric.ts`                    | UPDATE - Edge labels + increased spacing           |
| `components/graph-nodes/DagGraphView.tsx`             | UPDATE - Edge accessor includes transitionDuration |

## Design Decisions

### 1. ISO-8601 Duration Format

Durations use Java's ISO-8601 format (e.g., "PT15M30S"). The utility functions handle parsing and formatting for display.

### 2. Graceful Fallback

All timing displays gracefully handle missing data - they simply don't render when timing fields are null/undefined.

### 3. Concurrent Execution Indication

Negative durations (indicating overlapping/concurrent execution) are displayed with:

- Purple color scheme
- Lightning bolt prefix on edge labels
- "(concurrent)" suffix in expanded view

### 4. Edge Label Styling

Edge labels use ReactFlow's built-in label support with:

- Semi-transparent background
- Small font size (11px)
- Border radius for pill shape

## Edge Cases Handled

1. **No timing data** - Nothing displayed (graceful fallback)
2. **Negative duration** - Displayed as concurrent execution (purple with ⚡)
3. **Zero duration (PT0S)** - Displayed as "0s"
4. **Very long durations** - Formatted as hours (e.g., "2h 30m")
5. **null/undefined** - Skip display entirely

## Testing Performed

1. Build verification - `npm run build` passes with no type errors
2. Duration formatting - Handles various ISO-8601 formats
3. Edge label rendering - Labels appear on edges with durations
4. Expanded content - Timing section displays correctly
5. Collapsed footer - Duration badge appears alongside event/log badges

## Visual Changes

### Collapsed Node (Before → After)

```
Before:                           After:
┌────────────────────────┐       ┌────────────────────────────────┐
│ 📅 2 events  📄 5 lines│       │ 📅 2 events  📄 5 lines  ⏱ 15m│
└────────────────────────┘       └────────────────────────────────┘
```

### Edge (Before → After)

```
Before:                           After:
  ────────────→                     ────[4m 30s]────→
```

### Expanded Node (New Section)

```
┌─ Step Timing ───────────────────┐
│ Duration:        [15m 30s]      │
│ First Activity:  Jan 15, 2025   │
│ Last Activity:   Jan 15, 2025   │
└─────────────────────────────────┘
```

---

## Phase 2: Edge Timing Fix (Dec 31, 2024)

### Issue

Edge `transitionDuration` was not displaying because the analysis page was using edges from `sop.edges` (which don't have timing) instead of edges from the trace response.

### Root Cause

The async trace flow fetches step traces individually, then manually aggregates them. The edges came from `GET /api/sop/{id}` which doesn't include timing data. Edge timing is only available in trace responses.

### Solution

Backend added a new aggregate endpoint that returns complete `SopTraceDto` with edge timing:

```
GET /api/analysis/trace-sop-steps/async/aggregate?correlationId=...&sopId=...
```

### Changes Made

**1. Added `AsyncTraceAggregateResultDto` interface (`lib/api-client.ts`):**

```typescript
export interface AsyncTraceAggregateResultDto {
  correlationId: string
  sopId: string
  allComplete: boolean
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  message?: string
  sopTrace?: SopTraceDto // Complete trace with edge timing
}
```

**2. Added `getAsyncTraceAggregateResult()` API method (`lib/api-client.ts`):**

```typescript
async getAsyncTraceAggregateResult(correlationId: string, sopId: string): Promise<AsyncTraceAggregateResultDto>
```

**3. Updated `TraceSopStepsResponseDto` (`lib/api-client.ts`):**

```typescript
export interface TraceSopStepsResponseDto {
  sop: SopDto
  stepTraces: StepTraceDto[]
  edges?: EdgeDto[] // Edges with transitionDuration from aggregate
}
```

**4. Updated analysis page (`app/analysis/page.tsx`):**

- After fetching step traces, calls aggregate endpoint to get edges with timing
- Includes edges in the aggregated result

**5. Updated transform layer (`lib/utils/analysis-transforms.ts`):**

- Uses `response.edges` (with timing) if available, falls back to `response.sop.edges`

### Files Changed

| File                               | Change                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `lib/api-client.ts`                | Added `AsyncTraceAggregateResultDto`, `getAsyncTraceAggregateResult()`, updated `TraceSopStepsResponseDto` |
| `app/analysis/page.tsx`            | Calls aggregate endpoint after step traces complete                                                        |
| `lib/utils/analysis-transforms.ts` | Uses trace edges when available                                                                            |

---

## Phase 3: Log Lines Display Fix (Jan 1, 2026)

### Issue

Log lines in the analysis graph view displayed "0 log lines" for all nodes, despite the backend confirming log lines exist.

### Root Cause Analysis

**1. Aggregate Endpoint Data Not Used for Steps:**
The analysis page was manually merging Level 1 (step traces) + Level 2 (log line matching) async results. However:

- Level 2 async polling returns `sampleLogLine` (single sample) for performance
- Only the aggregate endpoint returns the complete `matchingLogLines` array
- The aggregate endpoint's `sopTrace.steps` was ignored - only `sopTrace.edges` was used

**2. StepTraceDto Structure Mismatch:**

- Backend returns flat step properties: `{ id, name, matchingActivityEvents, ... }`
- Frontend expected nested structure: `{ step: { id, name, ... }, matchingActivityEvents, ... }`

### Solution

Use the aggregate endpoint's `sopTrace.steps` directly instead of manual merging.

**New Flow:**

1. Poll Level 1 + Level 2 for **progress display only**
2. Once all complete, use `aggregateResult.sopTrace.steps` for step traces (has complete `matchingLogLines`)
3. Use `aggregateResult.sopTrace.edges` for edge timing

### Changes Made

**1. Added `transformSopTraceSteps()` helper (`lib/utils/analysis-transforms.ts`):**

```typescript
/**
 * Transform SopTraceDto steps to frontend StepTraceDto format
 * Backend returns flat step properties; frontend expects nested `step` object
 */
export function transformSopTraceSteps(steps: any[]): StepTraceDto[] {
  return steps.map((step) => {
    if (step.step) return step as StepTraceDto;
    return {
      step: { id: step.id, name: step.name, ... },
      matchingActivityEvents: step.matchingActivityEvents || [],
      firstLogTimestamp: step.firstLogTimestamp,
      lastLogTimestamp: step.lastLogTimestamp,
      stepDuration: step.stepDuration,
    } as StepTraceDto;
  });
}
```

**2. Simplified `fetchAllResults()` (`app/analysis/page.tsx`):**

```typescript
const fetchAllResults = async () => {
  const sop = await apiClient.getSopById(asyncTrace.sopId)

  // Use aggregate endpoint for EVERYTHING (steps + edges)
  const aggregateResult = await apiClient.getAsyncTraceAggregateResult(
    asyncTrace.correlationId,
    asyncTrace.sopId
  )

  // Transform steps from backend flat structure to frontend nested structure
  const stepTraces = transformSopTraceSteps(aggregateResult.sopTrace.steps)

  const aggregatedResults: TraceSopStepsResponseDto = {
    sop,
    stepTraces,
    edges: aggregateResult.sopTrace.edges,
  }
}
```

### Files Changed

| File                               | Change                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `lib/utils/analysis-transforms.ts` | Added `transformSopTraceSteps()` helper                    |
| `app/analysis/page.tsx`            | Use aggregate's `sopTrace.steps` instead of manual merging |

### Why This Fix Works

1. **Aggregate endpoint returns complete data**: Unlike individual async results which return `sampleLogLine`, the aggregate returns full `matchingLogLines` arrays
2. **Single source of truth**: Using `sopTrace` from aggregate ensures consistent data structure
3. **Simpler code**: Eliminates complex Level 1 + Level 2 merging logic
4. **Matches documented API flow**: The howto guide recommends using aggregate endpoint for final results
