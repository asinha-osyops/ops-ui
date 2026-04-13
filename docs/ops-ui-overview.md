# ops-ui Repository Overview

## 1. PROJECT TYPE AND PURPOSE

**Project Name:** ops-ui
**Type:** Full-stack Operations Management Portal - SOP (Standard Operating Procedure) Management Web Application
**Purpose:** A web-based interface for creating, managing, and distributing standard operating procedures (SOPs) within organizations. The platform allows users to define operational processes with clear steps, assign roles and responsibilities, and maintain a centralized SOP repository.

**Target Users:**

- Operations managers
- Team leads
- Business process documentation specialists
- Company administrators

**Core Features:**

- Create and edit SOPs with a rich, interactive form
- Define operational roles and responsibilities
- Document step-by-step procedures with monitoring and post-step documentation
- Reorder steps and roles via drag-and-drop
- View and manage all SOPs in a central portal
- Export SOPs as JSON or formatted text documents
- Delete SOPs with confirmation
- Pre-filled test data templates for development

---

## 2. TECHNOLOGY STACK

### Framework & Runtime

- **Next.js 15.0.0** - React meta-framework for full-stack applications with App Router (next/app directory structure)
- **React 19.0.0** - UI library for building interactive components
- **TypeScript 5** - Type-safe JavaScript for better code quality and developer experience

### UI & Styling

- **Tailwind CSS 3.4.1** - Utility-first CSS framework for responsive, modern styling
- **PostCSS 8** - Tool for transforming CSS with plugins (used with Tailwind)
- **Autoprefixer 10** - Automatically adds vendor prefixes for browser compatibility

### Frontend Libraries

- **@dnd-kit (Drag and Drop):**
  - @dnd-kit/core 6.3.1 - Core drag-and-drop functionality
  - @dnd-kit/sortable 10.0.0 - Sortable list implementation
  - @dnd-kit/utilities 3.2.2 - Helper utilities for drag-and-drop
- **uuid 13.0.0** - UUID generation for unique IDs

### Development Tools

- **ESLint 8** - Code quality and style linting
- **eslint-config-next 15.0.0** - Next.js-specific ESLint configuration

### Type Definitions

- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/uuid 10.0.0 - UUID type definitions

### Build & Scripts

- **next dev** - Development server (Next.js built-in)
- **next build** - Production build (Next.js built-in)
- **next start** - Start production server (Next.js built-in)
- **next lint** - Run ESLint checks

---

## 3. DIRECTORY STRUCTURE AND ORGANIZATION

```
ops-ui/
├── app/                          # Next.js App Router directory
│   ├── layout.tsx               # Root layout with Header and metadata
│   ├── page.tsx                 # Home page - Dashboard
│   ├── globals.css              # Global Tailwind CSS directives
│   └── sop/                      # SOP management routes
│       ├── page.tsx             # SOP Portal - List and manage SOPs
│       └── create/              # SOP creation workflow
│           ├── page.tsx         # SOP Entry Form - Create new SOP
│           └── confirm/
│               └── page.tsx     # Confirmation page - Review before submit
│
├── components/                   # Reusable React components
│   └── Header.tsx              # Navigation header component
│
├── lib/                         # Shared utilities and APIs
│   └── api-client.ts          # API client class for backend communication
│
├── Configuration Files
├── package.json                # Project dependencies and scripts
├── tsconfig.json              # TypeScript compiler configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
├── postcss.config.js          # PostCSS configuration
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
└── next-env.d.ts             # Auto-generated Next.js type definitions

Key Directories:
- app/          - Page components and routing (App Router)
- components/   - Reusable UI components
- lib/          - Business logic, utilities, API clients
```

---

## 4. KEY COMPONENTS AND THEIR RESPONSIBILITIES

### 4.1 Page Components

#### `/app/layout.tsx` - Root Layout

