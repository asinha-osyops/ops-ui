'use client'

import Link from 'next/link'
import React, { ReactNode } from 'react'
import { Route, Breadcrumb } from '@/lib/routes'
import { cn } from '@/lib/utils'
import {
  Breadcrumb as BreadcrumbNav,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Re-export Breadcrumb type from routes for convenience
type BreadcrumbItem = Breadcrumb

interface PageLayoutProps {
  title: string
  titleClassName?: string // Optional class for title color
  breadcrumbs: BreadcrumbItem[]
  headerActions?: ReactNode // Buttons in top-right
  children: ReactNode // Main content
  className?: string // Optional additional classes for container
  includeHomeBreadcrumb?: boolean // Auto-prepend Home breadcrumb (default true)
}

/**
 * Reusable page layout wrapper component
 *
 * Provides consistent structure across all pages with:
 * - Main container with standard padding and overflow
 * - Max-width content wrapper
 * - Breadcrumb navigation with clickable links
 * - Page header with title and action buttons
 *
 * @example
 * <PageLayout
 *   title="SOP Management"
 *   breadcrumbs={[{ label: 'SOPs' }]}
 *   headerActions={
 *     <>
 *       <Button variant="outline">Delete All</Button>
 *       <Button>Create New SOP</Button>
 *     </>
 *   }
 * >
 *   <div>Page content here</div>
 * </PageLayout>
 *
 * Note: Home breadcrumb is automatically prepended unless includeHomeBreadcrumb={false}
 */
export function PageLayout({
  title,
  titleClassName,
  breadcrumbs,
  headerActions,
  children,
  className,
  includeHomeBreadcrumb = true,
}: PageLayoutProps) {
  const fullBreadcrumbs = includeHomeBreadcrumb
    ? [{ label: 'Home', route: Route.HOME }, ...breadcrumbs]
    : breadcrumbs

  return (
    <main
      className={cn(
        'flex-1 p-4 md:p-6 lg:p-8 overflow-auto font-primary',
        className
      )}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <BreadcrumbNav className="mb-3 md:mb-4">
          <BreadcrumbList className="text-xs md:text-sm">
            {fullBreadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.route ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.route}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </BreadcrumbNav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <h1 className={cn('text-2xl md:text-3xl font-bold', titleClassName)}>
            {title}
          </h1>
          {headerActions && (
            <div className="flex flex-wrap gap-2">{headerActions}</div>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </main>
  )
}
