'use client'

import { useAppContext } from '@/lib/app-context'
import { useEntityData } from '@/lib/hooks/useEntityData'

/**
 * Convenience hook for accessing SOPs with standardized naming.
 * Reduces boilerplate by combining context access and data conversion.
 *
 * @example
 * ```tsx
 * // Before:
 * const { sops: sopsMap, isLoadingSops, refreshSops } = useAppContext();
 * const { entities: sops, loading } = useEntityData(sopsMap, isLoadingSops);
 *
 * // After:
 * const { sops, loading, refresh } = useSops();
 * ```
 */
export function useSops() {
  const { sops: sopsMap, isLoadingSops, refreshSops } = useAppContext()
  const {
    entities: sops,
    loading,
    count,
    isEmpty,
  } = useEntityData(sopsMap, isLoadingSops)

  return {
    sops,
    loading,
    count,
    isEmpty,
    refresh: refreshSops,
  }
}

/**
 * Convenience hook for accessing Logs with standardized naming.
 *
 * @example
 * ```tsx
 * const { logs, loading, refresh } = useLogs();
 * ```
 */
export function useLogs() {
  const { logs: logsMap, isLoadingLogs, refreshLogs } = useAppContext()
  const {
    entities: logs,
    loading,
    count,
    isEmpty,
  } = useEntityData(logsMap, isLoadingLogs)

  return {
    logs,
    loading,
    count,
    isEmpty,
    refresh: refreshLogs,
  }
}

/**
 * Convenience hook for accessing Employees with standardized naming.
 *
 * @example
 * ```tsx
 * const { employees, loading, refresh } = useEmployees();
 * ```
 */
export function useEmployees() {
  const {
    employees: employeesMap,
    isLoadingEmployees,
    refreshEmployees,
  } = useAppContext()
  const {
    entities: employees,
    loading,
    count,
    isEmpty,
  } = useEntityData(employeesMap, isLoadingEmployees)

  return {
    employees,
    loading,
    count,
    isEmpty,
    refresh: refreshEmployees,
  }
}

/**
 * Convenience hook for accessing Roles with standardized naming.
 *
 * @example
 * ```tsx
 * const { roles, loading, refresh } = useRolesData();
 * ```
 */
export function useRolesData() {
  const { roles: rolesMap, isLoadingRoles, refreshRoles } = useAppContext()
  const {
    entities: roles,
    loading,
    count,
    isEmpty,
  } = useEntityData(rolesMap, isLoadingRoles)

  return {
    roles,
    loading,
    count,
    isEmpty,
    refresh: refreshRoles,
  }
}

/**
 * Convenience hook for accessing Activity Events with standardized naming.
 *
 * @example
 * ```tsx
 * const { activityEvents, loading, refresh } = useActivityEvents();
 * ```
 */
export function useActivityEvents() {
  const {
    activityEvents: eventsMap,
    isLoadingActivityEvents,
    refreshActivityEvents,
  } = useAppContext()
  const {
    entities: activityEvents,
    loading,
    count,
    isEmpty,
  } = useEntityData(eventsMap, isLoadingActivityEvents)

  return {
    activityEvents,
    loading,
    count,
    isEmpty,
    refresh: refreshActivityEvents,
  }
}
