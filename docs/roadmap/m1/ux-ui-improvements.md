# UX/UI Improvements RFC

## Summary

Implemented accessibility, performance, and responsive design improvements across the codebase in 6 phases.

## What Was Implemented

### Phase 1: Icon Button Accessibility

Added `aria-label` attributes to all icon-only buttons for screen reader support.

**Files Changed:**

- `app/(protected)/sop/SopPageContent.tsx` - Edit/Delete SOP buttons
- `app/(protected)/log/LogPageContent.tsx` - Analyze/Delete log buttons
- `components/graph-nodes/StepNodeBase.tsx` - Close expanded view button
- `components/sop/DagValidationPanel.tsx` - Toggle validation details button

### Phase 2: Semantic Breadcrumbs

Replaced custom breadcrumb implementation with shadcn/ui breadcrumb component providing proper semantic HTML structure (`<nav>`, `<ol>`, `<li>`, `aria-current`).

**Files Changed:**

- `components/PageLayout.tsx` - Now uses `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` from `@/components/ui/breadcrumb`

### Phase 3: BulkEmployeeTableEditor ARIA

Added comprehensive accessibility attributes to form inputs in the bulk employee editor.

**Files Changed:**

- `components/ui/BulkEmployeeTableEditor.tsx`

**Attributes Added:**

- `aria-label` for all inputs (name, phone, email, role, manager)
- `aria-required="true"` for required fields
- `aria-invalid` when validation errors present
- `aria-describedby` linking to error messages
- Error messages with `id` and `role="alert"`
- Delete button `aria-label`

### Phase 4: Table Row Memoization

Extracted table rows as memoized components to prevent unnecessary re-renders.

**Files Changed:**

- `app/(protected)/sop/SopPageContent.tsx` - Added `SopTableRowMemo` component
- `app/(protected)/log/LogPageContent.tsx` - Added `LogTableRowMemo` component with `useCallback` for handlers

### Phase 5: ReactFlow Constants

Extracted inline ReactFlow configuration objects to module-level constants.

**Files Created:**

- `lib/constants/graph-config.ts` - Contains `REACTFLOW_FIT_VIEW_OPTIONS`, `REACTFLOW_DEFAULT_VIEWPORT`, `REACTFLOW_PRO_OPTIONS`, `REACTFLOW_BACKGROUND_STYLE`

**Files Changed:**

- `components/org/OrgChartGraphView.tsx` - Now imports and uses shared constants
- `components/graph-nodes/DagGraphView.tsx` - Now imports and uses shared constants

### Phase 6: Responsive Graph Heights

Added responsive height classes to graph containers for better mobile/tablet experience.

**Files Changed:**

- `components/org/OrgChartGraphView.tsx` - Loading/empty/graph states now use `h-[400px] md:h-[500px] lg:h-[600px]`
- `components/graph-nodes/DagGraphView.tsx` - Default `graphHeight` prop changed to `h-[350px] md:h-[450px] lg:h-[500px]`

## Design Decisions

1. **Memoization Strategy**: Used `React.memo` with callback functions passed as props rather than inline functions to ensure proper memoization effectiveness.

2. **ARIA Pattern**: Followed WAI-ARIA best practices with `aria-describedby` linking inputs to their error messages and `role="alert"` for dynamic error announcements.

3. **Breadcrumb Component**: Chose shadcn/ui breadcrumb component which wraps Radix primitives, ensuring consistent styling with the rest of the UI while providing semantic HTML.

4. **Constants Extraction**: Extracted ReactFlow configs to a dedicated file in `lib/constants/` following the project's existing constant organization pattern.

5. **Responsive Heights**: Used breakpoints `md` (768px) and `lg` (1024px) consistent with Tailwind defaults, with heights that provide usable space on all device sizes.

## Testing Performed

- TypeScript compilation verified (`npx tsc --noEmit`)
- Linting checked (pre-existing warnings unrelated to changes)
- Visual inspection of breadcrumb rendering
- Verified memoized components have correct props types

## Verification Checklist

### Accessibility

