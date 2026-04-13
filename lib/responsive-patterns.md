# Responsive Design Patterns

This document defines the responsive design patterns used throughout the ops-ui application. All components should follow these patterns for consistency.

## Padding Scale (Desktop-First)

- **Component Padding**: `p-responsive-md` (auto-scales: 16px → 20px @ md → 20px @ lg)
- **Card Padding**: `p-responsive-md sm:p-responsive-lg md:p-responsive-xl`
- **Tight Spacing**: `p-responsive-xs` (8px → 12px)
- **Generous Spacing**: `p-responsive-xl` (32px → 40px → 48px)

### Manual Responsive Padding Pattern

When not using CSS variable classes, follow this pattern:

```tsx
<div className="p-3 md:p-4 lg:p-6">
  {/* Mobile: 12px, Tablet: 16px, Desktop: 24px */}
</div>
```

## Layout Patterns

### Stacking Pattern

Stack elements vertically on mobile/tablet, display in a row on desktop:

```tsx
<div className="flex flex-col lg:flex-row">{/* Children */}</div>
```

### Grid Multi-Column

Single column on mobile, 2 columns on large screens, 3 columns on XL:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Button Groups

Stack buttons vertically on mobile, display in a row on small screens and up:

```tsx
<div className="flex flex-col sm:flex-row gap-2">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

## Text Sizing

- **Body Text**: `text-responsive-sm` (14px → 16px) or manual `text-sm md:text-base`
- **Headings**:
  - H1: `text-responsive-3xl` (30px → 36px → 40px) or manual `text-2xl md:text-3xl lg:text-4xl`
  - H2: `text-responsive-2xl` (24px → 30px) or manual `text-xl md:text-2xl`
  - H3: `text-responsive-xl` (20px → 24px) or manual `text-lg md:text-xl`
- **Labels**: `text-responsive-xs` (12px → 14px) or manual `text-xs md:text-sm`

### Manual Text Sizing Pattern

```tsx
<h1 className="text-2xl md:text-3xl font-bold">
  {/* Mobile: 24px, Desktop: 30px */}
</h1>

<p className="text-sm md:text-base">
  {/* Mobile: 14px, Desktop: 16px */}
</p>
```

## Table Column Hiding

### Strategy

Show progressively more columns as screen size increases:

- **Essential Only (Mobile)**: Always visible columns (no breakpoint classes)
- **Secondary Info (Tablet+)**: `hidden md:table-cell`
- **Tertiary Details (Desktop)**: `hidden lg:table-cell`
- **Extra Details (Desktop XL)**: `hidden xl:table-cell`

### Example

```tsx
<Table>
  <TableHeader>
    <TableRow>
      {/* Always visible - Mobile */}
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>

      {/* Tablet+ */}
      <TableHead className="hidden md:table-cell">Email</TableHead>
      <TableHead className="hidden md:table-cell">Phone</TableHead>

      {/* Desktop+ */}
      <TableHead className="hidden lg:table-cell">Role</TableHead>
      <TableHead className="hidden lg:table-cell">Department</TableHead>

      {/* Desktop XL+ */}
      <TableHead className="hidden xl:table-cell">Manager</TableHead>

      {/* Always visible - Actions */}
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell className="hidden md:table-cell">{row.email}</TableCell>
        <TableCell className="hidden md:table-cell">{row.phone}</TableCell>
        <TableCell className="hidden lg:table-cell">{row.role}</TableCell>
        <TableCell className="hidden lg:table-cell">{row.department}</TableCell>
        <TableCell className="hidden xl:table-cell">{row.manager}</TableCell>
        <TableCell>
          <Button size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Mobile Expanded Row Pattern

For tables with many hidden columns, show hidden data in an expandable row on mobile:

```tsx
{
  expandedRows.has(row.id) && (
    <TableRow>
      <TableCell colSpan={8} className="bg-muted/30 p-3">
        {/* Mobile: Show hidden essential info */}
        <div className="md:hidden space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Email:</span> {row.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {row.phone}
            </div>
            <div>
              <span className="font-medium">Role:</span> {row.role}
            </div>
            <div>
              <span className="font-medium">Manager:</span> {row.manager}
            </div>
          </div>
        </div>
        {/* Additional details */}
      </TableCell>
    </TableRow>
  )
}
```

