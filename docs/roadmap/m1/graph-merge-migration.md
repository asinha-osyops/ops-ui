# Graph Migration Guide: Graph A → Graph Merge

## Purpose

This document describes how to migrate the main SOP graph (Graph A) to the Graph Merge design. Graph Merge is a working prototype at `/preview/graphMerge` built under `components/sop-graph-merge/`. Use it as the reference implementation.

The audience is Claude Code or any developer applying these changes to the main graph codebase.

---

## Architecture Comparison

### Graph A (current main graph)

```
components/sop/SopGraphView.tsx          → Orchestrator (toolbar, edit mode, validation)
components/graph-nodes/DagGraphView.tsx  → ReactFlow wrapper (generic, reusable)
components/graph-nodes/StepNodeBase.tsx  → Single node component (collapsed + expanded states)
components/graph-nodes/step-node-config.ts → Node type styling config
lib/hooks/useDagLayoutGeneric.ts         → dagre layout hook (shared)
```

Key traits:
- One monolithic `StepNodeBase` handles all node types via props
- Click-to-expand pattern: collapsed (220px) and expanded (420px) states
- `DagGraphView` is generic — accepts any step/edge type via accessor pattern
- Edit mode with edge creation/deletion and node type changes
- `FullscreenGraphModal` for mobile
- Uses ReactFlow's built-in edge types (`smoothstep`) with native label properties

### Graph Merge (target design)

```
components/sop-graph-merge/SopGraphNew.tsx          → Wrapper (ErrorBoundary + ReactFlowProvider)
components/sop-graph-merge/SopGraphNewContent.tsx    → ReactFlow setup (toolbar, hover, layout)
components/sop-graph-merge/nodes/StartNode.tsx       → Dedicated START node component
components/sop-graph-merge/nodes/StepNode.tsx        → Dedicated STEP node component
components/sop-graph-merge/nodes/EndNode.tsx         → Dedicated END node component
components/sop-graph-merge/nodes/NodeHoverCard.tsx   → Hover popover for step details
components/sop-graph-merge/nodes/node-config.ts      → Node type config + layout defaults
components/sop-graph-merge/edges/AnimatedEdge.tsx    → Custom solid edge with label renderer
components/sop-graph-merge/hooks/useSopGraphLayout.ts → Thin wrapper around useDagLayoutGeneric
components/sop-graph-merge/hooks/useNodeHover.ts     → Debounced hover state
```

Key traits:
- Separate node components per type (START, STEP, END) — no monolithic base
- Hover-to-inspect pattern (NodeHoverCard) instead of click-to-expand
- Custom edge component with `EdgeLabelRenderer` for duration labels
- No edit mode (view-only for now)
- No FullscreenGraphModal (not yet needed)
- Direction toggle (TB/LR)

---

## Changes by Category

### 1. Node Architecture

**What changed:** Replace `StepNodeBase` (one component, all types) with three separate components.

**Why:** Each node type has distinct content — START/END are compact (icon + label + name), STEP is richer (details, role badge, fork/join indicators, analysis data). Separate components are simpler and avoid prop-driven branching.

**Graph A pattern:**
```tsx
// DagGraphView.tsx — single generic node
function GenericDagNode({ data }) {
  return (
    <StepNodeBase
      stepName={...} nodeType={...} isFork={...}
      isExpanded={data.isExpanded}
      expandedContent={renderExpandedContent?.(step)}
    />
  )
}
const nodeTypes = { dagStepNode: GenericDagNode }
```

**Graph Merge pattern:**
```tsx
// SopGraphNewContent.tsx — router dispatches to typed components
const nodeTypes: NodeTypes = {
  sopGraphNewNode: ({ data, selected, ...rest }) => {
    const step = data.step as StepDto
    switch (step.nodeType) {
      case 'START': return <StartNode data={data} selected={selected} {...rest} />
      case 'END':   return <EndNode data={data} selected={selected} {...rest} />
      default:      return <StepNode data={data} selected={selected} {...rest} />
    }
  },
}
```

**Files to change:**
- Delete: `components/graph-nodes/StepNodeBase.tsx`
- Delete: `components/graph-nodes/step-node-config.ts`
- Create: `nodes/StartNode.tsx`, `nodes/StepNode.tsx`, `nodes/EndNode.tsx`
- Create: `nodes/node-config.ts` (new config format)

### 2. Node Styling — Orange Theme with Left-Border Accents

**What changed:** All node types use an orange background/border. A 4px left border indicates the node's role.

**Graph A:** Unified orange background and border for all types. No left-border differentiation.

