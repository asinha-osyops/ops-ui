import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { ChartColor } from '@/lib/types/colorscheme'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 md:px-2.5 py-0.5 text-xs md:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  chartColor?: ChartColor // Optional chart color
}

function Badge({ className, variant, chartColor, ...props }: BadgeProps) {
  const chartColorClasses = chartColor
    ? `bg-chart-${chartColor}/10 text-chart-${chartColor} border-chart-${chartColor}/20`
    : ''

  return (
    <div
      className={cn(badgeVariants({ variant }), chartColorClasses, className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
