# ops-ui

## Critical Instructions

### UX Design

When building new UI, prefer using existing components and built-in functionality from these libraries:

- **shadcn/ui** - Buttons, forms, dialogs, tables, tabs, cards, etc. (~97 components in `components/ui/`)
- **Radix UI** - Primitives underlying shadcn (accordion, collapsible, popover, etc.)
- **React Hook Form + Zod** - Form state and validation
- **ReactFlow** - Graph/DAG visualization
- **@dnd-kit** - Drag and drop (`@dnd-kit/core`, `@dnd-kit/sortable`)
- **@tanstack/react-table** - Data tables
- **@tanstack/react-virtual** - Virtual scrolling for large lists
- **recharts** - Charts and data visualization
- **Lucide React** - Icons
- **sonner** - Toast notifications

### Coding Style

- **Mobile-first**: Keep mobile view in mind when designing layouts
- **Theming**: Use CSS variables and Tailwind classes that respect dark/light mode (via `next-themes`)
- **Post-changes**: Run `npm run format` after code changes to format the repo

### Plan Implementation RFCs

When a plan implementation is complete, save the implementation summary as `{plan_name}_rfc.md` to `docs/rfc/`. Include:

- What was implemented
- Key files changed
- Design decisions made
- Testing performed

### Server Startup

**DO NOT run the server** (`npm run dev`) unless explicitly instructed. Wait for user confirmation that the server is already running before continuing with tasks that require it.

---

## Project Overview

A Next.js-based web application for managing Standard Operating Procedures (SOPs), Companies, Employees, Logs, and Activity Events. The UI provides:

- Creating and visualizing SOPs as DAG workflows
- Managing organizational structures with org chart visualization
- Analyzing SOP execution through log line matching
- Two-level async task processing with real-time status updates
- Authentication with protected/public route separation
- Admin dashboard for system health monitoring

## Technology Stack

| Category            | Technology                                      |
| ------------------- | ----------------------------------------------- |
| Framework           | Next.js 15 (App Router)                         |
| Language            | TypeScript 5                                    |
| Runtime             | React 19                                        |
| Styling             | Tailwind CSS v4                                 |
| UI Components       | shadcn/ui (~97 components, Radix UI primitives) |
| Form Management     | React Hook Form + Zod v4 validation             |
| Graph Visualization | ReactFlow + dagre layout                        |
| Tables              | @tanstack/react-table                           |
| Virtual Scrolling   | @tanstack/react-virtual                         |
| Error Boundaries    | react-error-boundary                            |
| Theme               | next-themes (dark mode)                         |
| Drag & Drop         | @dnd-kit/core, @dnd-kit/sortable                |
| Charts              | recharts                                        |
| Date Handling       | date-fns                                        |
| Linting             | ESLint 9 (flat config)                          |
| Formatting          | Prettier 3                                      |

## Project Structure

