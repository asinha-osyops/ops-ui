import { Suspense } from 'react'
import { OrgPageContent } from './OrgPageContent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function OrgPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrgPageContent />
    </Suspense>
  )
}