- **Responsibility:** Wraps the entire application
- **Features:**
  - Sets page metadata (title: "OSY Operations", description)
  - Renders the Header component globally
  - Provides the HTML structure
  - Enables server-side rendering for metadata

#### `/app/page.tsx` - Home Dashboard

- **Responsibility:** Entry point / dashboard for the application
- **Features:**
  - Displays OSY Operations welcome page
  - Two main sections: SOP and Logs
  - Navigation button to SOP Portal
  - Logs section marked as "To be implemented"
- **State:** No persistent state (static welcome page)
- **Navigation:** Links to `/sop` route

#### `/app/sop/page.tsx` - SOP Portal (Management)

- **Responsibility:** Central hub for viewing and managing SOPs
- **Key Features:**
  - Displays list of all SOPs
  - Expandable SOP cards showing full details
  - Download functionality (JSON and TXT formats)
  - Delete individual SOPs with confirmation
  - "Delete All" with confirmation
  - "Create New SOP" navigation
- **State Management:**
  - `sops` - Array of SopDto from backend
  - `loading` - Loading state during fetch
  - `expandedSopId` - Track which SOP card is expanded
- **API Calls:**
  - Fetches SOPs on mount via `apiClient.getSops()`
  - Deletes SOP via `apiClient.deleteSop(id)`
  - Deletes all SOPs via `apiClient.deleteAllSops()`
- **Export Functions:**
  - `downloadAsJSON()` - Downloads SOP as formatted JSON
  - `downloadAsText()` - Downloads SOP as formatted text with sections

#### `/app/sop/create/page.tsx` - SOP Entry Form

- **Responsibility:** Multi-step form for creating new SOPs
- **Key Features:**
  - Form fields for Company Name, SOP Name, Basic Description
  - Dynamic roles section with drag-and-drop reordering
  - Dynamic steps section with drag-and-drop reordering
  - Character limits on input fields
  - Test data buttons for quick demos
  - Clear All button to reset form
  - Submit button to proceed to confirmation
- **State Management:**
  - Form data: `companyName`, `sopName`, `basicDescription`
  - Arrays: `roles[]` and `steps[]` with UUIDs
  - `mounted` - Hydration flag for SSR safety
- **Drag & Drop:**
  - Uses @dnd-kit for role and step reordering
  - Separate DndContext for roles and steps
  - Visual feedback with opacity changes during drag
- **Test Data:**
  - `fillCustomerOnboardingData()` - Pre-fills customer onboarding SOP
  - `fillServerMaintenanceData()` - Pre-fills server maintenance SOP
- **Data Passing:** Uses sessionStorage to pass data to confirmation page

#### `/app/sop/create/confirm/page.tsx` - Confirmation Page

- **Responsibility:** Review and finalize SOP before submission
- **Key Features:**
  - Displays formatted review of all SOP data
  - Sections for overview, roles, and steps
  - Submit button to send to backend
  - Go Back button to return to form
  - Success/error messaging
  - Auto-redirect on successful submission
- **State Management:**
  - Form data loaded from sessionStorage
  - `isSubmitting` - Prevents duplicate submissions
  - `submitError` - Displays backend errors
  - `submitSuccess` - Shows success message
- **API Call:**
  - `apiClient.createSOP(sopData)` sends data to backend
- **Navigation:** Redirects to `/sop` on success after 1.5s delay

### 4.2 Reusable Components

#### `/components/Header.tsx` - Navigation Header

- **Responsibility:** Global navigation and branding
- **Features:**
  - Home button for quick navigation to dashboard
  - Application title display
  - Client-side routing with Next.js useRouter
- **Styling:** Tailwind classes for layout and hover effects

### 4.3 Utility/Business Logic

#### `/lib/api-client.ts` - API Client Class

- **Responsibility:** Centralized HTTP communication with backend
- **Design Pattern:** Singleton pattern (exports `apiClient` instance)
- **Configuration:** Default baseURL = 'http://localhost:8080'