```
ops-ui/
├── app/
│   ├── globals.css              # Global styles with CSS variables
│   ├── layout.tsx               # Root layout
│   │
│   ├── (public)/                # Unauthenticated routes
│   │   ├── layout.tsx           # Public layout (no sidebar)
│   │   ├── page.tsx             # Landing page
│   │   ├── login/page.tsx       # Login page
│   │   ├── about/page.tsx       # About page
│   │   └── contact/page.tsx     # Contact page
│   │
│   └── (protected)/             # Authenticated routes (requires login)
│       ├── layout.tsx           # Protected layout (sidebar, auth check)
│       ├── home/page.tsx        # Dashboard home
│       │
│       ├── sop/                 # SOP management
│       │   ├── page.tsx         # SOP list
│       │   ├── SopPageContent.tsx
│       │   ├── create/page.tsx  # Create SOP
│       │   └── [id]/
│       │       ├── page.tsx     # SOP detail (Graph/Steps/File tabs)
│       │       └── analysis/page.tsx  # SOP analysis
│       │
│       ├── log/                 # Log management
│       │   ├── page.tsx         # Log list
│       │   ├── LogPageContent.tsx
│       │   ├── create/page.tsx  # Upload log
│       │   ├── [id]/page.tsx    # Log detail
│       │   └── lines/page.tsx   # Log line query
│       │
│       ├── company/             # Company management
│       │   ├── page.tsx         # Company list
│       │   ├── CompanyPageContent.tsx
│       │   └── create/page.tsx  # Create company
│       │
│       ├── org/                 # Organization chart
│       │   ├── page.tsx
│       │   └── OrgPageContent.tsx
│       │
│       ├── settings/            # Settings
│       │   ├── page.tsx
│       │   └── SettingsPageContent.tsx
│       │
│       └── admin/               # Admin section
│           ├── health/page.tsx  # System health
│           └── users/page.tsx   # User management
│
├── components/
│   ├── ui/                      # shadcn/ui + custom components (~97 files)
│   │   ├── button.tsx, input.tsx, form.tsx, table.tsx, tabs.tsx
│   │   ├── LoadableContent.tsx  # Loading/empty state wrapper
│   │   ├── ConfirmDialog.tsx    # Confirmation dialogs
│   │   ├── LogLinesTable.tsx    # Log line display
│   │   ├── query-builder/       # Query builder components
│   │   └── ...
│   │
│   ├── graph-nodes/             # Reusable graph components
│   │   ├── DagGraphView.tsx     # Generic DAG visualization
│   │   ├── StepNodeBase.tsx     # Base step node for ReactFlow
│   │   └── AccessibleGraphControls.tsx
│   │
│   ├── sop/                     # SOP-specific components
│   │   ├── SopGraphView.tsx     # SOP DAG with edge editing
│   │   ├── DagValidationPanel.tsx
│   │   ├── AddStepModal.tsx
│   │   ├── SopEditModal.tsx
│   │   ├── StepManager.tsx
│   │   ├── StepTableEditor.tsx
│   │   └── graph-nodes/SopStepNode.tsx
│   │
│   ├── analysis/                # Analysis components
│   │   ├── AnalysisGraphView.tsx
│   │   ├── AnalysisStepExpandedContent.tsx
│   │   ├── AnalysisStepFooter.tsx
│   │   ├── TraceSopStepsResults.tsx
│   │   ├── SopAnalysisDisplay.tsx
│   │   ├── LogAnalysisDisplay.tsx
│   │   ├── GeminiAnalysisSection.tsx
│   │   └── SopCacheStatus.tsx
│   │
│   ├── org/                     # Org chart components
│   │   ├── OrgChartGraphView.tsx
│   │   ├── graph-nodes/EmployeeNode.tsx
│   │   └── hooks/useOrgChartData.ts
│   │
│   ├── settings/                # Settings components
│   │   ├── ActivityEventManagementTab.tsx
│   │   ├── CompanyManagementTab.tsx
│   │   └── RoleTableView.tsx
│   │
│   ├── admin/                   # Admin components
│   │   ├── DatabaseHealthCard.tsx
│   │   ├── DatabaseTablesPanel.tsx
│   │   ├── SystemHealthCard.tsx
│   │   └── SystemStatusQuickView.tsx
│   │
│   ├── auth/                    # Auth components
│   │   ├── AuthLoadingScreen.tsx
│   │   └── ChangePasswordModal.tsx
│   │
│   ├── landing/                 # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── contact-form.tsx
│   │   └── logo.tsx
│   │
│   ├── dashboard/               # Dashboard widgets
│   │   └── LogStatisticsWidget.tsx
│   │
│   ├── app-sidebar.tsx          # Main navigation sidebar
│   ├── PageLayout.tsx           # Page layout wrapper
│   ├── theme-provider.tsx       # Theme context
│   ├── theme-toggle.tsx         # Dark/light mode toggle
│   ├── logo.tsx                 # App logo
│   └── logo-expanded.tsx        # Expanded logo variant
│
├── lib/
│   ├── api-client.ts            # API client (all endpoints)
│   ├── api-client-helpers.ts    # HTTP request wrappers
│   ├── api-constants.ts         # Headers, limits, file types
│   ├── app-context.tsx          # Global state (company, employees, roles, SOPs, logs)
│   ├── auth-context.tsx         # Authentication state
│   ├── auth-constants.ts        # Auth configuration
│   ├── routes.ts                # Route definitions + breadcrumbs
│   ├── utils.ts                 # cn() utility
│   │
│   ├── hooks/                   # Domain hooks (~30 files)
│   │   ├── useColorScheme.ts
│   │   ├── useDagLayoutGeneric.ts
│   │   ├── useDagEditing.ts
│   │   ├── useDeleteConfirmation.ts
│   │   ├── useDownload.ts
│   │   ├── useEntities.ts
│   │   ├── useEnrichedLogLines.ts
│   │   ├── useEmployeeManagement.ts
│   │   ├── useFileUpload.ts
│   │   ├── useValidatedFileUpload.ts
│   │   ├── useRequireAuth.ts
│   │   ├── useRequireCompany.tsx
│   │   ├── useAnalysis.ts
│   │   └── ...
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   ├── sop.ts, log.ts, company.ts, employee.ts
│   │   ├── role.ts, activityevent.ts
│   │   └── schema-builders.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── analysis-transforms.ts
│   │   ├── analysis-constants.ts
│   │   ├── logline-helpers.ts
│   │   ├── logline-type-guards.ts
│   │   ├── duration-utils.ts
│   │   ├── format-helpers.ts
│   │   ├── text-formatters.ts
│   │   ├── notifications.ts
│   │   ├── error-handling.ts
│   │   ├── colorscheme-generator.ts
│   │   └── entity-presets.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   ├── colorscheme.ts
│   │   └── logline-query.ts
│   │
│   ├── config/
│   │   └── logline-query-config.ts
│   │
│   ├── constants/
│   │   ├── ui-strings.ts
│   │   └── graph-config.ts
│   │
│   └── landing/
│       └── constants.ts
│
├── hooks/                       # Root-level hooks
│   ├── use-mobile.tsx
│   ├── use-task-polling.ts
│   ├── use-analysis-polling.ts
│   ├── use-analysis-cache.ts
│   └── use-scroll-fade.ts
│
├── middleware.ts                # Auth middleware (route protection)
│
├── docs/
│   ├── rfc/                     # Implementation RFCs
│   ├── postman/                 # API collections
│   ├── howto/                   # How-to guides
│   └── ideas/                   # Feature ideas
│
└── public/                      # Static assets
```

