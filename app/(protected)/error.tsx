'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Protected route error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
