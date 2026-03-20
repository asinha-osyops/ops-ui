'use client'

import { ReactNode } from 'react'
import { InlineLoading } from '@/components/ui/InlineLoading'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadableContentProps {
  /** Whether data is currently loading */
  loading: boolean
  /** Message to display during loading */
  loadingMessage?: string
  /** Whether the content is empty (no items) */
  isEmpty: boolean
  /** Title to display when content is empty */
  emptyTitle: string
  /** Description to display when content is empty */
  emptyDescription: string
  /** The content to render when not loading and not empty */
  children: ReactNode
  /** Optional className for the empty state container */
  emptyClassName?: string
  /** Use skeleton loading instead of spinner (better for tables) */
  useSkeleton?: boolean
  /** Number of skeleton rows to show */
  skeletonRows?: number
}

/**
 * A component that handles loading, empty, and content states consistently.
 * Use this to eliminate duplicate loading/empty state patterns across the app.
 *
 * @example
 * ```tsx
 * <LoadableContent
 *   loading={loadingSops}
 *   loadingMessage="Loading SOPs..."
 *   isEmpty={sops.length === 0}
 *   emptyTitle="No SOPs found"
 *   emptyDescription="Create your first SOP to get started."
 * >
 *   <Accordion>...</Accordion>
 * </LoadableContent>
 * ```
 */
export function LoadableContent({
  loading,
  loadingMessage = 'Loading...',
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
  emptyClassName = 'border',
  useSkeleton = false,
  skeletonRows = 5,
}: LoadableContentProps) {
  if (loading) {
    if (useSkeleton) {
      return (
        <div className="space-y-3">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )
    }
    return <InlineLoading message={loadingMessage} />
  }

  if (isEmpty) {
    return (
      <Empty className={emptyClassName}>
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <>{children}</>
}
