'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'

interface LoadingStateProps {
  isLoading: boolean
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  children: React.ReactNode
  loadingMessage?: string
}

export function LoadingState({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
  loadingMessage = 'Loading...',
}: LoadingStateProps) {
  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />
  }

  if (isEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <>{children}</>
}
