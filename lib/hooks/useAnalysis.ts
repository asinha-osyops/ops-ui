import { useState } from 'react'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/utils/error-handling'

/**
 * Custom hook for handling analysis operations with loading states and callback pattern
 *
 * @param analyzeFunction - The API function to call for analysis
 * @param entityName - The name of the entity being analyzed (for toast messages)
 * @returns Object containing analyzing state and analyze function
 *
 * @example
 * const { analyzingIds, analyze } = useAnalysis(
 *   apiClient.analyzeSop,
 *   'SOP'
 * );
 *
 * await analyze(
 *   sopId,
 *   (result) => showSuccess('Analysis Complete', 'Results ready', result),
 *   (error) => showError('Analysis Failed', error)
 * );
 */
export function useAnalysis<T>(
  analyzeFunction: (id: string) => Promise<T | null>,
  entityName: string
) {
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set())

  const analyze = async (
    id: string,
    onSuccess: (result: T) => void,
    onError?: (error: string) => void
  ) => {
    setAnalyzingIds((prev) => new Set(prev).add(id))
    toast.info(`Analyzing ${entityName}...`)

    try {
      const result = await analyzeFunction(id)
      if (result) {
        toast.success(`${entityName} analysis complete!`)
        onSuccess(result)
      } else {
        const errorMsg = `Failed to analyze ${entityName}`
        toast.error(errorMsg)
        onError?.(errorMsg)
      }
    } catch (error) {
      console.error(`Error analyzing ${entityName}:`, error)
      const errorMsg = `Failed to analyze ${entityName}`
      showErrorToast(errorMsg, error)
      onError?.(errorMsg)
    } finally {
      setAnalyzingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  return { analyzingIds, analyze }
}