- [ ] VoiceOver/NVDA announces icon button purposes
- [ ] Breadcrumbs have proper semantic structure in DOM
- [ ] Form inputs in bulk editor have proper ARIA attributes
- [ ] Keyboard navigation works for all interactive elements

### Performance

- [ ] React DevTools shows memoized rows not re-rendering unnecessarily
- [ ] No new inline object warnings in ReactFlow

### Visual

- [ ] All pages render correctly after changes
- [ ] Responsive heights work on mobile/tablet/desktop
- [ ] No regressions in existing functionality

## Files Modified (13 total - Initial UX Improvements)

| File                                        | Changes                             |
| ------------------------------------------- | ----------------------------------- |
| `app/(protected)/sop/SopPageContent.tsx`    | aria-labels, memoized row component |
| `app/(protected)/log/LogPageContent.tsx`    | aria-labels, memoized row component |
| `components/graph-nodes/StepNodeBase.tsx`   | aria-label on close button          |
| `components/sop/DagValidationPanel.tsx`     | aria-label on toggle button         |
| `components/PageLayout.tsx`                 | Semantic breadcrumb component       |
| `components/ui/BulkEmployeeTableEditor.tsx` | Full ARIA support                   |
| `components/org/OrgChartGraphView.tsx`      | Constants + responsive heights      |
| `components/graph-nodes/DagGraphView.tsx`   | Constants + responsive heights      |
| `lib/constants/graph-config.ts`             | New file - ReactFlow constants      |

---

## Phase 7: shadcn/ui Component Adoption

### Summary

Replaced native HTML form elements with shadcn/ui components for consistency, accessibility, and maintainability.

### Changes Made

#### 1. MultiAttributeQueryPanel.tsx

Replaced 4 native `<input>` elements with shadcn `Input` component.

**Before:**

```tsx
<input type="text" className="w-full px-3 py-2 border..." />
```

**After:**

```tsx
<Input value={...} onChange={...} placeholder="..." disabled={isLoading} />
```

#### 2. BulkEmployeeTableEditor.tsx

- Replaced 3 native `<input>` with shadcn `Input`
- Replaced 2 native `<select>` with shadcn `Select`
- Replaced `overflow-auto` container with shadcn `ScrollArea`

#### 3. EmployeeTableView.tsx

Replaced 3 native `<input>` elements (name, email, phone) with shadcn `Input`.

#### 4. RoleTableView.tsx

- Replaced 1 native `<input>` (name) with shadcn `Input`
- Replaced 2 native `<textarea>` (description, responsibilities) with shadcn `Textarea`

#### 5. log/create/page.tsx

Replaced native `<textarea>` for JSON metadata with shadcn `Textarea` and `Label`.

#### 6. SopCacheStatus.tsx

Replaced `overflow-y-auto` container with shadcn `ScrollArea`.

#### 7. log/[id]/page.tsx

Replaced `overflow-auto` for parsed text preview with shadcn `ScrollArea`.

### Files Modified (7 additional files)

| File                                         | Changes                                   |
| -------------------------------------------- | ----------------------------------------- |
| `components/ui/MultiAttributeQueryPanel.tsx` | 4 native inputs → shadcn Input            |
| `components/ui/BulkEmployeeTableEditor.tsx`  | 3 inputs, 2 selects → shadcn + ScrollArea |
| `components/ui/EmployeeTableView.tsx`        | 3 native inputs → shadcn Input            |
| `components/settings/RoleTableView.tsx`      | 1 input, 2 textareas → shadcn             |
| `app/(protected)/log/create/page.tsx`        | 1 textarea → shadcn Textarea              |
| `components/analysis/SopCacheStatus.tsx`     | overflow-auto → ScrollArea                |
| `app/(protected)/log/[id]/page.tsx`          | overflow-auto → ScrollArea                |

### Benefits

1. **Consistency**: All form controls now use the same shadcn design tokens
2. **Accessibility**: shadcn components include proper ARIA attributes by default
3. **Maintainability**: Styling changes propagate through shadcn component definitions
4. **Cross-browser**: ScrollArea provides consistent scrollbar styling across browsers

---

## Phase 8: Graph Rendering Performance & Accessibility

### Summary

