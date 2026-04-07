# RFC: Graph Merge Migration

**Slug**: `graph-merge-migration`
**Milestone**: m1
**Created**: 2026-04-06
**Status**: draft

## Summary

Migrate the main SOP graph (Graph A) to the Graph Merge design, replacing the monolithic `StepNodeBase` + `DagGraphView` architecture with type-specific node components, hover-to-inspect interaction, solid smoothstep edges, and a simpler orchestration layer. Graph Merge is a working prototype at `/preview/graphMerge` under `components/sop-graph-merge/`. The migration preserves all edit capabilities (edge creation/deletion, node type changes, validation) while achieving ~40% codebase reduction and a more maintainable architecture.

## Current State

### Graph A (2,284 LOC across 8 files)

| File                                         | LOC  | Purpose                                                                                                                           |
| -------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| `components/sop/SopGraphView.tsx`            | 382  | Orchestrator: edit mode toggle, edge creation toolbar, validation panel, node type changes                                        |
| `components/graph-nodes/DagGraphView.tsx`    | 450  | Generic ReactFlow wrapper: error boundary, keyboard nav (Escape/Enter/Space), FullscreenGraphModal, controlled/uncontrolled state |
| `components/graph-nodes/StepNodeBase.tsx`    | 248  | Monolithic node: handles all types (START/STEP/END) via prop branching, collapsed (220px) and expanded (420px) states             |
| `components/graph-nodes/step-node-config.ts` | 44   | Node type styling config                                                                                                          |
| `lib/hooks/useDagEditing.ts`                 | 417  | Edit state machine: edge creation, node type changes, validation refresh, API calls                                               |
| `components/sop/DagValidationPanel.tsx`      | 260  | Collapsible error/warning display with clickable items                                                                            |
| `components/analysis/AnalysisGraphView.tsx`  | 159  | Reuses DagGraphView with StepAnalysisDto accessors (view-only)                                                                    |
| `components/sop/graph-nodes/SopStepNode.tsx` | ~130 | SOP-specific expanded content wrapper around StepNodeBase                                                                         |

**Consumers:**

- `/app/(protected)/sop/[id]/page.tsx` — main SOP detail page (imports SopGraphView)
- `AnalysisGraphView` — analysis page (imports DagGraphView)
- `OrgChartGraphView` — org chart (imports FullscreenGraphModal + AccessibleGraphControls only, NOT DagGraphView)

### Graph Merge (939 LOC across 10 files)

| File                                                    | LOC | Purpose                                                       |
| ------------------------------------------------------- | --- | ------------------------------------------------------------- |
| `components/sop-graph-merge/SopGraphNew.tsx`            | 62  | Wrapper: ReactFlowProvider + ErrorBoundary                    |
| `components/sop-graph-merge/SopGraphNewContent.tsx`     | 211 | ReactFlow setup, node type router, toolbar, hover card wiring |
| `components/sop-graph-merge/nodes/StartNode.tsx`        | 55  | START: icon + label, green accent, 260px                      |
| `components/sop-graph-merge/nodes/StepNode.tsx`         | 141 | STEP: details, role badge, fork/join chips, analysis data     |
| `components/sop-graph-merge/nodes/EndNode.tsx`          | 54  | END: icon + label, red accent, 260px                          |
| `components/sop-graph-merge/nodes/NodeHoverCard.tsx`    | 215 | Hover popover: enriched step details                          |
| `components/sop-graph-merge/nodes/node-config.ts`       | 46  | Config + layout defaults (260x120, rankSep 150, nodeSep 90)   |
| `components/sop-graph-merge/edges/AnimatedEdge.tsx`     | 55  | Solid smoothstep edge with EdgeLabelRenderer                  |
| `components/sop-graph-merge/hooks/useSopGraphLayout.ts` | 56  | Thin wrapper around useDagLayoutGeneric                       |
| `components/sop-graph-merge/hooks/useNodeHover.ts`      | 44  | Debounced hover state (300ms enter, 150ms leave)              |

### Shared Dependencies (do not modify)

