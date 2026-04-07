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
- **Status**: rfc:graph-merge-migration

Migrate the main SOP graph (Graph A) to the Graph Merge design combining the best of Graph A and Graph B.

**Context**:
- Migration guide at `docs/roadmap/m1/graph-merge-migration.md`
- Reference implementation at `components/sop-graph-merge/`
- Covers node architecture, styling, sizing, interaction model, edge style, layout changes

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
