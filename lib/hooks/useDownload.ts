import { downloadAsJSON, downloadAsText } from '@/lib/utils/download'
import {
  formatSopAsText,
  formatLogAsText,
  formatCompanyAsText,
  formatEmployeeAsText,
} from '@/lib/utils/text-formatters'
import { SopDto, LogDto, CompanyDto, EmployeeDto } from '@/lib/api-client'

/**
 * Custom hook for handling JSON and text downloads of entities
 *
 * @param entityType - The type of entity (e.g., 'sop', 'company', 'log')
 * @param formatAsText - Function to format entity as text
 * @param extractData - Function to extract data fields for JSON download
 * @param getName - Function to get the name for the file
 * @returns Object with download handler functions
 *
 * @example
 * const { handleDownloadJSON, handleDownloadText } = useDownload(
 *   'sop',
 *   formatSopAsText,
 *   (sop) => ({ name: sop.name, steps: sop.steps }),
 *   (sop) => sop.name
 * );
 */
export function useDownload<T extends { id: string }>(
  entityType: string,
  formatAsText: (item: T) => string,
  extractData: (item: T) => Record<string, unknown>,
  getName: (item: T) => string
) {
  const handleDownloadJSON = (item: T) => {
    const data = extractData(item)
    downloadAsJSON(data, getName(item), `${entityType}-${item.id}`)
  }

  const handleDownloadText = (item: T) => {
    const textContent = formatAsText(item)
    downloadAsText(textContent, getName(item), `${entityType}-${item.id}`)
  }

  return { handleDownloadJSON, handleDownloadText }
}

// ============================================
// Entity-Specific Download Hooks
// ============================================

/**
 * Pre-configured download hook for SOPs.
 * @example
 * const { handleDownloadJSON, handleDownloadText } = useSopDownload();
 * handleDownloadJSON(sop);
 */
export function useSopDownload() {
  return useDownload<SopDto>(
    'sop',
    formatSopAsText,
    (s) => ({
      companyName: s.companyName,
      name: s.name,
      basicDescription: s.basicDescription,
      steps: s.steps,
      createdAt: s.createdAt,
    }),
    (s) => s.name
  )
}

/**
 * Pre-configured download hook for Logs.
 * @example
 * const { handleDownloadJSON, handleDownloadText } = useLogDownload();
 * handleDownloadJSON(log);
 */
export function useLogDownload() {
  return useDownload<LogDto>(
    'log',
    formatLogAsText,
    (l) => ({
      companyName: l.companyName,
      name: l.name,
      loggingSource: l.loggingSource,
      metadata: l.metadata,
      createdAt: l.createdAt,
    }),
    (l) => l.name
  )
}

/**
 * Pre-configured download hook for Companies.
 * @example
 * const { handleDownloadJSON, handleDownloadText } = useCompanyDownload();
 * handleDownloadJSON(company);
 */
export function useCompanyDownload() {
  return useDownload<CompanyDto>(
    'company',
    formatCompanyAsText,
    (c) => ({
      name: c.name,
      address: c.address,
      phoneNumber: c.phoneNumber,
      email: c.email,
      createdAt: c.createdAt,
    }),
    (c) => c.name
  )
}

/**
 * Pre-configured download hook for Employees.
 * @example
 * const { handleDownloadJSON, handleDownloadText } = useEmployeeDownload();
 * handleDownloadJSON(employee);
 */
export function useEmployeeDownload() {
  return useDownload<EmployeeDto>(
    'employee',
    formatEmployeeAsText,
    (e) => ({
      name: e.name,
      email: e.email,
      phoneNumber: e.phoneNumber,
      roleTitle: e.roleTitle,
      managerName: e.managerName,
      createdAt: e.createdAt,
    }),
    (e) => e.name
  )
}
