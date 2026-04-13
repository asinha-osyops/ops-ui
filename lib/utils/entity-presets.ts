/**
 * Centralized configuration for entity create form presets.
 * Used by create pages to quickly fill forms with test/sample data.
 */

import { LoggingSource, Pillar } from '@/lib/api-client'

// ============================================================================
// Type Definitions
// ============================================================================

export interface CompanyPreset {
  label: string
  data: {
    name: string
    address: string
    phoneNumber: string
    email: string
    pillars: Pillar[]
  }
}

export interface LogPreset {
  label: string
  data: {
    logName: string
    loggingSource: LoggingSource
    metadata: Record<string, unknown>
  }
}

export interface SopPreset {
  label: string
  data: {
    sopName: string
    basicDescription: string
  }
}

// ============================================================================
// Company Presets
// ============================================================================

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    label: 'Acme Corporation',
    data: {
      name: 'Acme Corporation',
      address: '123 Business St, San Francisco, CA 94105',
      phoneNumber: '+1 (415) 555-0100',
      email: 'contact@acmecorp.com',
      pillars: [Pillar.EXECUTIVE_LEADERSHIP, Pillar.ENGINEERING, Pillar.SALES],
    },
  },
  {
    label: 'TechVision',
    data: {
      name: 'TechVision Solutions',
      address: '456 Innovation Ave, Austin, TX 78701',
      phoneNumber: '+1 (512) 555-0200',
      email: 'info@techvision.com',
      pillars: [Pillar.ENGINEERING, Pillar.PRODUCT, Pillar.DESIGN],
    },
  },
  {
    label: 'OSY Operations',
    data: {
      name: 'Osy Operations',
      address: '3 Hanover Square Apt 23B, New York, NY 10004',
      phoneNumber: '+1 (848) 203-9038',
      email: 'info@osyops.ai',
      pillars: [
        Pillar.EXECUTIVE_LEADERSHIP,
        Pillar.OPERATIONS,
        Pillar.CUSTOMER_SUCCESS,
      ],
    },
  },
]

// ============================================================================
// Log Presets
// ============================================================================

export const LOG_PRESETS: LogPreset[] = [
  {
    label: 'Authentication Logs',
    data: {
      logName: 'Authentication Logs - January 2025',
      loggingSource: LoggingSource.GOOGLE_WORKSPACE,
      metadata: {
        period: 'January 2025',
        logType: 'authentication',
        recordCount: 1543,
        source: 'admin-console',
      },
    },
  },
  {
    label: 'Drive Activity',
    data: {
      logName: 'Drive Activity Logs - Q1 2025',
      loggingSource: LoggingSource.GOOGLE_WORKSPACE,
      metadata: {
        period: 'Q1 2025',
        logType: 'drive-activity',
        recordCount: 5280,
        source: 'google-drive-api',
      },
    },
  },
  {
    label: 'Mail Logs',
    data: {
      logName: 'Email Activity Logs - February 2025',
      loggingSource: LoggingSource.GOOGLE_WORKSPACE,
      metadata: {
        period: 'February 2025',
        logType: 'email-activity',
        recordCount: 12450,
        source: 'gmail-api',
      },
    },
  },
]

// ============================================================================
// SOP Presets
// ============================================================================

export const SOP_PRESETS: SopPreset[] = [
  {
    label: 'Customer Onboarding',
    data: {
      sopName: 'Customer Onboarding Process',
      basicDescription:
        'Standard procedure for onboarding new customers, including account setup, training, and initial support.',
    },
  },
  {
    label: 'Server Maintenance',
    data: {
      sopName: 'Monthly Server Maintenance',
      basicDescription:
        'Routine maintenance procedures for all production servers including backups, updates, and health checks.',
    },
  },
  {
    label: 'Incident Response',
    data: {
      sopName: 'Security Incident Response',
      basicDescription:
        'Step-by-step procedures for identifying, containing, and recovering from security incidents.',
    },
  },
  {
    label: 'Employee Offboarding',
    data: {
      sopName: 'Employee Offboarding Checklist',
      basicDescription:
        'Comprehensive checklist for offboarding departing employees including access revocation, asset return, and knowledge transfer.',
    },
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a company preset by index
 */
export function getCompanyPreset(index: number): CompanyPreset | undefined {
  return COMPANY_PRESETS[index]
}

/**
 * Get a log preset by index
 */
export function getLogPreset(index: number): LogPreset | undefined {
  return LOG_PRESETS[index]
}

/**
 * Get a SOP preset by index
 */
export function getSopPreset(index: number): SopPreset | undefined {
  return SOP_PRESETS[index]
}
