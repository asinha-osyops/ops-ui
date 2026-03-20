export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { LogPageContent } from './LogPageContent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LogPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LogPageContent />
    </Suspense>
  )
}