| File                                                 | Used by                         |
| ---------------------------------------------------- | ------------------------------- |
| `lib/hooks/useDagLayoutGeneric.ts` (324 LOC)         | Both Graph A and Graph Merge    |
| `lib/utils/duration-utils.ts`                        | Both (edge duration formatting) |
| `lib/constants/graph-config.ts`                      | Both (ReactFlow config)         |
| `components/graph-nodes/AccessibleGraphControls.tsx` | Both + OrgChartGraphView        |
| `lib/api-client.ts`                                  | SopDto, StepDto, EdgeDto types  |

## Proposed Changes

### Architecture Shift

Replace the monolithic `StepNodeBase` + generic `DagGraphView` with type-specific node components and a dedicated SOP graph orchestrator:

```
BEFORE (Graph A):
SopGraphView → DagGraphView → StepNodeBase (all types)

AFTER (Graph Merge):
SopGraphMerge → SopGraphMergeContent → StartNode | StepNode | EndNode
```

### Key Design Changes

**1. Node Architecture** — Replace `StepNodeBase` (one component, all types via prop branching) with three separate components (`StartNode`, `StepNode`, `EndNode`). Each node type has distinct content — START/END are compact (icon + label), STEP is richer (details, role badge, fork/join, analysis data).

**2. Node Styling** — Orange background/border with left-border accents per role: green (START), orange (STEP), blue (fork), purple (join), red (END). All nodes 260px wide, 120px dagre height.

**3. Interaction Model** — Replace click-to-expand (forces dagre re-layout) with hover-to-inspect (floating card, graph stays stable). Click toggles selection ring only.

**4. Edge Rendering** — Replace ReactFlow native edge labels with custom `AnimatedEdge` component using `getSmoothStepPath` + `EdgeLabelRenderer`. Duration labels from `EdgeDto.transitionDuration`.

**5. Layout** — Thin `useSopGraphLayout` wrapper around shared `useDagLayoutGeneric`. Direction toggle (TB/LR). Standardized spacing (rankSep 150, nodeSep 90).

**6. Edit Mode** — Port `useDagEditing` to work with Graph Merge's node type router. Edge creation/deletion, node type changes via toolbar.

**7. Validation** — Port `DagValidationPanel` as a child of the new orchestrator.

### Feature Gap: What Graph Merge Must Gain

| Feature                                               | Graph A Source                         | Effort            | Priority                       |
| ----------------------------------------------------- | -------------------------------------- | ----------------- | ------------------------------ |
| Edit mode (edge creation/deletion, node type changes) | `useDagEditing` (417 LOC)              | High (~400 LOC)   | P0 — Required                  |
| Validation panel                                      | `DagValidationPanel` (260 LOC)         | Medium (~150 LOC) | P0 — Required                  |
| Keyboard navigation (Escape/Enter/Space)              | `DagGraphView` lines 180-220           | Low (~50 LOC)     | P1 — Should have               |
| Edge duration color-coding (green/red)                | `useDagLayoutGeneric` edge label logic | Low (~30 LOC)     | P2 — Nice to have              |
| FullscreenGraphModal for mobile                       | `DagGraphView`                         | Low (~50 LOC)     | P2 — Test responsiveness first |

### Files Affected

**New files (in `components/sop-graph-merge/` or promoted to `components/sop/`):**

- Already exist from prototype — promote and refine

**Modified files:**

- `app/(protected)/sop/[id]/page.tsx` — swap SopGraphView → SopGraphMerge
- `components/sop-graph-merge/SopGraphNewContent.tsx` — add edit mode integration
- `lib/hooks/useDagEditing.ts` — adapt to work with Graph Merge's node type pattern

**Kept as-is (not migrated yet):**

- `components/analysis/AnalysisGraphView.tsx` — stays on DagGraphView until SOP graph stabilizes
- `components/org/OrgChartGraphView.tsx` — unrelated, uses different data structures

**Deprecated after migration:**

- `components/graph-nodes/StepNodeBase.tsx` — replaced by separate node components
- `components/graph-nodes/step-node-config.ts` — replaced by `node-config.ts`
- `components/sop/graph-nodes/SopStepNode.tsx` — replaced by StepNode + hover card
- `components/graph-nodes/DagGraphView.tsx` — kept temporarily for AnalysisGraphView

