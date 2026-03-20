import * as z from 'zod'
import { RoleTitle } from '@/lib/api-client'
import { zodBuilders } from './schema-builders'

export const stepSchema = z.object({
  name: zodBuilders.requiredString('Step name', 'STEP_NAME'),
  details: zodBuilders.optionalString('STEP_DETAILS'),
  postStepDocumentation: zodBuilders.optionalString('STEP_POST_DOC'),
  monitoringRequirements: zodBuilders.optionalString('STEP_MONITORING'),
  actorRoleTitle: zodBuilders.optionalEnum(RoleTitle),
})

export const sopSchema = z.object({
  sopName: zodBuilders.requiredString('SOP name', 'SOP_NAME'),
  basicDescription: zodBuilders.requiredString(
    'Description',
    'SOP_DESCRIPTION'
  ),
  steps: z.array(stepSchema).optional(),
})

export type SopFormValues = z.infer<typeof sopSchema>
export type StepFormValues = z.infer<typeof stepSchema>
