import {
  EventCategory,
  type SopDto,
  type StepDto,
  type EdgeDto,
} from '@/lib/api-client'

const step = (
  overrides: Partial<StepDto> & { id: string; name: string }
): StepDto => ({
  details: '',
  postStepDocumentation: '',
  monitoringRequirements: '',
  actorRoleTitle: null,
  matchingEmployeesForRoleTitle: [],
  nodeType: 'STEP',
  isFork: false,
  isJoin: false,
  ...overrides,
})

const edge = (from: string, to: string, id?: string): EdgeDto => ({
  id: id || `${from}-${to}`,
  from,
  to,
})

// --- Simple linear SOP (3 steps) ---
export const SIMPLE_SOP: SopDto = {
  id: 'test-simple',
  companyId: 'c1',
  companyName: 'Test Corp',
  name: 'Employee Onboarding',
  basicDescription: 'Standard onboarding flow for new hires',
  stepCount: 3,
  dagValid: true,
  lastValidatedAt: new Date().toISOString(),
  validationErrors: [],
  validationWarnings: [],
  sopFile: null,
  geminiResponseFiles: [],
  createdAt: new Date().toISOString(),
  steps: [
    step({
      id: 's1',
      name: 'Welcome & Orientation',
      nodeType: 'START',
      details:
        'Greet the new hire, provide welcome packet, and walk through office layout and team introductions.',
      actorRoleTitle: 'HR_MANAGER',
      matchingEmployeesForRoleTitle: [
        {
          id: 'e1',
          companyId: 'c1',
          name: 'Alice Johnson',
          email: 'alice@test.com',
          roleTitle: 'HR_MANAGER',
          managerId: null,
          managerName: null,
          roleId: null,
        } as any,
      ],
    }),
    step({
      id: 's2',
      name: 'IT Setup & Access Provisioning',
      details:
        'Set up workstation, email account, VPN access, and grant permissions to internal tools and repositories.',
      actorRoleTitle: 'IT_ADMINISTRATOR',
      postStepDocumentation:
        'Document all provisioned accounts in the access management spreadsheet.',
      monitoringRequirements: 'Verify login within 24 hours.',
    }),
    step({
      id: 's3',
      name: 'First Week Check-In',
      nodeType: 'END',
      details:
        'Schedule a 1-on-1 to review first week experience and answer questions.',
      actorRoleTitle: 'TEAM_LEAD',
    }),
  ],
  edges: [edge('s1', 's2'), edge('s2', 's3')],
}

// --- Complex SOP with forks/joins (8 steps) ---
export const COMPLEX_SOP: SopDto = {
  id: 'test-complex',
  companyId: 'c1',
  companyName: 'Test Corp',
  name: 'Incident Response Procedure',
  basicDescription:
    'Multi-team incident response with parallel investigation and communication tracks',
  stepCount: 8,
  dagValid: true,
  lastValidatedAt: new Date().toISOString(),
  validationErrors: [],
  validationWarnings: [],
  sopFile: null,
  geminiResponseFiles: [],
  createdAt: new Date().toISOString(),
  steps: [
    step({
      id: 'ir1',
      name: 'Incident Detected',
      nodeType: 'START',
      details:
        'Automated alert or manual report triggers the incident response procedure.',
      actorRoleTitle: 'SECURITY_ANALYST',
      inferredEventCategories: [
        EventCategory.USER_LOGIN,
        EventCategory.DEVICE_SYNC,
      ],
    }),
    step({
      id: 'ir2',
      name: 'Triage & Severity Assessment',
      details:
        'Evaluate the incident scope, affected systems, and assign severity level (P1-P4). Page on-call if P1/P2.',
      actorRoleTitle: 'INCIDENT_COMMANDER',
      isFork: true,
      postStepDocumentation: 'Log severity assessment in incident tracker.',
    }),
    step({
      id: 'ir3',
      name: 'Technical Investigation',
      details:
        'Deep-dive into logs, traces, and metrics to identify root cause. Check for data exfiltration indicators.',
      actorRoleTitle: 'SECURITY_ENGINEER',
      inferredEventCategories: [
        EventCategory.DOCUMENT_VIEW,
        EventCategory.PERMISSION_CHANGE,
      ],
      inferredResourceType: 'Investigation',
    }),
    step({
      id: 'ir4',
      name: 'Stakeholder Communication',
      details:
        'Notify affected teams, management, and (if required) customers. Set up war room Slack channel.',
      actorRoleTitle: 'COMMUNICATIONS_LEAD',
      matchingEmployeesForRoleTitle: [
        {
          id: 'e2',
          companyId: 'c1',
          name: 'Bob Smith',
          email: 'bob@test.com',
          roleTitle: 'COMMUNICATIONS_LEAD',
          managerId: null,
          managerName: null,
          roleId: null,
        } as any,
        {
          id: 'e3',
          companyId: 'c1',
          name: 'Carol Davis',
          email: 'carol@test.com',
          roleTitle: 'COMMUNICATIONS_LEAD',
          managerId: null,
          managerName: null,
          roleId: null,
        } as any,
      ],
    }),
    step({
      id: 'ir5',
      name: 'Containment & Mitigation',
      details:
        'Implement immediate containment measures: isolate affected systems, rotate credentials, block malicious IPs.',
      actorRoleTitle: 'SECURITY_ENGINEER',
      isJoin: true,
      monitoringRequirements:
        'Verify containment is effective within 30 minutes.',
    }),
    step({
      id: 'ir6',
      name: 'Recovery & Verification',
      details:
        'Restore services from clean backups, verify integrity of restored data, gradually re-enable access.',
      actorRoleTitle: 'SITE_RELIABILITY_ENGINEER',
      isFork: true,
    }),
    step({
      id: 'ir7',
      name: 'Post-Incident Review',
      details:
        'Conduct blameless retrospective. Document timeline, root cause, impact, and action items.',
      actorRoleTitle: 'INCIDENT_COMMANDER',
      isJoin: true,
      postStepDocumentation: 'Publish post-mortem within 5 business days.',
    }),
    step({
      id: 'ir8',
      name: 'Close Incident',
      nodeType: 'END',
      details:
        'Archive incident record, close tracking ticket, update runbooks with lessons learned.',
      actorRoleTitle: 'SECURITY_ANALYST',
    }),
  ],
  edges: [
    edge('ir1', 'ir2'),
    edge('ir2', 'ir3'),
    edge('ir2', 'ir4'),
    edge('ir3', 'ir5'),
    edge('ir4', 'ir5'),
    edge('ir5', 'ir6'),
    edge('ir6', 'ir7'),
    edge('ir6', 'ir8'),
    edge('ir7', 'ir8'),
  ],
}

// --- Real trace data: 10-step onboarding SOP with fork/join ---
import traceSopJson from './trace-sop.json'
export const TRACE_SOP = traceSopJson as unknown as SopDto

export const ALL_TEST_SOPS = [SIMPLE_SOP, COMPLEX_SOP, TRACE_SOP]
