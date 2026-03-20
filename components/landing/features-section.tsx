'use client'

import { RefObject } from 'react'
import {
  DividerShapeWithLines,
  HorizontalDivider,
} from '@/components/landing/divider-shapes'
import { useScrollFade } from '@/hooks/use-scroll-fade'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/landing/constants'
import { ScreenshotPlaceholder } from '@/components/landing/screenshot-placeholder'

interface FeaturesSectionProps {
  /** Ref to the contact section for triggering fade */
  contactSectionRef: RefObject<HTMLElement | null>
  className?: string
}

export function FeaturesSection({
  contactSectionRef,
  className,
}: FeaturesSectionProps) {
  const { style: fadeStyle } = useScrollFade({
    triggerRef: contactSectionRef,
    rootMargin: '0px 0px -30% 0px',
  })

  return (
    <section
      className={cn(
        'container mx-auto px-4 md:px-6 pt-2 md:pt-8 pb-24',
        className
      )}
      style={fadeStyle}
    >
      <div className="relative max-w-5xl mx-auto">
        {/* Mobile: Circle shape above Row 1 */}
        <HorizontalDivider shape="circle" />

        {/* Row 1: Screenshot left, Text right */}
        <div
          className="relative grid md:grid-cols-2"
          style={{
            gap: 'var(--bento-row-gap)',
            paddingBottom: 'var(--bento-row-padding)',
          }}
        >
          {/* Circle shape with vertical lines - desktop only */}
          <DividerShapeWithLines
            shape="circle"
            lineAbove={true}
            lineBelow={true}
            lineAboveHeight={LAYOUT.FEATURES_FIRST_LINE_HEIGHT}
            lineBelowHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
          />

          {/* Left: Screenshot card */}
          <div className="flex items-center justify-center md:justify-end">
            <ScreenshotPlaceholder
              src="/screenshot_1.png"
              alt="Define The Standard - Product screenshot"
            />
          </div>

          {/* Right: Text content */}
          <div className="flex items-center justify-center md:justify-start">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground uppercase">
                Define The Standard
              </h2>
              <p className="text-foreground/80">
                Convert disparate docs into a structured, living blueprint.
                Establish the ideal path that aligns your teams today and
                governs your AI agents tomorrow.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Diamond shape between Row 1 and 2 */}
        <HorizontalDivider shape="diamond" />

        {/* Row 2: Text left, Screenshot right */}
        <div
          className="relative grid md:grid-cols-2"
          style={{
            gap: 'var(--bento-row-gap)',
            paddingBottom: 'var(--bento-row-padding)',
          }}
        >
          {/* Diamond shape with vertical lines - desktop only */}
          <DividerShapeWithLines
            shape="diamond"
            lineAbove={true}
            lineBelow={true}
            lineAboveHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
            lineBelowHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
          />

          {/* Left: Text content */}
          <div className="flex items-center justify-center md:justify-end order-2 md:order-1">
            <div className="space-y-3 text-center md:text-right">
              <h2 className="text-2xl font-bold text-foreground uppercase">
                Trace The Reality
              </h2>
              <p className="text-foreground/80">
                Connect system signals to map the precise journey of every unit
                of work. Expose &quot;shadow processes&quot; missed by static
                documentation and manual tracking.
              </p>
            </div>
          </div>

          {/* Right: Screenshot card */}
          <div className="flex items-center justify-center md:justify-start order-1 md:order-2">
            <ScreenshotPlaceholder
              src="/screenshot_2.png"
              alt="Trace The Reality - Product screenshot"
            />
          </div>
        </div>

        {/* Mobile: Rectangle shape between Row 2 and 3 */}
        <HorizontalDivider shape="rectangle" />

        {/* Row 3: Screenshot left, Text right */}
        <div
          className="relative grid md:grid-cols-2"
          style={{
            gap: 'var(--bento-row-gap)',
            paddingBottom: 'var(--bento-row-padding)',
          }}
        >
          {/* Rectangle shape with vertical lines - desktop only */}
          <DividerShapeWithLines
            shape="rectangle"
            lineAbove={true}
            lineBelow={true}
            lineAboveHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
            lineBelowHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
          />

          {/* Left: Screenshot card */}
          <div className="flex items-center justify-center md:justify-end">
            <ScreenshotPlaceholder
              src="/screenshot_3.png"
              alt="Measure The Drift - Product screenshot"
            />
          </div>

          {/* Right: Text content */}
          <div className="flex items-center justify-center md:justify-start">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground uppercase">
                Measure The Drift
              </h2>
              <p className="text-foreground/80">
                Replace vanity metrics with real-time conformance. Quantify the
                &quot;execution gap&quot; between design and reality to manage
                human and agentic inefficiencies as you scale.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Pentagon shape after Row 3 */}
        <HorizontalDivider shape="pentagon" />

        {/* Pentagon at the bottom - desktop only (vertical) */}
        <div className="relative hidden md:block pb-6">
          <DividerShapeWithLines
            shape="pentagon"
            lineAbove={true}
            lineBelow={false}
            lineAboveHeight={LAYOUT.FEATURES_LINE_BETWEEN_HEIGHT}
          />
        </div>
      </div>
    </section>
  )
}
