'use client'

import { cn } from '@/lib/utils'

interface HeroCurveProps {
  className?: string
  /** Height of the curve portion in pixels */
  curveHeight?: number
  /** Height of the vertical line extending below the curve */
  lineHeight?: number
  /** Whether to show the vertical line */
  showLine?: boolean
  /**
   * Controls how "pointed" the curve is (0-500).
   * Lower values = more pointed center, gentler edges
   * Higher values = flatter center, steeper edges (more ellipse-like)
   * Default: 300
   */
  controlPoint?: number
}

/**
 * SVG-based bezier curve for the hero section.
 * Creates a curve that is more pointed at center and gentler at edges.
 * Optionally includes a vertical line extending from the bottom center.
 */
export function HeroCurve({
  className,
  curveHeight = 300,
  lineHeight = 0,
  showLine = false,
  controlPoint = 300,
}: HeroCurveProps) {
  // ViewBox dimensions
  const viewBoxWidth = 1000
  const totalHeight = curveHeight + lineHeight
  const centerX = viewBoxWidth / 2

  // Bezier control points - symmetric on left and right
  const controlX1 = controlPoint
  const controlX2 = viewBoxWidth - controlPoint

  // Calculate actual curve bottom (bezier doesn't reach control point y-value)
  // For this symmetric cubic bezier, the curve reaches ~75% of curveHeight at center
  const curveBottomY = curveHeight * 0.75

  // Closed path for fill (with Z to close)
  const fillPath = `M 0,0 C ${controlX1},${curveHeight} ${controlX2},${curveHeight} ${viewBoxWidth},0 Z`

  // Open path for stroke - only the curve, no top line
  const strokePath = `M 0,0 C ${controlX1},${curveHeight} ${controlX2},${curveHeight} ${viewBoxWidth},0`

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${totalHeight}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height: `${totalHeight}px` }}
      aria-hidden="true"
    >
      {/* Fill with solid color */}
      <path d={fillPath} className="hero-curve-fill" />

      {/* Stroke - only on the curve portion, not the top */}
      <path
        d={strokePath}
        fill="none"
        className="hero-curve-stroke"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* Vertical line extending from actual bottom of curve */}
      {showLine && lineHeight > 0 && (
        <line
          x1={centerX}
          y1={curveBottomY}
          x2={centerX}
          y2={totalHeight}
          className="hero-curve-line"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}
