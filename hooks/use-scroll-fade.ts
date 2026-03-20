'use client'

import {
  useEffect,
  useState,
  RefObject,
  useSyncExternalStore,
  useCallback,
} from 'react'

interface UseScrollFadeOptions {
  /** Element to observe for triggering fade */
  triggerRef: RefObject<HTMLElement | null>
  /** Root margin for intersection observer */
  rootMargin?: string
}

interface UseScrollFadeReturn {
  opacity: number
  style: { opacity: number; transition: string }
}

/**
 * Hook to subscribe to prefers-reduced-motion media query.
 * Uses useSyncExternalStore for proper React 18+ integration.
 */
function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const getServerSnapshot = useCallback(() => {
    // Default to false on server (no motion preference)
    return false
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Hook that returns opacity based on intersection with a trigger element.
 * As the trigger enters the viewport, opacity decreases from 1 to 0.
 * Respects prefers-reduced-motion preference.
 */
export function useScrollFade({
  triggerRef,
  rootMargin = '0px 0px -50% 0px',
}: UseScrollFadeOptions): UseScrollFadeReturn {
  const [intersectionRatio, setIntersectionRatio] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Skip observer setup if user prefers reduced motion
    if (prefersReducedMotion) {
      return
    }

    const trigger = triggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIntersectionRatio(entry.intersectionRatio)
        })
      },
      {
        // Create thresholds at every 10% for smooth animation
        threshold: Array.from({ length: 11 }, (_, i) => i / 10),
        rootMargin,
      }
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [triggerRef, rootMargin, prefersReducedMotion])

  // Compute opacity from intersection ratio
  // If reduced motion is preferred, always return full opacity
  const opacity = prefersReducedMotion
    ? 1
    : Math.max(0, Math.min(1, 1 - intersectionRatio))

  return {
    opacity,
    style: {
      opacity,
      transition: prefersReducedMotion ? 'none' : 'opacity 150ms ease-out',
    },
  }
}