## Alternatives Considered

**1. Incremental refactor of Graph A in-place** — Modify StepNodeBase to support both monolithic and type-specific modes. Rejected: introduces complex branching and doesn't clean up the architecture. The click-to-expand pattern is fundamentally incompatible with the hover-to-inspect goal.

**2. Keep Graph A and Graph Merge as parallel implementations** — Use Graph Merge for view-only contexts and Graph A for editing. Rejected: maintaining two graph implementations doubles maintenance burden and causes visual inconsistency between edit and view modes.

**3. Migrate AnalysisGraphView simultaneously** — Port the analysis graph to Graph Merge in the same effort. Rejected: AnalysisGraphView uses `GraphStepTraceDto` (not `StepDto`) and has different expanded content (event counts, log lines, timestamps). Migrating it adds scope without clear benefit. Better to stabilize SOP graph first.

## Resolved Questions

1. **Hover cards in edit mode** — Hover cards show when no node is selected. When a node is selected (for edge creation source/target), only the selected node's card appears. This prevents visual noise during edge creation while preserving discoverability in browse mode.

2. **Directory naming** — Promote `components/sop-graph-merge/` to `components/sop/graph/` after migration. The prototype directory name was temporary.

3. **DagGraphView deprecation** — Deprecate immediately once full functionality match is confirmed. In the interim, remap the old Graph A to a `/old` preview path so it remains accessible for comparison but is no longer the default.

## Implementation Plan

### Phase 1: Edit Mode Integration

- [ ] Port `useDagEditing` to work with Graph Merge's node type router (adapt source/target handle interaction)
- [ ] Add edit mode toggle to `SopGraphNewContent` toolbar
- [ ] Add edge creation UI (source selection highlight, target click)
- [ ] Add edge deletion (click edge → confirm dialog)
- [ ] Add node type change controls (toolbar or context menu)
- [ ] Test edge creation/deletion with real SOP data

### Phase 2: Validation Panel

- [ ] Port `DagValidationPanel` to work alongside `SopGraphNewContent`
- [ ] Wire validation errors/warnings from SOP data into the panel
- [ ] Make validation items clickable to select/focus affected nodes

### Phase 3: Switch Main SOP Page

- [ ] Promote `components/sop-graph-merge/` → `components/sop/graph/` (update all imports)
- [ ] Replace `SopGraphView` import in `app/(protected)/sop/[id]/page.tsx` with the promoted graph
- [ ] Pass required props (SOP data, edit callbacks, validation state)
- [ ] Verify all edit operations work end-to-end
- [ ] Remap old Graph A to `/preview/old-graph` path for comparison

### Phase 4: Polish & Keyboard Navigation

- [ ] Implement conditional hover card: show on hover when no node selected, show only selected node's card when one is selected
- [ ] Add keyboard handlers: Escape to deselect, Enter/Space for node interaction
- [ ] Add edge duration color-coding to `AnimatedEdge` (green < 1 week, red >= 1 week)
- [ ] Test mobile responsiveness; add FullscreenGraphModal wrapper if needed
- [ ] Rename `AnimatedEdge` → `SopEdge` and edge type `'animated'` → `'sopEdge'`

### Phase 5: Cleanup & Deprecation

- [ ] Delete `StepNodeBase.tsx`, `step-node-config.ts`, `SopStepNode.tsx`
- [ ] Delete `SopGraphView.tsx` (replaced by promoted graph)
- [ ] Deprecate `DagGraphView` — remap AnalysisGraphView to use the new graph or keep temporarily
- [ ] Delete old `sop-graph-merge/` directory (already promoted to `sop/graph/`)
- [ ] Remove preview pages for Graph B if no longer needed
- [ ] Update CLAUDE.md project structure section

### Phase 6: Analysis Graph Migration

- [ ] Migrate `AnalysisGraphView` from `DagGraphView` to the new graph architecture
- [ ] Create analysis-specific node content (event counts, log lines, timestamps)
- [ ] Delete `DagGraphView` once no consumers remain
- [ ] Remove `/preview/old-graph` path
