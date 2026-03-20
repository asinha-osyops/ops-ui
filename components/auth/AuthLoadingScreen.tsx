'use client'

import { Loader2 } from 'lucide-react'

interface AuthLoadingScreenProps {
  message?: string
}

/**
 * Full-page loading screen shown during authentication checks
 * Used by protected layouts while verifying auth status
 */
export function AuthLoadingScreen({
  message = 'Loading...',
}: AuthLoadingScreenProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