## Key Features

### 1. Authentication & Authorization

- Login/logout with session management
- Protected route middleware (`middleware.ts`)
- Auth context for user state
- Password change functionality

### 2. SOP Management (`/sop`)

- SOPs modeled as Directed Acyclic Graphs (DAGs)
- ReactFlow-based interactive graph editor
- Node types: START, STEP, END
- Fork/Join support for parallel paths
- Edge creation/deletion with validation
- Real-time DAG validation

**Validation Errors (Blocking):**

- NO_START_NODE, MULTIPLE_START_NODES
- CYCLE_DETECTED
- START_HAS_PREDECESSORS, END_HAS_SUCCESSORS

**Validation Warnings (Non-blocking):**

- NO_END_NODE, UNREACHABLE_NODE
- DANGLING_NODE, ORPHAN_NODE

### 3. SOP Analysis (`/sop/[id]/analysis`)

**Two-Level Async Task Processing:**

1. Step-level activity event filtering (Gemini AI)
2. Log line matching for each activity event

**Features:**

- Real-time polling with progress bars
- DAG visualization of trace results
- Expandable step nodes with matching activity events and log lines
- Edge transition durations
- Keyboard shortcuts (Cmd+Enter to start, Escape to cancel)

### 4. Org Chart (`/org`)

- Interactive employee hierarchy visualization
- Lazy loading of direct reports
- Navigate up (manager chain) or down (direct reports)

### 5. Log Management (`/log`)

**Log Line Types:** GOOGLE_DRIVE, GOOGLE_MAIL, GOOGLE_TASKS, GOOGLE_DEVICE

**Query Methods (9 types):**

- By Actor, Owner, Event Type, Domain, IP Address
- By Date Range, User, Sharing Detection
- Multi-Attribute query

### 6. Admin Dashboard (`/admin`)

- System health monitoring
- Database status
- User management

## Global State

**AppContext** (`lib/app-context.tsx`):
| State | Description |
|-------|-------------|
| `selectedCompany` | Currently selected company |
| `employees` | Map<id, EmployeeDto> |
| `roles` | Map<id, RoleDto> |
| `sops` | Map<id, SopDto> |
| `logs` | Map<id, LogDto> |
| `activityEvents` | Map<id, ActivityEventDto> |
| `colorScheme` | Generated color scheme |

**AuthContext** (`lib/auth-context.tsx`):
| State | Description |
|-------|-------------|
| `user` | Current authenticated user |
| `isAuthenticated` | Auth status |
| `isLoading` | Auth loading state |

## Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.158:8080
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (0.0.0.0:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all files
npm run format:check # Prettier check (CI)
```

## Code Style

- **Formatter:** Prettier (no semicolons, single quotes, 2-space indent)
- **Linter:** ESLint 9 with Next.js core-web-vitals
- **Format on save:** Enabled via `.vscode/settings.json`

## Key Patterns

### Form Pattern (React Hook Form + Zod)

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { name: '', description: '' }
})

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name *</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Error Boundary Pattern

```typescript
<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setResults(null)}>
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
</ErrorBoundary>
```

### Memoization Pattern

```typescript
const LogLineRow = memo(function LogLineRow({ logLine }: Props) {
  // Component implementation
})
```

## Type System

### Key DTOs

| DTO                 | Description                              |
| ------------------- | ---------------------------------------- |
| `SopDto`            | SOP with steps, edges, validation status |
| `StepDto`           | Step with nodeType, isFork, isJoin       |
| `EdgeDto`           | Edge with transitionDuration (traces)    |
| `GraphStepTraceDto` | Enriched step for analysis               |
| `OrgChartNodeDto`   | Employee node for org chart              |

### Enums

| Enum               | Values                                                 |
| ------------------ | ------------------------------------------------------ |
| `LogLineType`      | GOOGLE_DRIVE, GOOGLE_MAIL, GOOGLE_TASKS, GOOGLE_DEVICE |
| `StepNodeType`     | START, STEP, END                                       |
| `ProcessingStatus` | PENDING, PROCESSING, COMPLETED, FAILED                 |
| `RoleTitle`        | 60+ values                                             |

## Testing

- "Fill" buttons on create pages for quick form population
- Sample companies for testing
- JSON editors generate UUIDs for sample data
