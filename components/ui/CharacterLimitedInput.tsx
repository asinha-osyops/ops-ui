import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface BaseProps {
  value: string
  maxLength: number
  label?: string
}

interface InputProps
  extends
    BaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'maxLength' | 'value'> {
  multiline?: false
}

interface TextareaProps
  extends
    BaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength' | 'value'> {
  multiline: true
  rows?: number
}

type CharacterLimitedInputProps = InputProps | TextareaProps

/**
 * Character-limited input component that extends shadcn Input/Textarea
 * Displays character count and enforces max length
 */
export function CharacterLimitedInput(props: CharacterLimitedInputProps) {
  const {
    value,
    maxLength,
    label,
    multiline = false,
    className = '',
    id,
    ...restProps
  } = props

  return (
    <div>
      {label && (
        <Label htmlFor={id} className="block mb-2">
          {label}
        </Label>
      )}
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          className={cn('resize-none', className)}
          rows={(props as TextareaProps).rows || 3}
          maxLength={maxLength}
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          id={id}
          type="text"
          value={value}
          className={className}
          maxLength={maxLength}
          {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      <div className="text-xs text-muted-foreground mt-1 text-right">
        {value.length}/{maxLength} characters
      </div>
    </div>
  )
}
