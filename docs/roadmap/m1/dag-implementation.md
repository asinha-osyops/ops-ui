SOP DAG Validation & Step Management Implementation Plan

Overview

Implement new DAG validation features, step management capabilities, and edge editing for SOPs based on the updated backend API specification.

---

1.  Align API Client with New Spec

Files to Modify

- lib/api-client.ts

Changes Required

1.1 Update SopDto Interface (line ~576)

Add missing validation fields:
export interface SopDto {
// ... existing fields ...
dagValid: boolean; // NEW
lastValidatedAt: string | null; // NEW
validationErrors: DagValidationErrorDto[]; // NEW
validationWarnings: DagValidationWarningDto[]; // NEW
}

1.2 Add createStep Method

async createStep(sopId: string, request: CreateStepRequestDto): Promise<StepDto>
// POST /api/sop/{sopId}/steps

1.3 Add deleteStep Method

async deleteStep(sopId: string, stepId: string): Promise<void>
// DELETE /api/sop/{sopId}/steps/{stepId}

1.4 Add Cache Invalidation Methods

async invalidateStepCache(stepId: string): Promise<void>
// DELETE /api/analysis/cache/step/{stepId}

async invalidateSopCache(sopId: string): Promise<void>
// DELETE /api/analysis/cache/sop/{sopId}

async invalidateActivityEventCache(activityEventId: string): Promise<void>
// DELETE /api/analysis/cache/activity-event/{activityEventId}

---

2.  Display Validation Fields on SOP Detail Page

Files to Modify

- app/sop/[id]/page.tsx
- components/sop/DagValidationPanel.tsx (enhance)

Changes Required

2.1 Add Validation Status Banner

Display at top of page when SOP has validation issues:

- Red banner when dagValid === false (blocking errors)
- Yellow banner when validationWarnings.length > 0 (warnings only)
- Green indicator when fully valid
- Show lastValidatedAt timestamp

  2.2 Block Analysis When Invalid

- Disable "Analyze" button when dagValid === false
- Show tooltip explaining why analysis is blocked
- Handle 422 responses from analysis endpoints gracefully

  2.3 Integrate Validation Panel

- Show validation errors/warnings in collapsible section
- Allow clicking on errors to highlight affected nodes in graph view
- Show error codes and human-readable messages

---

3.  Allow Creating New Steps for an SOP

Approach: Modal Dialog [CONFIRMED]

Files to Modify

- app/sop/[id]/page.tsx
- lib/hooks/useDagEditing.ts (add createStep operation)
- New: components/sop/AddStepModal.tsx

Changes Required

3.1 Create AddStepModal Component

Dialog-based form (similar to SopEditModal pattern) with fields:

- name (required, max 100 chars)
- details (optional, max 500 chars)
- postStepDocumentation (optional, max 200 chars)
- monitoringRequirements (optional, max 200 chars)
- nodeType dropdown (START/STEP/END)
- actorRoleTitle dropdown (60+ role options)

  3.2 Add "Add Step" Button

- Add button to Steps tab header
- Add context menu option in Graph view (right-click canvas)

  3.3 Update useDagEditing Hook

Add:
createStep: (request: CreateStepRequestDto) => Promise<StepDto | null>;
isCreatingStep: boolean;

3.4 Post-Creation Flow

- After step created, show toast notification
- Refresh SOP data to show new step
- In Graph view: new step appears disconnected (user must add edges)

---

4.  Allow Editing Edge Connections

Files to Modify

- components/sop/SopGraphView.tsx (enhance existing)
- lib/hooks/useDagEditing.ts (already has edge operations)

Current State

Edge editing is already implemented in SopGraphView:

- Edit mode toggle
- Edge creation (click source → target)
- Edge deletion (click edge in edit mode)
- Node type changing via context menu

Enhancements Needed

4.1 Improve Edge Creation UX

- Add visual indicator showing which node is selected as source
- Show tooltip instructions during edge creation
- Highlight valid target nodes

  4.2 Add Edge Management to Steps Tab

