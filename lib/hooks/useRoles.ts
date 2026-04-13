import { useState, useEffect } from 'react'
import { apiClient, RoleDto } from '@/lib/api-client'

export function useRoles(companyId: string) {
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyId) {
        setRoles([])
        return
      }

      setLoadingRoles(true)
      setError(null)
      try {
        const rolesData = await apiClient.getRoles(companyId)
        setRoles(rolesData)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch roles'
        setError(message)
        console.error('Failed to fetch roles:', err)
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [companyId])

  return { roles, loadingRoles, error }
}
