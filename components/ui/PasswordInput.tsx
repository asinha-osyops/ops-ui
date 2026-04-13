'use client'

import * as React from 'react'
import { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  /**
   * Whether to show the password visibility toggle button
   * @default true
   */
  showToggle?: boolean
}

/**
 * Password input component with built-in visibility toggle.
 *
 * @example
 * <PasswordInput placeholder="Enter password" />
 *
 * @example
 * // With react-hook-form
 * <FormControl>
 *   <PasswordInput {...field} />
 * </FormControl>
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