**Graph Merge colors:**

| Node state | Background | Border | Left border |
|---|---|---|---|
| START | `bg-orange-50 dark:bg-orange-950/20` | `border-orange-300 dark:border-orange-800` | `border-l-green-500` |
| STEP (normal) | same | same | `border-l-orange-500` |
| STEP (fork) | same | same | `border-l-blue-500 dark:border-l-blue-400` |
| STEP (join) | same | same | `border-l-purple-500 dark:border-l-purple-400` |
| END | same | same | `border-l-destructive` |

Handle colors match the left-border color for each type.

**Reference:** See `components/sop-graph-merge/nodes/StepNode.tsx` lines 44-54 for the fork/join conditional logic.

### 3. Node Sizing — Uniform 260x120

**What changed:** All node types use the same dimensions (260px wide, 120px height reservation for dagre).

**Graph A:** Different sizes — START/END at 220px collapsed, 420px expanded. dagre was told one size but nodes rendered at another.

**Graph Merge:** All nodes render at `style={{ width: 260 }}`. dagre is told `260x120` for all nodes. No expanded state — hover card replaces click-to-expand.

**Config (`node-config.ts`):**
```ts
export const LAYOUT_DEFAULTS = {
  direction: 'TB' as const,
  nodeWidth: 260,
  nodeHeight: 120,
  rankSep: 150,
  nodeSep: 90,
}
```

### 4. Interaction Model — Hover Instead of Expand

**What changed:** Replaced click-to-expand (node grows to 420x540 inline) with hover-to-inspect (floating card positioned near the node).

**Why:** Click-to-expand forces dagre to re-layout the entire graph when a node expands. Hover card is non-destructive — the graph stays stable.

**Graph A pattern:**
- `expandedStepId` state drives dagre layout (expanded nodes get 420x540)
- `StepNodeBase` renders a `ScrollArea` with `expandedContent` when expanded
- Click toggles expand/collapse

**Graph Merge pattern:**
- `useNodeHover` hook manages debounced hover state (300ms enter, 150ms leave)
- `NodeHoverCard` renders as an absolutely-positioned card outside the ReactFlow canvas
- Position calculated from mouse event + container ref offset
- Click toggles selection ring only (no layout change)

**Files:**
- `hooks/useNodeHover.ts` — hover state with debounce
- `nodes/NodeHoverCard.tsx` — floating detail card (shadcn Card component)
- `SopGraphNewContent.tsx` — wires `onNodeMouseEnter`/`onNodeMouseLeave` to ReactFlow

### 5. Edge Style — Solid Smoothstep

**What changed:** Replaced animated dashed bezier edges with solid smoothstep edges.

**Graph A:** Uses ReactFlow's built-in `smoothstep` edge type with native `label`/`labelBgStyle` properties. Labels include color-coding (green < 1 week, red >= 1 week).

**Graph Merge:** Uses a custom edge component (`AnimatedEdge`, now renders solid) with `getSmoothStepPath` and `EdgeLabelRenderer` for labels.

**Edge component (`edges/AnimatedEdge.tsx`):**
```tsx
function SolidEdgeComponent({ id, sourceX, sourceY, targetX, targetY,
                               sourcePosition, targetPosition, markerEnd, data }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({...})
  const label = data?.label as string | undefined

  return (
    <>
      <path id={id} d={edgePath} fill="none" stroke="currentColor"
            strokeWidth={2} markerEnd={markerEnd}
            className="text-muted-foreground transition-all duration-200" />
      {label && (
        <EdgeLabelRenderer>
          <div className="absolute bg-card border border-border rounded-md px-2 py-0.5 text-[10px] ..."
               style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
```

Note: The export name is still `AnimatedEdge` and the edge type is still `'animated'` — rename these when migrating to avoid confusion.

### 6. Edge Labels — Transition Durations

**What changed:** Edge labels show `transitionDuration` from the EdgeDto instead of step order numbers.

**Graph A:** Duration labels are built inside `useDagLayoutGeneric` using ReactFlow's native label properties with color-coded backgrounds.

**Graph Merge:** Duration labels are built in `SopGraphNewContent.tsx` and passed via `data.label` to the custom edge component's `EdgeLabelRenderer`.