Consider adding simple edge display in Steps tab:

- Show predecessor/successor step names (already partially done)
- Quick link to Graph view for edge editing

  4.3 Cycle Detection Feedback

- When edge creation fails due to cycle, show clear error message
- Consider highlighting the cycle path in the graph

---

5.  Error States & Validation Handling

Files to Modify

- app/sop/[id]/page.tsx
- components/sop/DagValidationPanel.tsx
- components/sop/SopGraphView.tsx

Changes Required

5.1 Validation Error Display

| Error Code             | Display                         | User Action                    |
| ---------------------- | ------------------------------- | ------------------------------ |
| NO_START_NODE          | "No START node defined"         | Prompt to mark a step as START |
| MULTIPLE_START_NODES   | "Multiple START nodes found"    | List affected nodes            |
| CYCLE_DETECTED         | "Circular dependency detected"  | Highlight cycle in graph       |
| START_HAS_PREDECESSORS | "START node has incoming edges" | Show which edges to remove     |
| END_HAS_SUCCESSORS     | "END node has outgoing edges"   | Show which edges to remove     |

5.2 Validation Warning Display

| Warning Code     | Display                         | Suggested Fix                |
| ---------------- | ------------------------------- | ---------------------------- |
| NO_END_NODE      | "No END nodes defined"          | Mark terminal steps as END   |
| UNREACHABLE_NODE | "Step not reachable from START" | Add edge from reachable node |
| DANGLING_NODE    | "Step has no successors"        | Add edge or mark as END      |
| ORPHAN_NODE      | "Step has no predecessors"      | Add edge or mark as START    |

5.3 Analysis Blocking

- When user clicks Analyze with invalid DAG:
  - Prevent action
  - Show modal/toast explaining validation must pass first
  - Link to validation errors section

    5.4 API Error Handling

Handle specific error responses:

- 400 Bad Request for cycle detection on edge creation
- 422 Unprocessable Entity for analysis with invalid DAG
- 404 Not Found for deleted steps/edges

---

6.  Other Places to Update

6.1 SOP List Page (app/sop/page.tsx) [CONFIRMED]

- Add validation status column with badge to table
- Show visual indicator: green checkmark for valid, red X for invalid
- Display error/warning counts in badge
- Consider filter option for invalid SOPs (optional)

  6.2 SOP Create Flow (app/sop/create/page.tsx)

- Consider adding initial nodeType selection for steps
- First step defaults to START, last to END

  6.3 Analysis Page (app/analysis/page.tsx)

- Handle 422 responses when tracing SOP with invalid DAG
- Show message prompting user to fix validation errors first

  6.4 StepTableEditor (components/sop/StepTableEditor.tsx)

- Ensure nodeType column works correctly for editing
- Consider showing validation warnings inline

  6.5 Update CLAUDE.md

- Document new validation fields
- Document new API endpoints
- Update SopDto interface documentation

---

Implementation Order

1.  API Client Updates - Foundation for all other work
2.  Validation Display - Show existing validation data
3.  Step Creation - Enable adding steps
4.  Edge Editing Enhancements - Polish existing functionality
5.  Error Handling - Comprehensive error states
6.  Other Updates - List page, create flow, etc.

---

Critical Files Summary

| File                                  | Changes                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| lib/api-client.ts                     | Add SopDto fields, createStep, deleteStep, cache invalidation methods |
| app/sop/[id]/page.tsx                 | Validation banner, block analysis, add step button                    |
| app/sop/page.tsx                      | Add validation status column to list                                  |
| components/sop/AddStepModal.tsx       | NEW - Step creation dialog form                                       |
| components/sop/DagValidationPanel.tsx | Enhance error/warning display with clickable items                    |
| components/sop/SopGraphView.tsx       | Edge creation UX improvements                                         |
| lib/hooks/useDagEditing.ts            | Add createStep, deleteStep operations                                 |

---

User Decisions Captured

- Cache APIs: Include now (all 3 cache invalidation endpoints)
- Add Step UI: Modal dialog approach
- List page: Include validation status column
