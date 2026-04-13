# Roadmap Backlog

---

### Activity Events Feature

- **Slug**: `activity-events`
- **Added**: 2025-01-01
- **Status**: rfc:activity-events

Activity event management and analysis feature implementation including API client updates and UI components.

**Context**:

- Introduced ActivityEvent CRUD and analysis integration
- Touched `lib/api-client.ts`, settings components, analysis components

---

### Analysis Graph Refactoring

- **Slug**: `analysis-graph-refactoring`
- **Added**: 2025-01-01
- **Status**: rfc:analysis-graph-refactoring

Refactor the analysis page graph to improve trace visualization and step-level detail rendering.

**Context**:

- Refactored `components/analysis/AnalysisGraphView.tsx` and related components
- Improved expanded step content and trace display

---

### Analysis Timing Display

- **Slug**: `analysis-timing-display`
- **Added**: 2025-01-01
- **Status**: rfc:analysis-timing-display

Add timing information display to the analysis graph edges and step nodes.

**Context**:

- Added duration display to analysis graph edges
- Created `lib/utils/duration-utils.ts` for formatting

---

### API Client Integration

- **Slug**: `api-client-integration`
- **Added**: 2025-01-01
- **Status**: rfc:api-client-integration

Initial API client setup and integration with backend endpoints.

**Context**:

- Created `lib/api-client.ts` with typed endpoint functions
- Established API client patterns used throughout the app

---

### API Client Updates

- **Slug**: `api-client-updates`
- **Added**: 2025-01-01
- **Status**: rfc:api-client-updates

Incremental API client updates to align with evolving backend endpoints.

**Context**:

- Updated endpoint signatures and DTOs in `lib/api-client.ts`

---

### API Client Alignment

- **Slug**: `api-client-alignment`
- **Added**: 2025-01-01
- **Status**: rfc:api-client-alignment

Align API client with backend OpenAPI spec changes.

**Context**:

- Synced `lib/api-client.ts` types and endpoints with OpenAPI spec
- Related to `docs/postman/openapi.json`

---

### Auth Integration Alignment

- **Slug**: `auth-alignment`
- **Added**: 2025-01-01
- **Status**: rfc:auth-alignment

Align frontend auth flow with backend JWT authentication changes.

**Context**:

- Updated `lib/auth-context.tsx`, `middleware.ts`
- Coordinated with `jwt-authentication` work

---

### DAG Implementation Plan

- **Slug**: `dag-implementation`
- **Added**: 2025-01-01
- **Status**: rfc:dag-implementation

SOP DAG validation and step management implementation.

**Context**:

- Built `components/sop/SopGraphView.tsx` and graph node components
- Implemented DAG validation rules (cycles, start/end checks)

---

### DTO Refactor Alignment

- **Slug**: `dto-refactor-alignment`
- **Added**: 2025-01-01
- **Status**: rfc:dto-refactor-alignment

API client OpenAPI migration to align DTOs with backend schema.

**Context**:

- Refactored DTO types in `lib/api-client.ts`
- Migration from older type shapes to OpenAPI-generated structure

---

### E2 VM Deployment Infrastructure

- **Slug**: `e2-vm-deployment`
- **Added**: 2025-01-01
- **Status**: rfc:e2-vm-deployment

Set up deployment infrastructure for E2 VM hosting.

**Context**:

- Created deployment scripts and configuration
- Related guide at `docs/e2-vm-deployment-guide.md`

---

### Employee UI Implementation

- **Slug**: `employee-ui`
- **Added**: 2025-01-01
- **Status**: rfc:employee-ui

Employee management UI components and org chart visualization.

**Context**:

- Built `components/org/` components
- Created employee CRUD and org chart ReactFlow view

---

### Full UI Redesign

- **Slug**: `full-redesign`
- **Added**: 2025-01-01
- **Status**: rfc:full-redesign

Comprehensive UI redesign using shadcn components.

**Context**:

- Migrated from custom components to shadcn/ui library
- Touched nearly all page and component files

---

### Graph Merge Migration

- **Slug**: `graph-merge-migration`
- **Added**: 2026-04-06
- **Status**: implemented

Migrate the main SOP graph (Graph A) to the Graph Merge design combining the best of Graph A and Graph B.

**Context**:

- RFC at `docs/roadmap/m1/graph-merge-migration.md`
- Implemented at `components/sop/graph/` (promoted from `sop-graph-merge/`)
- Analysis graph migrated to `components/analysis/AnalysisGraphNew.tsx`
- Legacy files pending deletion once parity confirmed

---

### JWT Authentication Frontend

- **Slug**: `jwt-authentication`
- **Added**: 2025-01-01
- **Status**: rfc:jwt-authentication

JWT-based authentication implementation on the frontend.

**Context**:

- Built `lib/auth-context.tsx`, `middleware.ts`, login page
- Session management and protected route middleware

---

### Log Line Refactor

- **Slug**: `logline-refactor`
- **Added**: 2025-11-14
- **Status**: rfc:logline-refactor

Refactor log line display and query components.

**Context**:

- Refactored `components/ui/LogLinesTable.tsx` and query builder
- Improved type safety with `lib/utils/logline-type-guards.ts`

---

### Log Line Table Display Page

- **Slug**: `logline-table-display`
- **Added**: 2025-01-01
- **Status**: rfc:logline-table-display

Implementation of the `/log/lines` query page.

**Context**:

- Built `app/(protected)/log/lines/page.tsx`
- Query builder with 9 query method types

---

### OpenAPI Alignment

- **Slug**: `openapi-alignment`
- **Added**: 2025-01-01
- **Status**: rfc:openapi-alignment

Align frontend with OpenAPI spec for type safety and endpoint consistency.

**Context**:

