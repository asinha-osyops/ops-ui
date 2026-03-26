'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from 'react'
import {
  apiClient,
  CompanyDto,
  EmployeeDto,
  RoleDto,
  SopDto,
  LogDto,
  ActivityEventDto,
} from './api-client'
import { showErrorToast } from '@/lib/utils/error-handling'
import { ColorScheme } from '@/lib/types/colorscheme'
import { generateColorScheme } from '@/lib/utils/colorscheme-generator'

interface AppContextType {
  selectedCompanyId: string | null
  selectedCompany: CompanyDto | null
  setSelectedCompany: (company: CompanyDto | null) => void
  isLoadingCompany: boolean
  companies: CompanyDto[]
  isLoadingCompanies: boolean
  refetchCompanies: () => Promise<void>
  setCompanyAsSelected: (companyId: string) => void
  // Employee caching
  employees: Map<string, EmployeeDto>
  isLoadingEmployees: boolean
  refreshEmployees: () => Promise<void>
  getEmployee: (employeeId: string | undefined) => EmployeeDto | undefined
  getEmployeeName: (employeeId: string | undefined) => string
  // Role caching
  roles: Map<string, RoleDto>
  isLoadingRoles: boolean
  refreshRoles: () => Promise<void>
  getRole: (roleId: string | undefined) => RoleDto | undefined
  getRoleName: (roleId: string | undefined) => string
  // SOP caching
  sops: Map<string, SopDto>
  isLoadingSops: boolean
  refreshSops: () => Promise<void>
  // Log caching
  logs: Map<string, LogDto>
  isLoadingLogs: boolean
  refreshLogs: () => Promise<void>
  // ActivityEvent caching
  activityEvents: Map<string, ActivityEventDto>
  isLoadingActivityEvents: boolean
  refreshActivityEvents: () => Promise<void>
  // Colorscheme
  colorScheme: ColorScheme
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY_ID = 'ops-ui-selected-company-id'
const STORAGE_KEY_COMPANY = 'ops-ui-selected-company'

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<
    string | null
  >(null)
  const [selectedCompany, setSelectedCompanyState] =
    useState<CompanyDto | null>(null)
  const [isLoadingCompany, setIsLoadingCompany] = useState(false)
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Employee caching state
  const [employees, setEmployees] = useState<Map<string, EmployeeDto>>(
    new Map()
  )
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Role caching state
  const [roles, setRoles] = useState<Map<string, RoleDto>>(new Map())
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)

  // SOP caching state
  const [sops, setSops] = useState<Map<string, SopDto>>(new Map())
  const [isLoadingSops, setIsLoadingSops] = useState(false)

  // Log caching state
  const [logs, setLogs] = useState<Map<string, LogDto>>(new Map())
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  // ActivityEvent caching state
  const [activityEvents, setActivityEvents] = useState<
    Map<string, ActivityEventDto>
  >(new Map())
  const [isLoadingActivityEvents, setIsLoadingActivityEvents] = useState(false)

  // Initialize colorscheme once
  const [colorScheme] = useState<ColorScheme>(() => generateColorScheme())

  // Fetch all companies
  const fetchCompanies = useCallback(async () => {
    setIsLoadingCompanies(true)
    try {
      const fetchedCompanies = await apiClient.getCompanies()
      setCompanies(fetchedCompanies)
      return fetchedCompanies
    } catch (error) {
      showErrorToast('Failed to load companies', error)
      return []
    } finally {
      setIsLoadingCompanies(false)
    }
  }, [])

  // Refetch companies (exposed to context consumers)
  const refetchCompanies = useCallback(async () => {
    await fetchCompanies()
  }, [fetchCompanies])

  // Fetch all employees for the selected company
  const fetchEmployees = useCallback(
    async (companyId: string, signal?: AbortSignal) => {
      setIsLoadingEmployees(true)
      try {
        const fetchedEmployees = await apiClient.getEmployees(companyId)
        if (signal?.aborted) return
        const employeeMap = new Map<string, EmployeeDto>()
        fetchedEmployees.forEach((emp) => employeeMap.set(emp.id, emp))
        setEmployees(employeeMap)
      } catch (error) {
        if (signal?.aborted) return
        showErrorToast('Failed to load employees', error)
        setEmployees(new Map())
      } finally {
        if (!signal?.aborted) setIsLoadingEmployees(false)
      }
    },
    []
  )

  // Refresh employees for currently selected company
  const refreshEmployees = useCallback(async () => {
    if (selectedCompany?.id) {
      await fetchEmployees(selectedCompany.id)
    }
  }, [selectedCompany, fetchEmployees])

  // Helper to get employee by ID
  const getEmployee = useCallback(
    (employeeId: string | undefined): EmployeeDto | undefined => {
      if (!employeeId) return undefined
      return employees.get(employeeId)
    },
    [employees]
  )

  // Helper to get employee name by ID
  const getEmployeeName = useCallback(
    (employeeId: string | undefined): string => {
      if (!employeeId) return 'Unknown'
      const employee = employees.get(employeeId)
      return employee?.name || 'Unknown'
    },
    [employees]
  )

  // Fetch all roles for the selected company
  const fetchRoles = useCallback(
    async (companyId: string, signal?: AbortSignal) => {
      setIsLoadingRoles(true)
      try {
        const fetchedRoles = await apiClient.getRoles(companyId)
        if (signal?.aborted) return
        const roleMap = new Map<string, RoleDto>()
        fetchedRoles.forEach((role) => roleMap.set(role.id, role))
        setRoles(roleMap)
      } catch (error) {
        if (signal?.aborted) return
        showErrorToast('Failed to load roles', error)
        setRoles(new Map())
      } finally {
        if (!signal?.aborted) setIsLoadingRoles(false)
      }
    },
    []
  )

  // Refresh roles for currently selected company
  const refreshRoles = useCallback(async () => {
    if (selectedCompany?.id) {
      await fetchRoles(selectedCompany.id)
    }
  }, [selectedCompany, fetchRoles])

  // Helper to get role by ID
  const getRole = useCallback(
    (roleId: string | undefined): RoleDto | undefined => {
      if (!roleId) return undefined
      return roles.get(roleId)
    },
    [roles]
  )

  // Helper to get role name by ID
  const getRoleName = useCallback(
    (roleId: string | undefined): string => {
      if (!roleId) return 'Unknown'
      const role = roles.get(roleId)
      return role?.name || 'Unknown'
    },
    [roles]
  )

  // Fetch all SOPs for the selected company
  const fetchSops = useCallback(
    async (companyId: string, signal?: AbortSignal) => {
      setIsLoadingSops(true)
      try {
        const fetchedSops = await apiClient.getSops(companyId)
        if (signal?.aborted) return
        const sopMap = new Map<string, SopDto>()
        fetchedSops.forEach((sop) => sopMap.set(sop.id, sop))
        setSops(sopMap)
      } catch (error) {
        if (signal?.aborted) return
        showErrorToast('Failed to load SOPs', error)
        setSops(new Map())
      } finally {
        if (!signal?.aborted) setIsLoadingSops(false)
      }
    },
    []
  )

  // Refresh SOPs for currently selected company
  const refreshSops = useCallback(async () => {
    if (selectedCompany?.id) {
      await fetchSops(selectedCompany.id)
    }
  }, [selectedCompany, fetchSops])

  // Fetch all logs for the selected company
  const fetchLogs = useCallback(
    async (companyId: string, signal?: AbortSignal) => {
      setIsLoadingLogs(true)
      try {
        const fetchedLogs = await apiClient.getLogs(companyId)
        if (signal?.aborted) return
        const logMap = new Map<string, LogDto>()
        fetchedLogs.forEach((log) => logMap.set(log.id, log))
        setLogs(logMap)
      } catch (error) {
        if (signal?.aborted) return
        showErrorToast('Failed to load logs', error)
        setLogs(new Map())
      } finally {
        if (!signal?.aborted) setIsLoadingLogs(false)
      }
    },
    []
  )

  // Refresh logs for currently selected company
  const refreshLogs = useCallback(async () => {
    if (selectedCompany?.id) {
      await fetchLogs(selectedCompany.id)
    }
  }, [selectedCompany, fetchLogs])

  // Fetch all activity events for the selected company
  const fetchActivityEvents = useCallback(
    async (companyId: string, signal?: AbortSignal) => {
      setIsLoadingActivityEvents(true)
      try {
        const fetchedActivityEvents =
          await apiClient.getActivityEvents(companyId)
        if (signal?.aborted) return
        const activityEventMap = new Map<string, ActivityEventDto>()
        fetchedActivityEvents.forEach((event) =>
          activityEventMap.set(event.id, event)
        )
        setActivityEvents(activityEventMap)
      } catch (error) {
        if (signal?.aborted) return
        showErrorToast('Failed to load activity events', error)
        setActivityEvents(new Map())
      } finally {
        if (!signal?.aborted) setIsLoadingActivityEvents(false)
      }
    },
    []
  )

  // Refresh activity events for currently selected company
  const refreshActivityEvents = useCallback(async () => {
    if (selectedCompany?.id) {
      await fetchActivityEvents(selectedCompany.id)
    }
  }, [selectedCompany, fetchActivityEvents])

  // Save to localStorage whenever company selection changes
  const setSelectedCompany = useCallback((company: CompanyDto | null) => {
    setSelectedCompanyState(company)
    setSelectedCompanyIdState(company?.id || null)

    if (company === null) {
      localStorage.removeItem(STORAGE_KEY_ID)
      localStorage.removeItem(STORAGE_KEY_COMPANY)
    } else {
      localStorage.setItem(STORAGE_KEY_ID, company.id)
      localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(company))
    }
  }, [])

  // Set a company as selected by ID (useful after creating a new company)
  const setCompanyAsSelected = useCallback(
    (companyId: string) => {
      const company = companies.find((c) => c.id === companyId)
      if (company) {
        setSelectedCompany(company)
      }
    },
    [companies, setSelectedCompany]
  )

  // Initialize app state: fetch companies first, then validate stored company
  useEffect(() => {
    const initializeAppState = async () => {
      setIsLoadingCompanies(true)
      try {
        // 1. Fetch companies first
        const fetchedCompanies = await apiClient.getCompanies()
        setCompanies(fetchedCompanies)

        // 2. Check if stored company exists in fetched list
        const storedId = localStorage.getItem(STORAGE_KEY_ID)
        if (storedId) {
          const companyExists = fetchedCompanies.find((c) => c.id === storedId)
          if (companyExists) {
            // Restore valid company
            setSelectedCompanyIdState(companyExists.id)
            setSelectedCompanyState(companyExists)
            // Update stored company data with fresh data
            localStorage.setItem(
              STORAGE_KEY_COMPANY,
              JSON.stringify(companyExists)
            )
          } else {
            // Company was deleted - clear storage
            localStorage.removeItem(STORAGE_KEY_ID)
            localStorage.removeItem(STORAGE_KEY_COMPANY)
          }
        }
        // If no stored company or invalid, leave as null (no company selected)
      } catch (error) {
        showErrorToast('Failed to load companies', error)
      } finally {
        setIsLoadingCompanies(false)
        setIsHydrated(true)
      }
    }

    initializeAppState()
  }, [])

  // Fetch employees, roles, SOPs, logs, and activity events whenever selected company changes
  // AbortController cancels in-flight requests when company changes to prevent race conditions
  useEffect(() => {
    if (selectedCompany?.id) {
      const controller = new AbortController()
      const { signal } = controller

      fetchEmployees(selectedCompany.id, signal)
      fetchRoles(selectedCompany.id, signal)
      fetchSops(selectedCompany.id, signal)
      fetchLogs(selectedCompany.id, signal)
      fetchActivityEvents(selectedCompany.id, signal)

      return () => controller.abort()
    } else {
      // Clear all data when no company is selected
      setEmployees(new Map())
      setRoles(new Map())
      setSops(new Map())
      setLogs(new Map())
      setActivityEvents(new Map())
    }
  }, [
    selectedCompany,
    fetchEmployees,
    fetchRoles,
    fetchSops,
    fetchLogs,
    fetchActivityEvents,
  ])

  // Memoize context value using domain-specific sub-objects
  // This makes dependency tracking clearer and sets up for a future context split
  const companyValue = useMemo(
    () => ({
      selectedCompanyId,
      selectedCompany,
      setSelectedCompany,
      isLoadingCompany,
      companies,
      isLoadingCompanies,
      refetchCompanies,
      setCompanyAsSelected,
    }),
    [
      selectedCompanyId,
      selectedCompany,
      setSelectedCompany,
      isLoadingCompany,
      companies,
      isLoadingCompanies,
      refetchCompanies,
      setCompanyAsSelected,
    ]
  )

  const employeeValue = useMemo(
    () => ({
      employees,
      isLoadingEmployees,
      refreshEmployees,
      getEmployee,
      getEmployeeName,
    }),
    [
      employees,
      isLoadingEmployees,
      refreshEmployees,
      getEmployee,
      getEmployeeName,
    ]
  )

  const roleValue = useMemo(
    () => ({ roles, isLoadingRoles, refreshRoles, getRole, getRoleName }),
    [roles, isLoadingRoles, refreshRoles, getRole, getRoleName]
  )

  const sopValue = useMemo(
    () => ({ sops, isLoadingSops, refreshSops }),
    [sops, isLoadingSops, refreshSops]
  )

  const logValue = useMemo(
    () => ({ logs, isLoadingLogs, refreshLogs }),
    [logs, isLoadingLogs, refreshLogs]
  )

  const activityEventValue = useMemo(
    () => ({
      activityEvents,
      isLoadingActivityEvents,
      refreshActivityEvents,
    }),
    [activityEvents, isLoadingActivityEvents, refreshActivityEvents]
  )

  const contextValue = useMemo(
    () => ({
      ...companyValue,
      ...employeeValue,
      ...roleValue,
      ...sopValue,
      ...logValue,
      ...activityEventValue,
      colorScheme,
    }),
    [
      companyValue,
      employeeValue,
      roleValue,
      sopValue,
      logValue,
      activityEventValue,
      colorScheme,
    ]
  )

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

