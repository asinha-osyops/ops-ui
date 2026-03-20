'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface UsePostCreateRedirectOptions {
  /**
   * Function to refresh the entity data in app context
   */
  refreshFn: () => Promise<void>

  /**
   * Route to redirect to after successful creation
   */
  redirectTo: string

  /**
   * Optional function to set the newly created entity as selected
   * (e.g., for Company, to auto-select the new company)
   */
  setAsSelected?: (id: string) => void
}

/**
 * Hook for handling post-create redirect logic with context refresh.
 *
 * This standardizes the pattern of:
 * 1. Refreshing app context after entity creation
 * 2. Optionally setting the new entity as selected
 * 3. Redirecting to the list page
 *
 * @example
 * ```typescript
 * const { handlePostCreate } = usePostCreateRedirect({
 *   refreshFn: refreshRoles,
 *   redirectTo: Route.ROLE_HOME,
 * });
 *
 * const onSubmit = async (data: RoleFormValues) => {
 *   const result = await executeWithToast(...);
 *   if (result) {
 *     await handlePostCreate();
 *   }
 * };
 * ```
 */
export function usePostCreateRedirect({
  refreshFn,
  redirectTo,
  setAsSelected,
}: UsePostCreateRedirectOptions) {
  const router = useRouter()

  const handlePostCreate = useCallback(
    async (createdEntityId?: string) => {
      // Refresh entity data in app context
      await refreshFn()

      // Set as selected if applicable (e.g., Company)
      if (setAsSelected && createdEntityId) {
        setAsSelected(createdEntityId)
      }

      // Redirect to list page, with anchor if entity ID provided
      const url = createdEntityId
        ? `${redirectTo}?id=${createdEntityId}`
        : redirectTo
      router.push(url)
    },
    [refreshFn, redirectTo, router, setAsSelected]
  )

  return { handlePostCreate }
}