**Data Models & Interfaces:**

```typescript
// Core domain models
Step {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoring: string
}

Role {
  id: string
  title: string
  responsibilities: string
}

Sop {
  companyName: string
  sopName: string
  basicDescription: string
  roles: Role[]
  steps: Step[]
  exportedAt?: string
}

Company {
  name: string
  address: string
  phoneNumber: string
  email: string
}

// DTOs (from backend)
SopDto {
  id: string
  companyName: string
  sopName: string
  basicDescription: string
  roles: RoleDto[]
  steps: StepDto[]
  exportedAt: string
  createdAt: string
}

CompanyDto {
  id: string
  name: string
  address: string
  phoneNumber: string
  email: string
  createdAt: string
}
```

**SOP API Methods:**

| Method             | HTTP   | Endpoint      | Purpose           |
| ------------------ | ------ | ------------- | ----------------- |
| createSOP(sopData) | POST   | /api/sop      | Create new SOP    |
| getSops()          | GET    | /api/sop      | Fetch all SOPs    |
| getSopById(id)     | GET    | /api/sop/{id} | Fetch single SOP  |
| deleteSop(id)      | DELETE | /api/sop/{id} | Delete single SOP |
| deleteAllSops()    | DELETE | /api/sop      | Delete all SOPs   |

**Company API Methods:**

| Method               | HTTP   | Endpoint          | Purpose              |
| -------------------- | ------ | ----------------- | -------------------- |
| createCompany(data)  | POST   | /api/company      | Create company       |
| getCompanies()       | GET    | /api/company      | Fetch all companies  |
| getCompanyById(id)   | GET    | /api/company/{id} | Fetch single company |
| deleteCompany(id)    | DELETE | /api/company/{id} | Delete company       |
| deleteAllCompanies() | DELETE | /api/company      | Delete all companies |

**Delete Security:**

- Deletes require `X-Delete-Password: 'delete'` header (simple auth mechanism)

**Error Handling:**

- Try-catch blocks around all fetch operations
- Graceful fallbacks return empty arrays or null
- JSON parsing checks for empty responses
- HTTP status validation

---

## 5. MAIN ENTRY POINTS

### Application Entry Points:

1. **URL Entry:** `http://localhost:3000/` (or deployed URL)
   - Routes to `/app/page.tsx` (Home Dashboard)

2. **Navigation Flow:**

   ```
   Home (/)
   └─> SOP Portal (/sop)
       ├─> Create New SOP (/sop/create)
       │   └─> Confirm & Submit (/sop/create/confirm)
       └─> View/Download/Delete SOPs (same /sop)
   ```

3. **Development:**
   - `npm run dev` - Starts Next.js dev server on port 3000
   - Hot Module Replacement (HMR) enabled by default

4. **Production:**
   - `npm run build` - Creates optimized build in `.next/`
   - `npm run start` - Starts production server

### Backend Integration:

- **Base API URL:** `http://localhost:8080` (configurable in APIClient constructor)
- **API Protocol:** RESTful with JSON payloads
- **Expected Backend Endpoints:**
  - POST/GET/DELETE `/api/sop`
  - GET/DELETE `/api/sop/{id}`
  - POST/GET/DELETE `/api/company`
  - GET/DELETE `/api/company/{id}`

---

## 6. API STRUCTURE AND ROUTING

### Frontend Routing (Next.js App Router):

```
Route                           Page Component              Description
/                               app/page.tsx              Home dashboard
/sop                           app/sop/page.tsx          SOP management portal
/sop/create                    app/sop/create/page.tsx   SOP creation form
/sop/create/confirm            app/sop/create/confirm/page.tsx  Confirmation page
```

### API Client Architecture:

**Singleton Pattern:**

```typescript
export const apiClient = new APIClient()
// Used throughout app as: import { apiClient } from '@/lib/api-client'
```

**Request Structure (SOP Creation Example):**

