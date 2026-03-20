export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { CompanyPageContent } from './CompanyPageContent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function CompanyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CompanyPageContent />
    </Suspense>
  )
}