// Default entity color for SSR fallback
const defaultEntityColor = {
  primary: 'blue-3' as const,
  light: 'blue-1' as const,
  badge: 'bg-blue-100 text-blue-800',
  borderLeft: 'border-l-blue-500',
  borderTop: 'border-t-blue-500',
}

// Default context value for SSR/build time when provider isn't available
const defaultContextValue: AppContextType = {
  selectedCompanyId: null,
  selectedCompany: null,
  setSelectedCompany: () => {},
  isLoadingCompany: true,
  companies: [],
  isLoadingCompanies: true,
  refetchCompanies: async () => {},
  setCompanyAsSelected: () => {},
  employees: new Map(),
  isLoadingEmployees: true,
  refreshEmployees: async () => {},
  getEmployee: () => undefined,
  getEmployeeName: () => 'Unknown',
  roles: new Map(),
  isLoadingRoles: true,
  refreshRoles: async () => {},
  getRole: () => undefined,
  getRoleName: () => 'Unknown',
  sops: new Map(),
  isLoadingSops: true,
  refreshSops: async () => {},
  logs: new Map(),
  isLoadingLogs: true,
  refreshLogs: async () => {},
  activityEvents: new Map(),
  isLoadingActivityEvents: true,
  refreshActivityEvents: async () => {},
  colorScheme: {
    entities: {
      SOP: defaultEntityColor,
      Step: defaultEntityColor,
      Log: defaultEntityColor,
      LogLine: defaultEntityColor,
      ActivityEvent: defaultEntityColor,
      Company: defaultEntityColor,
      Employee: defaultEntityColor,
      Role: defaultEntityColor,
    },
    roleTitle: {},
    loggingSource: {},
    platform: {},
    eventCategory: {},
    service: {},
  },
}

export function useAppContext() {
  const context = useContext(AppContext)
  // Return default values when provider isn't available
  // This can happen on public pages or during SSR/build time
  if (context === undefined) {
    return defaultContextValue
  }
  return context
}

/**
 * Strict version of useAppContext that throws if used outside AppProvider.
 * Use this in protected pages where the provider is guaranteed to exist.
 */
export function useRequiredAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error(
      'useRequiredAppContext must be used within an AppProvider. ' +
        'For public pages, use useAppContext() instead.'
    )
  }
  return context
}
