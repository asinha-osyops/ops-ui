/**
 * Route Configuration
 *
 * Centralized route constants for the application.
 * Use these constants instead of hardcoded strings throughout the codebase.
 */

export const Route = {
  // Public Routes
  LANDING: '/',
  LOGIN: '/login',

  // Protected Home
  HOME: '/home',

  // SOP Routes
  SOP_HOME: '/sop',
  SOP_CREATE: '/sop/create',
  SOP_CREATE_CONFIRM: '/sop/create/confirm',
  SOP_DETAIL: (id: string) => `/sop/${id}` as const,
  SOP_ANALYSIS: (id: string) => `/sop/${id}/analysis` as const,

  // Org Routes (Employee Management)
  ORG_HOME: '/org',

  // Settings Routes (Company, Role, ActivityEvent Management)
  SETTINGS: '/settings',

  // Company Routes (legacy - redirects to /org or /settings)
  COMPANY_HOME: '/company',
  COMPANY_CREATE: '/company/create',
  COMPANY_CREATE_CONFIRM: '/company/create/confirm',

  // Role Routes (legacy - moved to Settings)
  ROLE_HOME: '/role',
  ROLE_CREATE: '/role/create',
  ROLE_CREATE_CONFIRM: '/role/create/confirm',

  // ActivityEvent Routes (legacy - moved to Settings)
  ACTIVITY_EVENT_HOME: '/activityevent',
  ACTIVITY_EVENT_CREATE: '/activityevent/create',
  ACTIVITY_EVENT_EDIT: '/activityevent/edit',

  // Log Routes
  LOG: '/log',
  LOG_HOME: '/log',
  LOG_CREATE: '/log/create',
  LOG_LINES: '/log/lines',
  LOG_DETAIL: (id: string) => `/log/${id}` as const,

  // Admin Routes
  ADMIN_USERS: '/admin/users',
  ADMIN_HEALTH: '/admin/health',

  // Info Routes
  ABOUT: '/about',
  CONTACT: '/contact',
} as const

// Type for route values (including function routes)
export type RouteValue = (typeof Route)[keyof typeof Route]

// Type for static string routes only (for use in breadcrumbs, etc.)
export type StaticRouteValue = Exclude<RouteValue, Function>

// ============================================
// Breadcrumb Configuration
// ============================================

export interface Breadcrumb {
  label: string
  route?: StaticRouteValue
}

/**
 * Centralized breadcrumb configurations for all pages.
 * Eliminates duplicate inline breadcrumb array creation across pages.
 *
 * @example
 * ```tsx
 * <PageLayout
 *   title="Upload SOP File"
 *   breadcrumbs={Breadcrumbs.sop.create}
 * >
 * ```
 */
export const Breadcrumbs = {
  sop: {
    home: [{ label: 'SOPs' }] as Breadcrumb[],
    create: [
      { label: 'SOPs', route: Route.SOP_HOME },
      { label: 'Create' },
    ] as Breadcrumb[],
    detail: (name: string) =>
      [
        { label: 'SOPs', route: Route.SOP_HOME },
        { label: name },
      ] as Breadcrumb[],
    analysis: (sopName: string, sopId: string) =>
      [
        { label: 'SOPs', route: Route.SOP_HOME },
        { label: sopName, route: Route.SOP_DETAIL(sopId) as StaticRouteValue },
        { label: 'Analysis' },
      ] as Breadcrumb[],
  },
  log: {
    home: [{ label: 'Logs' }] as Breadcrumb[],
    create: [
      { label: 'Logs', route: Route.LOG_HOME },
      { label: 'Create' },
    ] as Breadcrumb[],
    lines: [
      { label: 'Logs', route: Route.LOG_HOME },
      { label: 'Query Lines' },
    ] as Breadcrumb[],
    detail: (name: string) =>
      [
        { label: 'Logs', route: Route.LOG_HOME },
        { label: name },
      ] as Breadcrumb[],
  },
  company: {
    home: [{ label: 'Companies' }] as Breadcrumb[],
    create: [
      { label: 'Companies', route: Route.COMPANY_HOME },
      { label: 'Create' },
    ] as Breadcrumb[],
  },
  role: {
    home: [{ label: 'Roles' }] as Breadcrumb[],
    create: [
      { label: 'Roles', route: Route.ROLE_HOME },
      { label: 'Create' },
    ] as Breadcrumb[],
  },
  activityEvent: {
    home: [{ label: 'Activity Events' }] as Breadcrumb[],
    create: [
      { label: 'Activity Events', route: Route.ACTIVITY_EVENT_HOME },
      { label: 'Create' },
    ] as Breadcrumb[],
    edit: [
      { label: 'Activity Events', route: Route.ACTIVITY_EVENT_HOME },
      { label: 'Edit' },
    ] as Breadcrumb[],
  },
  org: {
    home: [{ label: 'Organization' }] as Breadcrumb[],
  },
  settings: {
    home: [{ label: 'Settings' }] as Breadcrumb[],
  },
  admin: {
    users: [{ label: 'Admin' }, { label: 'Users' }] as Breadcrumb[],
  },
} as const
