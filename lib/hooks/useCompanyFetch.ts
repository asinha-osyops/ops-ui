import { useEffect } from 'react'
import { useAppContext } from '@/lib/app-context'

interface UseCompanyFetchOptions {
  prefillCompany?: boolean // Whether to pre-fill from global context
  onCompanyPrefilled?: (companyId: string) => void // Callback when company is pre-filled
}

/**
 * Hook for accessing companies from global context and optionally pre-filling forms
 *
 * This hook provides access to the global company state managed by AppContext.
 * All companies are fetched once on app load and shared across all pages.
 *
 * @param options - Configuration options
 * @param options.prefillCompany - Whether to pre-fill from global context (default: false)
 * @param options.onCompanyPrefilled - Callback when company is pre-filled, receives company ID
 *
 * @returns Object with companies array, loading state, refetch function, and selected company ID
 *
 * @example
 * // For create pages that need to pre-fill company:
 * const { companies, loading } = useCompanyFetch({
 *   prefillCompany: true,
 *   onCompanyPrefilled: (id) => form.setValue('companyId', id),
 * });
 *
 * @example
 * // For pages that just need to access companies:
 * const { companies, loading, refetch } = useCompanyFetch();
 */
export function useCompanyFetch(options: UseCompanyFetchOptions = {}) {
  const { prefillCompany = false, onCompanyPrefilled } = options
  const { selectedCompany, companies, isLoadingCompanies, refetchCompanies } =
    useAppContext()

  // Pre-fill company from global context if requested
  useEffect(() => {
    if (
      prefillCompany &&
      selectedCompany &&
      selectedCompany.id &&
      onCompanyPrefilled
    ) {
      onCompanyPrefilled(selectedCompany.id)
    }
  }, [selectedCompany, prefillCompany, onCompanyPrefilled])

  return {
    companies,
    loading: isLoadingCompanies,
    selectedCompanyId: selectedCompany?.id,
    refetch: refetchCompanies,
  }
}