```
POST /api/sop HTTP/1.1
Content-Type: application/json

{
  "sop": {
    "companyName": "string",
    "sopName": "string",
    "basicDescription": "string",
    "roles": [
      { "id": "uuid", "title": "string", "responsibilities": "string" }
    ],
    "steps": [
      {
        "id": "uuid",
        "name": "string",
        "details": "string",
        "postStepDocumentation": "string",
        "monitoring": "string"
      }
    ],
    "exportedAt": "ISO8601 timestamp"
  }
}
```

**Response Structure:**

```
{
  "success": true,
  "message": "optional message"
}
```

**Deletion Security:**

- Header: `X-Delete-Password: 'delete'` (hardcoded)
- Simple authentication mechanism for deletes

---

## 7. DATA MANAGEMENT APPROACH

### Frontend Data Flow:

1. **Form Data (Transient):**
   - Stored in React component state during creation
   - Uses UUIDs for unique item identification
   - Character limits enforced at input level

2. **Data Transfer:**
   - Form page → Confirmation page: `sessionStorage.setItem('listData', JSON.stringify(data))`
   - Confirmation page → Backend: `apiClient.createSOP(sopData)`

3. **Backend State:**
   - Persisted in backend database
   - Retrieved on demand via `apiClient.getSops()`
   - Data returned with IDs, timestamps from backend

4. **Display Data (Cached):**
   - Loaded once on SOP portal mount
   - Expandable in-memory state for UI interactions
   - No real-time sync (manual page refresh needed)

### State Management Strategy:

**No Global State Management:**

- React Context or Redux NOT used
- Local component state with useState hooks
- Page-level state management
- sessionStorage for cross-page data transfer

**Type Safety:**

- Full TypeScript coverage
- Interface definitions for all data models
- DTO interfaces separate from domain models

### Data Validation:

**Frontend (Client-side):**

- Character limits on all text inputs (100-1000 chars depending on field)
- Required fields validated before submission
- Form prevents submission if validation fails

**Backend (Server-side):**

- Presumed to have validation (not visible in frontend)
- Error responses bubble up to UI via response.success flag

### Data Export:

1. **JSON Export:**
   - Downloads raw SOP data as formatted JSON
   - Filename: `{sopName}.json`
   - Includes all fields: roles, steps, metadata

2. **Text Export:**
   - Human-readable formatted text
   - Sections: Overview, Roles, Steps
   - Filename: `{sopName}.txt`
   - Easy to read in text editors or print

---

## 8. NOTABLE PATTERNS AND ARCHITECTURAL DECISIONS

### 1. Next.js App Router (Modern Architecture)

- **Decision:** Uses Next.js 15 App Router (not Pages Router)
- **Benefits:**
  - Server Components by default (performance)
  - File-based routing intuitive
  - Built-in API route support (potential future)
  - Better TypeScript support

### 2. Client Components Explicitly Marked

- **Pattern:** `'use client'` directive at top of interactive pages
- **Rationale:** Pages with state, event handlers must be client components
- **Examples:** All form pages, SOP portal (need useState/useEffect)

### 3. Drag-and-Drop Implementation

- **Library:** @dnd-kit (modern, headless alternative to react-beautiful-dnd)
- **Pattern:** Separate DndContext for roles and steps
- **Benefits:**
  - Accessible (keyboard support)
  - Touch-friendly
  - No shadow DOM manipulation needed
- **Visual Feedback:** Opacity changes (isDragging ? 0.5 : 1)

### 4. Session Storage for Page-to-Page Data Transfer

- **Pattern:** Form data → sessionStorage → Confirmation page
- **Rationale:**
  - Avoids URL parameters (cleaner URLs)
  - Data cleared on tab close (privacy)
  - Sufficient for single-session workflow
- **Limitation:** Not persistent across page refreshes in production

### 5. UUID Generation

