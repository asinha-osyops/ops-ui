import { Suspense } from 'react'
import { SettingsPageContent } from './SettingsPageContent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsPageContent />
    </Suspense>
  )
}
