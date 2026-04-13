'use client'

import { useState, useEffect } from 'react'
import { apiClient, EmployeeDto } from '@/lib/api-client'
import { executeWithToast, showErrorToast } from '@/lib/utils/error-handling'

interface UseEmployeeManagementOptions {
  companyId: string | undefined
  onRefreshGlobal?: () => Promise<void>
}

interface UseEmployeeManagementReturn {
  // State
  employees: EmployeeDto[]
  loadingEmployees: boolean
  isBulkEditMode: boolean
  isAddingEmployee: boolean
  deleteAllEmployeesOpen: boolean

  // Setters
  setIsBulkEditMode: (value: boolean) => void
  setIsAddingEmployee: (value: boolean) => void
  setDeleteAllEmployeesOpen: (value: boolean) => void

  // Actions
  fetchEmployees: (companyId: string) => Promise<void>
  handleDeleteAllEmployees: () => void
  confirmDeleteAllEmployees: () => Promise<void>
  handleEmployeeAdded: () => void
  handleBulkSaveComplete: () => void
  handleCancelAdd: () => void
  toggleBulkEditMode: () => void
}

export function useEmployeeManagement({
  companyId,
  onRefreshGlobal,
}: UseEmployeeManagementOptions): UseEmployeeManagementReturn {
  const [employees, setEmployees] = useState<EmployeeDto[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [isBulkEditMode, setIsBulkEditMode] = useState(false)
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [deleteAllEmployeesOpen, setDeleteAllEmployeesOpen] = useState(false)

  // Fetch employees when company changes
  useEffect(() => {
    if (companyId) {
      fetchEmployees(companyId)
    } else {
      setEmployees([])
    }
  }, [companyId])

  const fetchEmployees = async (id: string) => {
    setLoadingEmployees(true)
    try {
      const data = await apiClient.getEmployees(id)
      setEmployees(data)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      showErrorToast('Failed to load employees', error)
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleDeleteAllEmployees = () => {
    setDeleteAllEmployeesOpen(true)
  }

  const confirmDeleteAllEmployees = async () => {
    if (!companyId) return

    await executeWithToast(
      async () => {
        await apiClient.deleteAllEmployees(companyId)
        if (onRefreshGlobal) {
          await onRefreshGlobal()
        }
        await fetchEmployees(companyId)
      },
      {
        success: 'All employees deleted successfully',
        error: 'Failed to delete all employees',
      }
    )

    setDeleteAllEmployeesOpen(false)
  }

  const handleEmployeeAdded = () => {
    setIsAddingEmployee(false)
    if (companyId) {
      fetchEmployees(companyId)
    }
  }

  const handleBulkSaveComplete = () => {
    setIsBulkEditMode(false)
    if (companyId) {
      fetchEmployees(companyId)
    }
  }

  const handleCancelAdd = () => {
    setIsAddingEmployee(false)
  }

  const toggleBulkEditMode = () => {
    setIsBulkEditMode(!isBulkEditMode)
  }

  return {
    // State
    employees,
    loadingEmployees,
    isBulkEditMode,
    isAddingEmployee,
    deleteAllEmployeesOpen,

    // Setters
    setIsBulkEditMode,
    setIsAddingEmployee,
    setDeleteAllEmployeesOpen,

    // Actions
    fetchEmployees,
    handleDeleteAllEmployees,
    confirmDeleteAllEmployees,
    handleEmployeeAdded,
    handleBulkSaveComplete,
    handleCancelAdd,
    toggleBulkEditMode,
  }
}
