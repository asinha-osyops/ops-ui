'use client'

import { ReactNode, useMemo } from 'react'
import { useAppContext } from '@/lib/app-context'
import { PageLayout } from '@/components/PageLayout'
import { CompanyRequiredAlert } from '@/components/ui/CompanyRequiredAlert'
import { Breadcrumb } from '@/lib/routes'

interface PageConfig {
  title: string
  breadcrumbs: Breadcrumb[]
  titleClassName?: string
}

interface UseRequireCompanyResult {
  selectedCompany: ReturnType<typeof useAppContext>['selectedCompany']
  hasCompany: boolean
  /** Pre-rendered fallback UI to show when no company is selected */
  companyRequiredFallback: ReactNode
}

/**
 * Hook that provides company requirement guard functionality.
 * Returns the selected company and a pre-rendered fallback UI to show
 * when no company is selected.
 *
 * @example
 * ```tsx
 * const { hasCompany, companyRequiredFallback } = useRequireCompany({
 *   title: 'SOP Management',
 *   breadcrumbs: [{ label: 'SOPs' }],
 *   titleClassName: sopClasses.text,
 * });
 *
 * if (!hasCompany) {
 *   return companyRequiredFallback;
 * }
 * ```
 */
export function useRequireCompany(
  pageConfig: PageConfig
): UseRequireCompanyResult {
  const { selectedCompany } = useAppContext()

  // Memoize the fallback UI to avoid re-creating on every render
  const companyRequiredFallback = useMemo(
    () => (
      <PageLayout
        title={pageConfig.title}
        titleClassName={pageConfig.titleClassName}
        breadcrumbs={pageConfig.breadcrumbs}
      >
        <CompanyRequiredAlert />
      </PageLayout>
    ),
    [pageConfig.title, pageConfig.titleClassName, pageConfig.breadcrumbs]
  )

  return {
    selectedCompany,
    hasCompany: selectedCompany !== null,
    companyRequiredFallback,
  }
}