## Touch Targets

### Minimum Sizes

- **Mobile**: `min-h-11 min-w-11` (44px) for all interactive elements (WCAG 2.1 AA compliant)
- **Desktop**: Can be smaller (36px minimum) via `md:min-h-9 md:min-w-9`

### Button Sizing

```tsx
// Default button: 44px on mobile, 40px on desktop
<Button className="h-11 md:h-10">Action</Button>

// Icon button: 44px square on mobile, 40px on desktop
<Button size="icon" className="h-11 w-11 md:h-10 md:w-10">
  <Icon className="h-5 w-5" />
</Button>
```

## Form Layouts

### Multi-Column Desktop Layout

Single column on mobile/tablet, 2 columns on desktop:

```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Full-width field */}
    <div className="lg:col-span-2">
      <FormField name="name" />
    </div>

    {/* Side-by-side on desktop */}
    <FormField name="email" />
    <FormField name="phone" />

    {/* Full-width field */}
    <div className="lg:col-span-2">
      <FormField name="address" />
    </div>
  </div>

  {/* Actions - Right-aligned on desktop */}
  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
    <Button type="button" variant="outline">
      Cancel
    </Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

## Dialog/Modal Sizing

```tsx
// DialogContent responsive width
className={cn(
  "w-[calc(100%-2rem)] max-w-md",  // Mobile: screen width - 32px, max 448px
  "md:max-w-lg lg:max-w-2xl",      // Desktop: 512px → 672px
  "p-4 md:p-6 lg:p-8"              // Responsive padding
)}
```

## Breakpoints Reference

Tailwind breakpoints used throughout the app:

- **sm**: 640px (small screens)
- **md**: 768px (tablets)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)
- **2xl**: 1536px (extra large desktops)

## CSS Variables Reference

### Spacing Scale

| Variable       | Mobile | Tablet (md) | Desktop (lg) |
| -------------- | ------ | ----------- | ------------ |
| `--spacing-xs` | 8px    | 12px        | 12px         |
| `--spacing-sm` | 12px   | 16px        | 16px         |
| `--spacing-md` | 16px   | 20px        | 20px         |
| `--spacing-lg` | 24px   | 28px        | 28px         |
| `--spacing-xl` | 32px   | 40px        | 48px         |

### Typography Scale

| Variable      | Mobile | Tablet (md) | Desktop (lg) |
| ------------- | ------ | ----------- | ------------ |
| `--text-xs`   | 12px   | 14px        | 14px         |
| `--text-sm`   | 14px   | 16px        | 16px         |
| `--text-base` | 16px   | 18px        | 18px         |
| `--text-lg`   | 18px   | 20px        | 20px         |
| `--text-xl`   | 20px   | 24px        | 24px         |
| `--text-2xl`  | 24px   | 30px        | 30px         |
| `--text-3xl`  | 30px   | 36px        | 40px         |

## Best Practices

1. **Desktop-First Approach**: Optimize for desktop first, then ensure mobile usability
2. **Touch Targets**: Always maintain 44px minimum on mobile for interactive elements
3. **Text Zoom Prevention**: Use `text-base` (16px) or larger on mobile inputs to prevent iOS zoom
4. **Consistent Spacing**: Use the spacing scale variables or manual patterns consistently
5. **Column Hiding**: Show 3-5 essential columns on mobile, reveal more on larger screens
6. **Expanded Rows**: Use expanded rows to show hidden table data on mobile
7. **Responsive Images**: Always set responsive sizing and min-widths on icon/image elements
8. **Truncation**: Use `truncate`, `break-words`, `break-all`, `min-w-0` as needed to prevent overflow

## Examples in Codebase

Good examples of responsive patterns:

- `/components/ui/card.tsx` - Responsive padding pattern
- `/components/ui/RoleList.tsx` - Responsive card layout
- `/components/ui/EmployeeTableView.tsx` - Table column hiding with expanded rows
- `/app/sop/SopPageContent.tsx` - Accordion with responsive text and spacing
- `/components/PageLayout.tsx` - Master layout with responsive padding and text