- Updated `lib/api-client.ts` against `docs/postman/openapi.json`
- Ensured DTO shapes match backend contracts

---

### Per-SOP Analysis Page

- **Slug**: `per-sop-analysis-page`
- **Added**: 2025-01-01
- **Status**: rfc:per-sop-analysis-page

Refactor analysis into per-SOP pages with two-level async task processing.

**Context**:

- Built `app/(protected)/sop/[id]/analysis/page.tsx`
- Real-time polling, progress bars, Gemini AI integration

---

### Prettier Setup

- **Slug**: `prettier-setup`
- **Added**: 2025-01-01
- **Status**: rfc:prettier-setup

Set up Prettier formatting across the project.

**Context**:

- Configured Prettier 3 with no semicolons, single quotes
- Added format scripts to `package.json`

---

### shadcn Refactor

- **Slug**: `shadcn-refactor`
- **Added**: 2025-01-01
- **Status**: rfc:shadcn-refactor

Migrate custom components to shadcn/ui component library.

**Context**:

- Replaced custom form, table, dialog components with shadcn equivalents
- ~97 components now in `components/ui/`

---

### UI Updates Phase 1-3

- **Slug**: `ui-updates-phase1-3`
- **Added**: 2025-01-01
- **Status**: rfc:ui-updates-phase1-3

ActivityEvent, LogLines Query, and Dashboard Statistics UI updates.

**Context**:

- Multi-phase UI improvement across settings, log query, and dashboard pages

---

### UX Refactor

- **Slug**: `ux-refactor`
- **Added**: 2025-01-01
- **Status**: rfc:ux-refactor

Full UX refactoring pass across the application.

**Context**:

- Comprehensive UX improvements to navigation, forms, and data display

---

### UX Refactor Implementation

- **Slug**: `ux-refactor-impl`
- **Added**: 2025-01-01
- **Status**: rfc:ux-refactor-impl

Implementation details for the UX refactor migration to shadcn/ui.

**Context**:

- Execution of the UX refactor plan with component-by-component migration

---

### UX/UI Improvements

- **Slug**: `ux-ui-improvements`
- **Added**: 2025-01-01
- **Status**: rfc:ux-ui-improvements

Targeted UX/UI improvements for usability and consistency.

**Context**:

- Polished existing pages for better user experience
- Focused on form validation, loading states, error handling

---

### Event Categories Management

- **Slug**: `event-categories-management`
- **Added**: 2026-04-09
- **Status**: backlog

Build CRUD UI for event categories (`/api/event-categories`) — list, create, edit, delete event categories that define the cross-platform taxonomy for classifying audit log events.

**Context**:

- Backend has 6 endpoints: list all, create, delete all, get by ID, get by name, update
- `EventCategory` enum already used in frontend: `lib/api-client.ts`, query builder, activity event settings, log line helpers
- No frontend integration exists yet — no API client methods for `/api/event-categories`
- Could integrate into Settings page alongside existing `ActivityEventManagementTab`

---

### Reference Data Management

- **Slug**: `reference-data-management`
- **Added**: 2026-04-09
- **Status**: backlog

Build UI for managing pillars (`/api/pillars`) and role titles (`/api/role-titles`) — CRUD operations for organizational pillars and the global role title taxonomy.

**Context**:

- Backend has 3 pillar endpoints (list, create, delete all) and 5 role title endpoints (list, create, delete all, get/update by ID)
- `RoleTitle` enum is hardcoded in frontend (`lib/api-client.ts`, ~60 values) — backend now manages these dynamically
- No frontend integration exists yet — no API client methods for `/api/pillars` or `/api/role-titles`
- Natural fit in Settings page or a dedicated admin Reference Data tab

---

### Audit Event Viewer

- **Slug**: `audit-event-viewer`
- **Added**: 2026-04-09
- **Status**: backlog

Build admin page for querying audit events (`/api/audit`) — search by category, company, date range, entity, or user with a filterable table and date range picker.

**Context**:

- Backend has 5 query endpoints: by-category, by-company, by-date-range, by-entity, by-user
- No frontend integration exists — no API client methods, no UI, no route
- Could reuse existing `@tanstack/react-table` patterns from log lines page
- Admin-only feature; would need new route under `/admin/audit`

---

### System Statistics Dashboard

- **Slug**: `statistics-dashboard`
- **Added**: 2026-04-09
- **Status**: backlog

Build statistics overview page using `/api/statistics` endpoints (overview, sop, log, analysis, async, db/tables, db/indexes). Rich dashboard with charts showing system metrics.

**Context**:

- Backend has 8 endpoints: overview, sop metrics, log metrics, analysis metrics, async metrics, table sizes, index usage, sync counts
- Frontend `getLogLineStatistics()` currently points to non-existent `/api/log/lines/statistics` — needs migration to `/api/statistics/log`
- `LogStatisticsWidget` on home page (`components/dashboard/LogStatisticsWidget.tsx`) currently uses the broken endpoint
- `recharts` already installed for data visualization; `/health` page pattern can be extended
- `syncDbCounts` already fixed to point to `/api/statistics/db/sync-counts`

---

### Analysis Results Admin

- **Slug**: `analysis-results-admin`
- **Added**: 2026-04-09
- **Status**: backlog

Build admin UI for viewing and managing analysis results (`/api/admin/analysis-results`) — view results per SOP/step, delete stale results, bulk clear all.

**Context**:

- Backend has 6 endpoints: get/delete by SOP, get/delete by step, delete by activity event, delete all
- Frontend cache methods already updated to point to `/api/admin/analysis-results/*` URLs
- `components/analysis/SopCacheStatus.tsx` uses `getSopCacheInfo`/`invalidateSopCache` — already wired to new URLs
- Could build as a tab within the SOP detail page or as a standalone admin page