Improved graph rendering performance, added virtualization for large lists, enhanced keyboard accessibility, and added error boundaries for graceful error handling.

### Changes Made

#### 1. Split Dagre Layout from Selection State

**File:** `lib/hooks/useDagLayoutGeneric.ts`

Separated the expensive dagre layout calculation from selection state updates:

- **Phase 1**: Dagre layout calculation - only runs when steps, edges, or expandedStepId changes
- **Phase 2**: Selection state application - runs on selectedStepId changes (cheap operation)

This prevents full layout recalculation when merely selecting/deselecting nodes.

#### 2. Add Virtualization for Log Line Lists

**File:** `components/analysis/AnalysisStepExpandedContent.tsx`

Added `@tanstack/react-virtual` virtualization for log line lists:

- Threshold: Lists with 50+ items use virtualization
- Implemented `VirtualizedLogLineList` component
- Only visible items + 5 overscan items are rendered
- Small lists continue using simple mapping (no overhead)

#### 3. Keyboard Accessibility for Graphs

**Files:** `components/graph-nodes/DagGraphView.tsx`, `components/org/OrgChartGraphView.tsx`

Added keyboard navigation support:

- `nodesFocusable={true}` - enables Tab navigation between nodes
- Enter/Space - select/expand focused node
- Escape - deselect and collapse
- Custom `handleKeyDown` handlers for each graph type

#### 4. CSS Variables for Edge Colors

**File:** `lib/hooks/useDagLayoutGeneric.ts`

Replaced hardcoded OKLCH colors with CSS custom properties:

- Uses `hsl(var(--destructive))` for warning colors (>= 1 week)
- Uses green color tokens for OK status (< 1 week)
- Theme-aware through CSS variables

#### 5. Error Boundaries for Graphs

**Files:** `components/graph-nodes/DagGraphView.tsx`, `components/org/OrgChartGraphView.tsx`

Added `react-error-boundary` wrappers with custom fallback components:

- `GraphErrorFallback` component shows error message and "Try Again" button
- Shows error details in development mode
- Graceful degradation instead of white screen on errors

#### 6. Accessible Graph Controls

**File:** `components/graph-nodes/AccessibleGraphControls.tsx` (New)

Created custom accessible controls replacing default ReactFlow Controls:

- Proper `aria-label` on zoom in, zoom out, and fit view buttons
- Focus-visible rings for keyboard navigation
- Uses `ControlButton` from ReactFlow with lucide icons

**Files Updated:** Both graph views now use `AccessibleGraphControls`

#### 7. Removed Unused useDagLayout.ts Hook

**File Deleted:** `lib/hooks/useDagLayout.ts`

- Migrated utility functions (`getPredecessorIds`, `getSuccessorIds`) to `useDagLayoutGeneric.ts`
- Updated imports in `app/(protected)/sop/[id]/page.tsx`
- Deleted the obsolete hook file

### Files Modified (8 files)

| File                                                  | Changes                                               |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `lib/hooks/useDagLayoutGeneric.ts`                    | Split layout phases, CSS variables, utility functions |
| `components/analysis/AnalysisStepExpandedContent.tsx` | Virtualization for log lines                          |
| `components/graph-nodes/DagGraphView.tsx`             | Keyboard nav, error boundary, accessible controls     |
| `components/org/OrgChartGraphView.tsx`                | Keyboard nav, error boundary, accessible controls     |
| `components/graph-nodes/AccessibleGraphControls.tsx`  | New file - accessible graph controls                  |
| `app/(protected)/sop/[id]/page.tsx`                   | Updated import path                                   |

### Files Deleted (1 file)

| File                        | Reason                             |
| --------------------------- | ---------------------------------- |
| `lib/hooks/useDagLayout.ts` | Replaced by useDagLayoutGeneric.ts |

### Benefits

1. **Performance**: Layout only recalculates when graph structure changes, not on selection
2. **Scalability**: Virtualization handles large log line lists efficiently
3. **Accessibility**: Full keyboard navigation and screen reader support
4. **Reliability**: Error boundaries prevent white screen crashes
5. **Maintainability**: Removed duplicate code, consolidated utilities
