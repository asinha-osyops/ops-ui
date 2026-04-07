# Analysis Page Graph Refactoring RFC

## Implementation Summary

Refactored the `/analysis` page graph visualization to use a shared DAG graph component with the SOP graph view, providing consistent visual styling while maintaining separate functionality for read-only analysis display vs. editable SOP workflows.

## What Was Implemented

### 1. API Client DTO Updates (`lib/api-client.ts`)

- Preserved existing async trace DTOs for backward compatibility:
  - `LogLineTraceDto` - Log line trace with `logLinesByLogId` format
  - `ActivityEventTraceDto` - Activity event with log line trace
  - `StepTraceDto` - Step trace with matching activity events
  - `TraceSopStepsResponseDto` - Full trace response

- Added new graph display DTOs:
  - `LogMatchDto` - Grouped log lines by parent log (logId, logName, loggingSource, matchingLogLines, matchCount)
  - `GraphLogLineTraceDto` - Log line trace with grouped format
  - `GraphActivityEventDto` - Simplified activity event for graph display
  - `GraphStepTraceDto` - Enriched step for graph display with matching activity events
  - `SopTraceDto` - Enriched SOP structure for analysis graph

### 2. Generic DAG Layout Hook (`lib/hooks/useDagLayoutGeneric.ts`)

- Created generic layout hook that works with any step/edge types via accessor functions
- Supports both SopDto steps and StepTraceDto steps
- Uses dagre library for consistent DAG layout calculation
- Handles expanded node sizing (220px collapsed, 420px expanded)

### 3. Shared DAG Graph Component (`components/graph-nodes/DagGraphView.tsx`)

- Generic React component for rendering DAG graphs
- Uses accessor functions for flexibility with different data types
- Supports render props for customization:
  - `renderCollapsedFooter` - Custom footer in collapsed nodes
  - `renderExpandedContent` - Custom content in expanded nodes
- Handles controlled or uncontrolled state for selection/expansion
- Optional edit mode support for SOP page
- Consistent styling: node colors, edge styles, zoom controls

### 4. SopGraphView Refactoring (`components/sop/SopGraphView.tsx`)

- Refactored to use shared `DagGraphView` component
- Maintains all edit mode functionality:
  - Edge creation (click source → target)
  - Edge deletion (click in edit mode)
  - Node type changes (START/STEP/END)
- Keeps validation panel and edit mode instructions
- Uses `SopExpandedContent` for expanded node display

### 5. Analysis Graph Components

- `AnalysisGraphView.tsx` - Read-only graph using shared DagGraphView
- `AnalysisStepFooter.tsx` - Collapsed node badges showing event/log counts
- `AnalysisStepExpandedContent.tsx` - Expanded node content with:
  - Step details and actor role
  - Activity events list
  - Grouped log lines (collapsible by activity event, then by log source)
  - Color-coded log source badges
  - Post-step documentation and monitoring requirements

### 6. Analysis Transform Utilities (`lib/utils/analysis-transforms.ts`)

- `transformToGraphFormat()` - Converts async trace response to graph display format
- `extractLogLineData()` - Extracts and groups log line data by step
- `calculateTotalLogLinesForStep()` - Counts log lines for a step
- `getStepTraceById()` - Helper to find step trace

### 7. Integration (`components/analysis/TraceSopStepsResults.tsx`)

- Updated to use new `AnalysisGraphView` instead of old `SopTraceGraphView`
- Simplified component with internal state management in AnalysisGraphView

## Key Files Changed

| File                                                  | Change Type                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `lib/api-client.ts`                                   | Updated - Added new graph DTOs, preserved async DTOs |
| `lib/hooks/useDagLayoutGeneric.ts`                    | New - Generic DAG layout hook                        |
| `components/graph-nodes/DagGraphView.tsx`             | New - Shared DAG graph component                     |
| `components/sop/SopGraphView.tsx`                     | Refactored - Uses DagGraphView                       |
| `components/sop/graph-nodes/SopStepNode.tsx`          | Updated - Exported SopExpandedContent                |
| `components/analysis/AnalysisGraphView.tsx`           | New - Analysis graph wrapper                         |
| `components/analysis/AnalysisStepFooter.tsx`          | New - Collapsed node footer                          |
| `components/analysis/AnalysisStepExpandedContent.tsx` | New - Expanded node content                          |
| `lib/utils/analysis-transforms.ts`                    | New - Data transformation utilities                  |
| `components/analysis/TraceSopStepsResults.tsx`        | Updated - Uses AnalysisGraphView                     |

## Files Removed (Deprecated)

| File                                           | Reason                                  |
| ---------------------------------------------- | --------------------------------------- |
| `components/analysis/SopTraceGraphView.tsx`    | Replaced by AnalysisGraphView           |
| `components/analysis/graph-nodes/StepNode.tsx` | Using shared StepNodeBase               |
| `components/analysis/StepDetailCard.tsx`       | Replaced by AnalysisStepExpandedContent |
| `components/analysis/StepInfoPanel.tsx`        | No longer used                          |

## Design Decisions

### 1. Accessor Functions Pattern

Used accessor functions instead of generic type constraints to allow the shared DagGraphView to work with both `StepDto` and `GraphStepTraceDto` without complex type gymnastics.

### 2. Backward Compatibility

Kept the existing async trace DTOs (`StepTraceDto`, `ActivityEventTraceDto`, `LogLineTraceDto`) unchanged to maintain compatibility with the current async API flow. Added new "Graph" prefixed DTOs for display purposes.

### 3. Transform Layer

Created a transform utility layer to convert between the async API response format and the graph display format, keeping the conversion logic centralized and testable. The transform functions handle both data formats:

- **NEW format**: `logLineTrace.matchingLogs` - array of `LogMatchDto` (current backend response)
- **OLD format**: `logLineTrace.logLinesByLogId` - Record of log ID to log lines (legacy support)

### 4. Grouped Log Lines Display

Implemented two-level collapsible grouping:

1. First level: Activity event (shows all logs for that event)
2. Second level: Log source (shows individual log lines)

This provides good UX for navigating potentially large numbers of log lines.

### 5. Color Coding

Used consistent colors from the shared `step-node-config.ts`:

- START nodes: Green
- STEP nodes: Orange
- END nodes: Red
- Fork indicators: Blue
- Join indicators: Purple
- Log sources: Type-specific colors (Drive=blue, Mail=amber, Tasks=green, Device=red)

## Testing Performed

1. Build verification - `npm run build` passes with no type errors
2. SOP graph view maintains all edit mode functionality
3. Analysis graph view displays with proper DAG layout
4. Node expansion/collapse works correctly
5. Grouped log line display with collapsible sections
6. Log lines display correctly with both OLD and NEW backend formats

## Visual Consistency Achieved

The analysis graph now matches the SOP graph view:

- Same node colors (START=green, STEP=orange, END=red)
- Same node dimensions (220px collapsed, 420px expanded)
- Same fork/join indicators (blue/purple)
- Same edge styling with arrows
- Same dagre layout algorithm
- Same handle positions and colors
- Same hover/selection effects
- Same controls (zoom, fit view)

## Differences from SOP Graph

- NO edit mode toggle
- NO validation panel
- NO edge creation/deletion controls
- Custom expanded content showing activity events and log lines
- Custom collapsed footer showing count badges
