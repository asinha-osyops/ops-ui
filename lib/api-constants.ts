// Delete password — configurable via env var
export const DELETE_PASSWORD =
  process.env.NEXT_PUBLIC_DELETE_PASSWORD || 'delete'

// API Headers
export const API_HEADERS = {
  JSON: { 'Content-Type': 'application/json' } as const,
  DELETE: { 'X-Delete-Password': DELETE_PASSWORD },
  JSON_WITH_DELETE: {
    'Content-Type': 'application/json',
    'X-Delete-Password': DELETE_PASSWORD,
  },
} as const

// File upload accepted types
export const ACCEPTED_FILE_TYPES = {
  SOP: '.pdf,.doc,.docx',
  LOG: '.log,.txt,.csv,.json',
} as const

// Character limits
export const CHARACTER_LIMITS = {
  COMPANY_NAME: 200,
  COMPANY_ADDRESS: 500,
  COMPANY_PHONE: 50,
  COMPANY_EMAIL: 200,
  SOP_NAME: 100,
  SOP_DESCRIPTION: 500,
  ROLE_NAME: 200,
  ROLE_TITLE: 100,
  ROLE_DESCRIPTION: 500,
  ROLE_RESPONSIBILITIES: 1000,
  STEP_NAME: 100,
  STEP_DETAILS: 500,
  STEP_POST_DOC: 500,
  STEP_MONITORING: 500,
  LOG_NAME: 200,
  EMPLOYEE_NAME: 200,
  EMPLOYEE_PHONE: 50,
  EMPLOYEE_EMAIL: 200,
  EMPLOYEE_ROLE: 100,
} as const
