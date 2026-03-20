/**
 * Reusable Zod schema builders for consistent validation patterns.
 * These builders reduce duplication across individual schema files.
 */

import * as z from 'zod'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { VALIDATION } from '@/lib/constants/ui-strings'

type CharacterLimitKey = keyof typeof CHARACTER_LIMITS

/**
 * Schema builders for common field patterns.
 */
export const zodBuilders = {
  /**
   * Required string field with character limit.
   * @example zodBuilders.requiredString('SOP name', 'SOP_NAME')
   */
  requiredString: (fieldName: string, limitKey: CharacterLimitKey) =>
    z
      .string()
      .min(1, VALIDATION.fieldRequired(fieldName))
      .max(
        CHARACTER_LIMITS[limitKey],
        VALIDATION.maxChars(CHARACTER_LIMITS[limitKey])
      ),

  /**
   * Optional string field with character limit.
   * @example zodBuilders.optionalString('ROLE_DESCRIPTION')
   */
  optionalString: (limitKey: CharacterLimitKey) =>
    z
      .string()
      .max(
        CHARACTER_LIMITS[limitKey],
        VALIDATION.maxChars(CHARACTER_LIMITS[limitKey])
      )
      .optional(),

  /**
   * Required email field with validation and character limit.
   * @example zodBuilders.requiredEmail('COMPANY_EMAIL')
   */
  requiredEmail: (limitKey: CharacterLimitKey = 'COMPANY_EMAIL') =>
    z
      .string()
      .min(1, VALIDATION.fieldRequired('Email'))
      .email(VALIDATION.invalidEmail)
      .max(
        CHARACTER_LIMITS[limitKey],
        VALIDATION.maxChars(CHARACTER_LIMITS[limitKey])
      ),

  /**
   * Required phone field with validation and character limit.
   * Uses basic regex validation - for advanced validation use libphonenumber-js.
   * @example zodBuilders.requiredPhone('COMPANY_PHONE')
   */
  requiredPhone: (limitKey: CharacterLimitKey = 'COMPANY_PHONE') =>
    z
      .string()
      .min(1, VALIDATION.fieldRequired('Phone number'))
      .max(
        CHARACTER_LIMITS[limitKey],
        VALIDATION.maxChars(CHARACTER_LIMITS[limitKey])
      )
      .regex(
        /^\+?[1-9]\d{1,14}$|^\d{3}[-.]?\d{3}[-.]?\d{4}$/,
        'Invalid phone number format'
      ),

  /**
   * Required UUID field (for foreign keys/selections).
   * @example zodBuilders.requiredUuid('company')
   */
  requiredUuid: (fieldName: string) =>
    z.string().uuid(VALIDATION.invalidSelection(fieldName)),

  /**
   * Optional UUID field (nullable).
   * @example zodBuilders.optionalUuid()
   */
  optionalUuid: () => z.string().uuid().optional().nullable(),

  /**
   * Required enum selection with error message.
   * Note: For enum validation, use z.nativeEnum directly in schemas with the error option.
   * @example z.nativeEnum(LoggingSource, { error: VALIDATION.invalidSelection('logging source') })
   */
  requiredEnum: <T extends Record<string, string | number>>(
    enumType: T,
    fieldName: string
  ) =>
    z.nativeEnum(enumType, {
      error: VALIDATION.invalidSelection(fieldName),
    }),

  /**
   * Optional enum selection.
   * @example zodBuilders.optionalEnum(RoleTitle)
   */
  optionalEnum: <T extends Record<string, string | number>>(enumType: T) =>
    z.nativeEnum(enumType).optional().nullable(),

  /**
   * Required array with minimum one item.
   * @example zodBuilders.requiredArray(z.nativeEnum(Pillar), 'pillar')
   */
  requiredArray: <T extends z.ZodType>(itemSchema: T, fieldName: string) =>
    z.array(itemSchema).min(1, VALIDATION.atLeastOne(fieldName)),

  /**
   * Optional array.
   * @example zodBuilders.optionalArray(z.string())
   */
  optionalArray: <T extends z.ZodType>(itemSchema: T) =>
    z.array(itemSchema).optional(),
} as const
