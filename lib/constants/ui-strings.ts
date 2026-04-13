/**
 * Centralized UI strings for consistent messaging across the application.
 * This file contains all user-facing text that appears in multiple places.
 */

import { ACCEPTED_FILE_TYPES } from '@/lib/api-constants'

// ============================================
// Validation Messages
// ============================================

export const VALIDATION = {
  /** Company selection requirement */
  companyRequired:
    'Company is required. Please select a company from the sidebar.',

  /** Generic field required message */
  fieldRequired: (fieldName: string) => `${fieldName} is required`,

  /** Field character limit message */
  fieldMaxChars: (fieldName: string, max: number) =>
    `${fieldName} must be ${max} characters or less`,

  /** Shorter max chars message for inline validation */
  maxChars: (max: number) => `Maximum ${max} characters`,

  /** Invalid email format */
  invalidEmail: 'Invalid email format',

  /** Invalid phone format */
  invalidPhone:
    'Please enter a valid phone number (e.g., +1-555-123-4567 or 555-123-4567)',

  /** Invalid selection */
  invalidSelection: (fieldName: string) => `Please select a valid ${fieldName}`,

  /** At least one required */
  atLeastOne: (fieldName: string) => `At least one ${fieldName} is required`,
} as const

// ============================================
// Loading States
// ============================================

export const LOADING = {
  generic: 'Loading...',
  entity: (entityType: string) => `Loading ${entityType}...`,
  uploading: 'Uploading...',
  analyzing: 'Analyzing...',
  processing: 'Processing...',
  saving: 'Saving...',
  deleting: 'Deleting...',
  migrating: 'Migrating...',
  downloading: 'Downloading...',
} as const

// ============================================
// Button Labels
// ============================================

export const BUTTONS = {
  upload: (entityType: string) => `Upload ${entityType} File`,
  create: (entityType: string) => `Create ${entityType}`,
  edit: 'Edit',
  delete: 'Delete',
  download: 'Download',
  downloadJSON: 'Download JSON',
  downloadText: 'Download Text',
  analyze: 'Analyze',
  save: 'Save',
  cancel: 'Cancel',
  back: (entityType: string) => `Back to ${entityType}s`,
  addStep: 'Add Step',
} as const

// ============================================
// File Upload Messages
// ============================================

export const FILE_ACCEPTANCE = {
  sop: `Only ${ACCEPTED_FILE_TYPES.SOP.split(',').join(', ')} files are allowed.`,
  log: `Only ${ACCEPTED_FILE_TYPES.LOG.split(',').join(', ')} files are allowed.`,
} as const

// ============================================
// Empty States
// ============================================

export const EMPTY_STATES = {
  noCompanySelected: 'No company selected',
  noCompany: 'Please select a company from the sidebar to continue.',
  noData: (entityType: string) => `No ${entityType.toLowerCase()}s found`,
  noSteps: 'No steps defined.',
  noResults: 'No results found',
} as const

// ============================================
// Error Messages
// ============================================

export const ERRORS = {
  notFound: (entityType: string) => `${entityType} not found`,
  loadFailed: (entityType: string) => `Failed to load ${entityType}`,
  saveFailed: (entityType: string) => `Failed to save ${entityType}`,
  deleteFailed: (entityType: string) => `Failed to delete ${entityType}`,
  uploadFailed: 'Failed to upload file',
  analysisFailed: (entityType: string) => `Failed to analyze ${entityType}`,
  invalidJson: 'Invalid JSON format',
  fixJsonError: 'Please fix the JSON error before uploading',
} as const

// ============================================
// Confirmation Messages
// ============================================

export const CONFIRMATIONS = {
  /** Delete single entity confirmation */
  deleteEntity: (entityType: string, entityName: string) =>
    `Are you sure you want to delete the ${entityType.toLowerCase()} "${entityName}"? This action cannot be undone.`,

  /** Delete all entities confirmation */
  deleteAll: (entityType: string, count: number) =>
    `Are you sure you want to delete ALL ${entityType.toLowerCase()}s? This will permanently delete ${count} item${count !== 1 ? 's' : ''}. This action cannot be undone.`,
} as const

// ============================================
// Form Labels
// ============================================

export const FORM_LABELS = {
  name: 'Name',
  description: 'Description',
  email: 'Email',
  phone: 'Phone Number',
  address: 'Address',
  required: (label: string) => `${label} *`,
} as const

// ============================================
// Placeholders
// ============================================

export const PLACEHOLDERS = {
  enterName: (entityType: string) => `Enter ${entityType.toLowerCase()} name`,
  enterDescription: (entityType: string) =>
    `Enter ${entityType.toLowerCase()} description`,
  enterEmail: 'Enter email address',
  enterPhone: 'Enter phone number',
  selectOption: (optionType: string) => `Select ${optionType.toLowerCase()}...`,
  metadataJson: 'Enter metadata as JSON (e.g., {"key": "value"})',
} as const
