'use client'

import { ReactNode, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FullscreenGraphModalProps {
  children: ReactNode
  /** Title shown in fullscreen header */
  title?: string
  /** Classes for desktop inline view container */
  desktopClassName?: string
  /** Controlled open state (optional - defaults to auto-open on mobile) */
  isOpen?: boolean
  /** Callback when modal is closed */
  onClose?: () => void
  /** Whether the graph has content to show */
  hasContent?: boolean
}

/**
 * Responsive graph container that auto-fullscreens on mobile.
 * - On mobile: Opens as fullscreen bottom Sheet
 * - On desktop: Renders inline with desktopClassName
 */
export function FullscreenGraphModal({
  children,
  title = 'Graph View',
  desktopClassName = 'h-[500px]',
  isOpen: controlledIsOpen,
  onClose,
  hasContent = true,
}: FullscreenGraphModalProps) {
  const isMobile = useIsMobile()
  const [internalIsOpen, setInternalIsOpen] = useState(true)

  // Use controlled or internal state
  const isOpen = controlledIsOpen ?? internalIsOpen

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleReopen = () => {
    setInternalIsOpen(true)
  }

  // Reset to open when navigating to a new graph
  // This is intentional - when title changes, we want to auto-open the modal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInternalIsOpen(true)
  }, [title])

  // Desktop view - render inline
  if (!isMobile) {
    return <div className={cn('w-full', desktopClassName)}>{children}</div>
  }

  // Mobile view - fullscreen Sheet
  return (
    <>
      {/* Collapsed state - button to reopen */}
      {!isOpen && hasContent && (
        <div className="w-full">
          <Button
            variant="outline"
            className="w-full h-32 flex flex-col gap-2"
            onClick={handleReopen}
          >
            <span className="text-lg font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">
              Tap to view fullscreen
            </span>
          </Button>
        </div>
      )}

      {/* Fullscreen Sheet */}
      <Sheet
        open={isOpen && hasContent}
        onOpenChange={(open) => !open && handleClose()}
      >
        <SheetContent
          side="bottom"
          className={cn(
            'h-[100dvh] p-0 flex flex-col',
            // Remove default close button positioning
            '[&>button]:hidden'
          )}
          // Prevent drag-to-close to avoid conflicts with graph panning
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <SheetHeader className="flex-none px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <div>
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              <SheetDescription className="sr-only">
                Fullscreen graph view. Use pinch to zoom and drag to pan.
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>

          {/* Graph content - fills remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
