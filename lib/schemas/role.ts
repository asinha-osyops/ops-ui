import * as z from 'zod'
import { RoleTitle } from '@/lib/api-client'
import { zodBuilders } from './schema-builders'

export const roleSchema = z.object({
  companyId: zodBuilders.requiredUuid('company'),
  name: zodBuilders.requiredString('Role name', 'ROLE_NAME'),
  title: zodBuilders.requiredEnum(RoleTitle, 'role title'),
  description: zodBuilders.optionalString('ROLE_DESCRIPTION'),
  responsibilities: zodBuilders.optionalString('ROLE_RESPONSIBILITIES'),
})

export type RoleFormValues = z.infer<typeof roleSchema>