**Pattern:**
```tsx
// SopGraphNewContent.tsx
const edgeDtoMap = useMemo(() => {
  const map = new Map<string, EdgeDto>()
  for (const e of sop.edges) map.set(e.id, e)
  return map
}, [sop.edges])

const labeledEdges = useMemo(() =>
  edges.map((edge) => {
    const dto = edgeDtoMap.get(edge.id)
    const duration = dto?.transitionDuration
    const label = duration ? formatEdgeDuration(duration) : undefined
    return { ...edge, type: 'animated', data: { ...edge.data, label } }
  }),
  [edges, edgeDtoMap]
)
```

**Dependency:** `formatEdgeDuration` from `lib/utils/duration-utils.ts` (already exists, reuse as-is).

### 7. Layout Hook — Thin Wrapper

**What changed:** Instead of calling `useDagLayoutGeneric` directly with many args, Graph Merge wraps it in `useSopGraphLayout` with preset config.

**Graph A:** `DagGraphView` calls `useDagLayoutGeneric` directly with 10 arguments.

**Graph Merge (`hooks/useSopGraphLayout.ts`):**
```ts
export function useSopGraphLayout(steps, edges, selectedStepId, direction) {
  const options = useMemo(() => ({
    direction,
    nodeWidth: LAYOUT_DEFAULTS.nodeWidth,
    nodeHeight: LAYOUT_DEFAULTS.nodeHeight,
    rankSep: LAYOUT_DEFAULTS.rankSep,
    nodeSep: LAYOUT_DEFAULTS.nodeSep,
    edgeType: 'animated',
  }), [direction])

  return useDagLayoutGeneric(steps, edges, stepAccessors, edgeAccessors,
                              selectedStepId, null, 'sopGraphNewNode', options)
}
```

Note: `expandedStepId` is always `null` — there is no expand state.

### 8. Direction Toggle

**What changed:** Added a TB/LR toggle button in the toolbar.

**Graph A:** Hardcoded LR direction.

**Graph Merge:** `direction` state in `SopGraphNewContent.tsx`, toggled by a button, passed through to `useSopGraphLayout` → dagre's `rankdir`.

### 9. Component Wrapper

**What changed:** Simplified the wrapper — no `FullscreenGraphModal`, no edit mode toolbar.

**Graph A (`SopGraphView.tsx` + `DagGraphView.tsx`):**
- `SopGraphView`: edit mode state, edge creation UI, validation panel, node type change controls
- `DagGraphView`: stats bar, `FullscreenGraphModal`, `ErrorBoundary`, ReactFlow

**Graph Merge (`SopGraphNew.tsx` + `SopGraphNewContent.tsx`):**
- `SopGraphNew`: empty state check, `ErrorBoundary`, `ReactFlowProvider`
- `SopGraphNewContent`: stats bar, direction toggle, ReactFlow, hover card

---

## Shared Dependencies (do not modify)

These files are used by both Graph A and Graph Merge. Do not change them during migration:

| File | Used for |
|---|---|
| `lib/hooks/useDagLayoutGeneric.ts` | dagre layout calculation |
| `lib/utils/duration-utils.ts` | `formatEdgeDuration`, threshold checks |
| `lib/constants/graph-config.ts` | ReactFlow config constants |
| `components/graph-nodes/AccessibleGraphControls.tsx` | Zoom/fit controls |
| `lib/api-client.ts` | `SopDto`, `StepDto`, `EdgeDto` types |

---

## What Graph Merge Does NOT Yet Have

These Graph A features are not in Graph Merge. Decide whether to port them:

1. **Edit mode** — edge creation/deletion, node type changes (`useDagEditing` hook)
2. **DagValidationPanel** — collapsible error/warning display
3. **FullscreenGraphModal** — mobile bottom sheet for the graph
4. **Keyboard navigation** — Escape to deselect, Enter/Space to expand
5. **Edge color-coding** — green/red label backgrounds based on duration threshold

---

## Migration Checklist

When applying these changes to the main graph:

- [ ] Create separate node components (StartNode, StepNode, EndNode) under a new directory
- [ ] Apply orange theme with left-border accents to all nodes
- [ ] Standardize node sizing to 260x120 everywhere (config, dagre, render)
- [ ] Replace click-to-expand with hover card (useNodeHover + NodeHoverCard)
- [ ] Replace animated/bezier edges with solid smoothstep edge component
- [ ] Switch edge labels from native ReactFlow labels to EdgeLabelRenderer with duration data
- [ ] Add direction toggle (TB/LR)
- [ ] Update dagre spacing: rankSep=150, nodeSep=90
- [ ] Decide which Graph A features to preserve (edit mode, validation, mobile, keyboard nav)
- [ ] Remove unused code (StepNodeBase, old step-node-config, FullscreenGraphModal if not needed)
