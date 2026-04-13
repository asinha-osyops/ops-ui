'use client'

import { cn } from '@/lib/utils'

/**
 * Shape configuration for the divider line shapes.
 * Each shape has its own viewBox, dimensions, and path definitions.
 */
type ShapeType = 'circle' | 'diamond' | 'rectangle' | 'pentagon'

interface ShapeConfig {
  viewBox: string
  width: number
  height: number
  centerX: number
  centerY: number
  viewBoxHeight: number
  renderBackground: (props: { className: string }) => React.ReactNode
  renderShape: (props: { className: string }) => React.ReactNode
}

const shapeConfigs: Record<ShapeType, ShapeConfig> = {
  circle: {
    viewBox: '0 0 120 120',
    width: 60,
    height: 60,
    centerX: 60,
    centerY: 60,
    viewBoxHeight: 120,
    renderBackground: ({ className }) => (
      <circle cx={60} cy={60} r={44} className={className} />
    ),
    renderShape: ({ className }) => (
      <circle
        cx={60}
        cy={60}
        r={42}
        className={className}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    ),
  },
  diamond: {
    viewBox: '0 0 116 116',
    width: 58,
    height: 58,
    centerX: 58,
    centerY: 58,
    viewBoxHeight: 116,
    renderBackground: ({ className }) => (
      <polygon points="58,6 110,58 58,110 6,58" className={className} />
    ),
    renderShape: ({ className }) => (
      <polygon
        points="58,10 106,58 58,106 10,58"
        className={className}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    ),
  },
  rectangle: {
    viewBox: '0 0 120 94',
    width: 60,
    height: 47,
    centerX: 60,
    centerY: 47,
    viewBoxHeight: 94,
    renderBackground: ({ className }) => (
      <rect x={8} y={8} width={104} height={78} rx={3} className={className} />
    ),
    renderShape: ({ className }) => (
      <rect
        x={12}
        y={12}
        width={96}
        height={70}
        rx={3}
        className={className}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    ),
  },
  pentagon: {
    viewBox: '0 0 132 127',
    width: 66,
    height: 64,
    centerX: 66,
    centerY: 64,
    viewBoxHeight: 127,
    renderBackground: ({ className }) => (
      <polygon points="66,8 124,49 102,119 30,119 8,49" className={className} />
    ),
    renderShape: ({ className }) => (
      <polygon
        points="66,12 120,51 99,115 33,115 12,51"
        className={className}
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    ),
  },
}

interface ShapeProps {
  type: ShapeType
  className?: string
  lineAboveHeight?: number
  lineBelowHeight?: number
  showLineAbove?: boolean
  showLineBelow?: boolean
}

/**
 * Unified shape component that renders any of the geometric shapes
 * with optional lines extending above and below.
 */
export function Shape({
  type,
  className,
  lineAboveHeight = 200,
  lineBelowHeight = 200,
  showLineAbove = true,
  showLineBelow = true,
}: ShapeProps) {
  const config = shapeConfigs[type]
  // Scale factor: viewBox / rendered size = 2:1 ratio
  const scale = 2

  return (
    <svg
      viewBox={config.viewBox}
      className={cn(`w-[${config.width}px] h-[${config.height}px]`, className)}
      style={{
        overflow: 'visible',
        width: config.width,
        height: config.height,
      }}
      aria-hidden="true"
    >
      {/* Lines drawn FIRST (behind everything) */}
      {showLineAbove && (
        <line
          x1={config.centerX}
          y1={-lineAboveHeight * scale}
          x2={config.centerX}
          y2={config.centerY}
          className="divider-line"
        />
      )}
      {showLineBelow && (
        <line
          x1={config.centerX}
          y1={config.centerY}
          x2={config.centerX}
          y2={config.viewBoxHeight + lineBelowHeight * scale}
          className="divider-line"
        />
      )}

      {/* Background fill SECOND (masks lines) */}
      {config.renderBackground({ className: 'divider-shape-bg' })}

      {/* Visible shape LAST (on top) */}
      {config.renderShape({ className: 'divider-shape' })}
    </svg>
  )
}

// Legacy exports for backward compatibility
export function CircleShape(props: Omit<ShapeProps, 'type'>) {
  return <Shape type="circle" {...props} />
}

export function DiamondShape(props: Omit<ShapeProps, 'type'>) {
  return <Shape type="diamond" {...props} />
}

export function RectangleShape(props: Omit<ShapeProps, 'type'>) {
  return <Shape type="rectangle" {...props} />
}

export function PentagonShape(props: Omit<ShapeProps, 'type'>) {
  return <Shape type="pentagon" {...props} />
}

/**
 * Shape positioned at row center with lines extending above and below.
 */
interface DividerShapeWithLinesProps {
  shape: ShapeType
  lineAbove?: boolean
  lineBelow?: boolean
  lineAboveHeight?: number
  lineBelowHeight?: number
  className?: string
}

export function DividerShapeWithLines({
  shape,
  lineAbove = true,
  lineBelow = true,
  lineAboveHeight = 200,
  lineBelowHeight = 200,
  className,
}: DividerShapeWithLinesProps) {
  return (
    <div
      className={cn(
        'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block',
        className
      )}
      style={{ top: 'var(--bento-shape-offset, 100px)' }}
    >
      <Shape
        type={shape}
        showLineAbove={lineAbove}
        showLineBelow={lineBelow}
        lineAboveHeight={lineAboveHeight}
        lineBelowHeight={lineBelowHeight}
      />
    </div>
  )
}

/**
 * Horizontal divider with centered shape - for mobile layout
 */
interface HorizontalDividerProps {
  shape: ShapeType
  className?: string
}

export function HorizontalDivider({
  shape,
  className,
}: HorizontalDividerProps) {
  const config = shapeConfigs[shape]

  return (
    <div
      className={cn(
        'flex items-center justify-center pb-6 md:hidden',
        className
      )}
    >
      {/* Shape only - no lines on mobile */}
      <svg
        viewBox={config.viewBox}
        style={{
          width: config.width * 0.8,
          height: config.height * 0.8,
        }}
        aria-hidden="true"
      >
        {config.renderBackground({ className: 'divider-shape-bg' })}
        {config.renderShape({ className: 'divider-shape' })}
      </svg>
    </div>
  )
}
