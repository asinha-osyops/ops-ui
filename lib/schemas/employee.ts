import * as z from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { CHARACTER_LIMITS } from '@/lib/api-constants'
import { VALIDATION } from '@/lib/constants/ui-strings'
import { zodBuilders } from './schema-builders'

export const employeeSchema = z.object({
  companyId: zodBuilders.requiredUuid('company'),
  name: zodBuilders.requiredString('Employee name', 'EMPLOYEE_NAME'),
  phoneNumber: z
    .string()
    .min(1, VALIDATION.fieldRequired('Phone number'))
    .max(
      CHARACTER_LIMITS.EMPLOYEE_PHONE,
      VALIDATION.maxChars(CHARACTER_LIMITS.EMPLOYEE_PHONE)
    )
    .refine((phone) => {
      try {
        return isValidPhoneNumber(phone) || isValidPhoneNumber(phone, 'US')
      } catch {
        return false
      }
    }, VALIDATION.invalidPhone),
  email: zodBuilders.requiredEmail('EMPLOYEE_EMAIL'),
  roleId: zodBuilders.optionalUuid(),
  managerId: zodBuilders.optionalUuid(),
})

// Form schema without companyId (passed as prop)
export const employeeFormSchema = employeeSchema.omit({ companyId: true })

export type EmployeeFormValues = z.infer<typeof employeeSchema>
export type EmployeeFormData = z.infer<typeof employeeFormSchema>
