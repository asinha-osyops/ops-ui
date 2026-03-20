import * as z from 'zod'
import { Pillar } from '@/lib/api-client'
import { zodBuilders } from './schema-builders'

export const companySchema = z.object({
  name: zodBuilders.requiredString('Company name', 'COMPANY_NAME'),
  address: zodBuilders.optionalString('COMPANY_ADDRESS'),
  phoneNumber: zodBuilders.requiredPhone('COMPANY_PHONE'),
  email: zodBuilders.requiredEmail('COMPANY_EMAIL'),
  ceoId: zodBuilders.optionalUuid(),
  pointOfContactId: zodBuilders.optionalUuid(),
  pillars: zodBuilders.requiredArray(z.nativeEnum(Pillar), 'pillar'),
})

export type CompanyFormValues = z.infer<typeof companySchema>