- **Pattern:** Each step and role gets unique UUID (uuid v4)
- **Rationale:**
  - Frontend-generated IDs for drag-drop operations
  - Backend likely regenerates with proper IDs
  - Prevents collisions

### 6. API Client as Singleton

- **Pattern:** Single instantiated class exported as const
- **Benefits:**
  - Consistent baseURL across app
  - Easy to mock in tests
  - Centralized error handling
- **Extensibility:** Can add authentication headers, request interceptors later

### 7. Graceful Error Handling

- **Pattern:** All API calls wrapped in try-catch
- **Fallback:** Empty arrays on error, allows partial functionality
- **UX:** User-facing error messages for critical operations

### 8. Form Validation with Character Limits

- **Pattern:** Input maxLength + onChange validation
- **Display:** Real-time character count feedback
- **Benefits:** Prevents over-submission, UX clarity

### 9. TypeScript Path Alias

- **Configuration:** `@/*` maps to project root (in tsconfig.json)
- **Usage:** `import { Header } from '@/components/Header'`
- **Benefit:** Cleaner imports, easier refactoring

### 10. Tailwind CSS Utility-First

- **Decision:** No custom CSS classes (except globals.css for @tailwind directives)
- **Benefits:**
  - Consistency with design system
  - Small bundle size
  - Easy to maintain styles inline
- **Dark Mode:** Not implemented (could be added)

### 11. Metadata API

- **Pattern:** Using Next.js Metadata API in layout.tsx
- **Benefit:** Server-side head tags, improves SEO
- **Current:** Static site title and description

### 12. Component Composition Over Props Drilling

- **Pattern:** Sortable component wrappers (SortableItem, SortableRoleItem)
- **Benefit:** Encapsulates dnd-kit logic
- **Reusability:** Same component for both roles and steps

### 13. Responsive Design

- **Grid Layout:** Mostly 2-column grids that adapt to screen size
- **Mobile:** Uses max-w-7xl with padding for all screen sizes
- **Tailwind:** Implicit mobile-first responsive design

---

## 9. DEVELOPMENT WORKFLOW & GIT HISTORY

### Recent Development:

Based on git log, recent work focuses on:

1. Company API integration (`company API`)
2. Header component refinement
3. Delete functionality improvements
4. SOP submission flow cleanup
5. Step/item nomenclature fixes
6. GET SOP endpoints
7. Test data examples
8. Refactoring and bug fixes
9. API integration and CORS handling

### Repository:

- **GitHub:** `git@github.com:asinha1/ops-ui.git`
- **Current Branch:** master
- **Latest Commit:** "company API"

---

## 10. SECURITY CONSIDERATIONS

### Current Implementation:

1. **Delete Operations:** Simple `X-Delete-Password: 'delete'` header (hardcoded, not secure for production)
2. **CORS:** Backend configured to accept requests from frontend
3. **No Authentication:** No user/auth system currently
4. **No Input Sanitization:** Assumes backend validates

### Recommendations for Production:

- Implement proper JWT/OAuth authentication
- Use secure session management
- Add CSRF token validation
- Sanitize user inputs server-side
- Use HTTPS only
- Implement rate limiting
- Validate request origins

---

## 11. PERFORMANCE CONSIDERATIONS

### Optimizations In Place:

- Tailwind CSS purging (unused styles removed)
- Next.js automatic code splitting
- Image optimization (if any images added)

### Potential Improvements:

- React.memo for SortableItem components
- useCallback for event handlers to prevent re-renders
- Lazy loading for large SOP lists (pagination/virtualization)
- API response caching with useSWR or React Query

---

## 12. TESTING & QUALITY

### Current Status:

- ESLint configured for code quality
- TypeScript for type safety
- No unit/integration tests present
- No E2E testing framework configured

### Test Data Available:

- Customer Onboarding example (fillCustomerOnboardingData)
- Server Maintenance example (fillServerMaintenanceData)

### Recommended Testing:

- Jest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests
