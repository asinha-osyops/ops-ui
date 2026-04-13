import * as z from 'zod'
import { RoleTitle, EventCategory, Platform } from '@/lib/api-client'
import { zodBuilders } from './schema-builders'

export const logLineEventTypeMappingSchema = z.object({
  platform: z.nativeEnum(Platform),
  service: z.string().min(1, 'Service is required'),
  event: z.string().min(1, 'Event is required'),
})

export const activityEventSchema = z.object({
  companyId: zodBuilders.requiredUuid('company'),
  name: zodBuilders.requiredString('Activity event name', 'ROLE_NAME'),
  description: zodBuilders.optionalString('ROLE_DESCRIPTION'),
  associatedRoleTitles: zodBuilders.optionalArray(z.nativeEnum(RoleTitle)),
  associatedEventCategories: zodBuilders.optionalArray(
    z.nativeEnum(EventCategory)
  ),
  logLineEventTypeMappings: zodBuilders.optionalArray(
    logLineEventTypeMappingSchema
  ),
})

export type ActivityEventFormValues = z.infer<typeof activityEventSchema>
export type LogLineEventTypeMappingFormValues = z.infer<
  typeof logLineEventTypeMappingSchema
>

/** Schema for the create activity event form (no companyId needed) */
export const activityEventCreateSchema = activityEventSchema.omit({
  companyId: true,
})
export type ActivityEventCreateFormValues = z.infer<
  typeof activityEventCreateSchema
>
