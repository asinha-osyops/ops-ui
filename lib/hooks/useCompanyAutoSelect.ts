'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CompanyDto } from '@/lib/api-client'

interface UseCompanyAutoSelectOptions {
  companies: CompanyDto[]
  loadingCompanies: boolean
  selectedCompany: CompanyDto | null
  setSelectedCompany: (company: CompanyDto | null) => void
}

interface UseCompanyAutoSelectReturn {
  companyAnchorId: string | null
  employeeAnchorId: string | null
}

/**
 * Hook to automatically select a company from URL anchor or default to first company.
 * Used in Company and Org pages.
 */
export function useCompanyAutoSelect({
  companies,
  loadingCompanies,
  selectedCompany,
  setSelectedCompany,
}: UseCompanyAutoSelectOptions): UseCompanyAutoSelectReturn {
  const searchParams = useSearchParams()
  const companyAnchorId = searchParams.get('id')
  const employeeAnchorId = searchParams.get('employeeId')

  useEffect(() => {
    if (companyAnchorId && companies.length > 0 && !selectedCompany) {
      const company = companies.find((c) => c.id === companyAnchorId)
      if (company) {
        setSelectedCompany(company)
      }
    } else if (
      companies.length > 0 &&
      !selectedCompany &&
      !loadingCompanies &&
      !companyAnchorId
    ) {
      setSelectedCompany(companies[0])
    }
  }, [
    companyAnchorId,
    companies,
    selectedCompany,
    loadingCompanies,
    setSelectedCompany,
  ])

  return {
    companyAnchorId,
    employeeAnchorId,
  }
}
