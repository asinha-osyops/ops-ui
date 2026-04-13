'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Building2 } from 'lucide-react'

export function CompanyRequiredAlert() {
  return (
    <Alert className="max-w-md mx-auto mt-12">
      <Building2 className="h-4 w-4" />
      <AlertTitle>No Company Selected</AlertTitle>
      <AlertDescription>
        Please select a company in the sidebar to view content.
      </AlertDescription>
    </Alert>
  )
}
