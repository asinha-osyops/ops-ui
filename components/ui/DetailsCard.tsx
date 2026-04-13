import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './card'

interface DetailItem {
  label: string
  value: string | number | React.ReactNode
  condition?: boolean // optional conditional rendering
}

interface DetailsCardProps {
  title: string
  items: DetailItem[]
  className?: string
}

/**
 * Reusable component for displaying labeled details in a card layout
 * Now uses shadcn Card components for consistent styling
 *
 * @example
 * <DetailsCard
 *   title="Company Details"
 *   items={[
 *     { label: 'Name', value: company.name },
 *     { label: 'CEO', value: company.ceoName, condition: !!company.ceoName },
 *   ]}
 * />
 */
export function DetailsCard({
  title,
  items,
  className = '',
}: DetailsCardProps) {
  return (
    <Card className={`mb-6 ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ label, value, condition = true }) =>
          condition ? (
            <div key={label}>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {label}
              </p>
              <div className="text-sm text-foreground">
                {typeof value === 'string' || typeof value === 'number' ? (
                  <p>{value}</p>
                ) : (
                  value
                )}
              </div>
            </div>
          ) : null
        )}
      </CardContent>
    </Card>
  )
}
