import { Suspense } from 'react'
import { SopPageContent } from './SopPageContent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function SopPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SopPageContent />
    </Suspense>
  )
}
