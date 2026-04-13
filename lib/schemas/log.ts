import * as z from 'zod'
import { LoggingSource } from '@/lib/api-client'
import { zodBuilders } from './schema-builders'

export const logSchema = z.object({
  logName: zodBuilders.requiredString('Log name', 'LOG_NAME'),
  loggingSource: zodBuilders.requiredEnum(LoggingSource, 'logging source'),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type LogFormValues = z.infer<typeof logSchema>
