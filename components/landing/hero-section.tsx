'use client'

import { useRef, useLayoutEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroCurve } from '@/components/landing/hero-curve'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/landing/constants'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [curveHeight, setCurveHeight] = useState(400)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return

    let timeoutId: ReturnType<typeof setTimeout>

    const updateCurveHeight = () => {
      const contentHeight = content.offsetHeight
      // Curve height = content area height + fixed padding below button
      const calculatedHeight =
        contentHeight + LAYOUT.HERO_BUTTON_TO_CURVE_PADDING

      // Reduce curve depth to ~half on mobile (md breakpoint is 768px)
      const isMobile = window.innerWidth < 768
      const finalHeight = isMobile
        ? Math.max(LAYOUT.HERO_MIN_CURVE_HEIGHT, calculatedHeight * 0.5)
        : Math.max(LAYOUT.HERO_MIN_CURVE_HEIGHT, calculatedHeight)
      setCurveHeight(finalHeight)
    }

    // Initial calculation
    updateCurveHeight()

    // Listen for resize with debounce to prevent jank
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateCurveHeight, 100)
    })
    resizeObserver.observe(content)

    // Also listen to window resize for breakpoint changes
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateCurveHeight, 100)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className={cn('relative', className)}>
      {/* Top part - title with orange background */}
      <div className="hero-orange-bg">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 pt-12 sm:pt-16 md:pt-24 lg:pt-32 pb-0">
          <div className="flex flex-col items-center text-center mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground uppercase">
              Stop Guessing.
              <br />
              Start Debugging.
            </h1>
          </div>
        </div>
      </div>

      {/* SVG Curve with content */}
      <div className="relative">
        {/* Orange bridge to connect title to shifted curve on mobile */}
        <div className="hero-orange-bg absolute top-0 left-0 right-0 h-16 md:hidden" />

        <HeroCurve
          curveHeight={curveHeight}
          showLine={false}
          className="absolute top-16 md:top-0 left-0 right-0"
        />

        {/* Content positioned over the curve - measured for height calculation */}
        <div
          ref={contentRef}
          className="relative z-10 container mx-auto px-4 sm:px-5 md:px-6 pt-6 sm:pt-8"
        >
          <div className="flex flex-col items-center space-y-4 text-center mx-auto max-w-4xl">
            <p className="mx-auto max-w-[700px] text-foreground/80 text-base sm:text-lg md:text-xl">
              The living process map for modern operations. Define, trace, and
              fix your core business processes with the only platform that
              validates reality against design.
            </p>
            <Button size="lg" variant="cta" asChild>
              <Link href="#contact">Get Early Access</Link>
            </Button>
          </div>
        </div>

        {/* Spacer to account for curve height below content */}
        <div style={{ height: LAYOUT.HERO_BUTTON_TO_CURVE_PADDING }} />
      </div>
    </section>
  )
}
