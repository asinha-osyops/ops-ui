interface Step {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoringRequirements: string
}

/**
 * Role Title enum - Updated to match OpenAPI specification
 *
 * BREAKING CHANGES:
 * - REMOVED: CIO (no existing usage confirmed)
 * - RENAMED: Generic roles now have hierarchical structure (e.g., DIRECTOR → ENGINEERING_DIRECTOR)
 * - ADDED: 24+ medical/healthcare roles
 * - ADDED: Design, Sales, HR role hierarchies
 *
 * Total: 60+ role values (previously 36)
 */
export enum RoleTitle {
  // Generic Roles (for log line matching)
  EMPLOYEE = 'EMPLOYEE',
  OWNER = 'OWNER',
  UNKNOWN = 'UNKNOWN',

  // C-Level Executive Roles
  CEO = 'CEO',
  CFO = 'CFO',
  COO = 'COO',
  CTO = 'CTO',
  CPO = 'CPO',
  CMO = 'CMO',
  CHRO = 'CHRO',

  // Engineering Roles
  ENGINEERING_DIRECTOR = 'ENGINEERING_DIRECTOR',
  ENGINEERING_MANAGER = 'ENGINEERING_MANAGER',
  SENIOR_ENGINEER = 'SENIOR_ENGINEER',
  ENGINEER = 'ENGINEER',

  // Product Roles
  PRODUCT_DIRECTOR = 'PRODUCT_DIRECTOR',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  SENIOR_PRODUCT_ANALYST = 'SENIOR_PRODUCT_ANALYST',
  PRODUCT_ANALYST = 'PRODUCT_ANALYST',

  // Design Roles
  DESIGN_DIRECTOR = 'DESIGN_DIRECTOR',
  DESIGN_MANAGER = 'DESIGN_MANAGER',
  SENIOR_DESIGNER = 'SENIOR_DESIGNER',
  DESIGNER = 'DESIGNER',

  // Sales Roles
  SALES_DIRECTOR = 'SALES_DIRECTOR',
  SALES_MANAGER = 'SALES_MANAGER',
  SENIOR_ACCOUNT_EXECUTIVE = 'SENIOR_ACCOUNT_EXECUTIVE',
  ACCOUNT_EXECUTIVE = 'ACCOUNT_EXECUTIVE',

  // Human Resources Roles
  HR_DIRECTOR = 'HR_DIRECTOR',
  HR_MANAGER = 'HR_MANAGER',
  SENIOR_HR_BUSINESS_PARTNER = 'SENIOR_HR_BUSINESS_PARTNER',
  HR_BUSINESS_PARTNER = 'HR_BUSINESS_PARTNER',

  // Operations Roles
  OPERATIONS_DIRECTOR = 'OPERATIONS_DIRECTOR',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  SENIOR_OPERATIONS_SPECIALIST = 'SENIOR_OPERATIONS_SPECIALIST',
  OPERATIONS_SPECIALIST = 'OPERATIONS_SPECIALIST',

  // Customer Success Roles
  CUSTOMER_SUCCESS_DIRECTOR = 'CUSTOMER_SUCCESS_DIRECTOR',
  CUSTOMER_SUCCESS_MANAGER = 'CUSTOMER_SUCCESS_MANAGER',
  SENIOR_SUPPORT_SPECIALIST = 'SENIOR_SUPPORT_SPECIALIST',
  SUPPORT_SPECIALIST = 'SUPPORT_SPECIALIST',

  // Medical/Healthcare Executive Roles
  CHIEF_MEDICAL_OFFICER = 'CHIEF_MEDICAL_OFFICER',
  MEDICAL_DIRECTOR = 'MEDICAL_DIRECTOR',

  // Medical Provider Roles
  DENTIST = 'DENTIST',
  ASSOCIATE_DENTIST = 'ASSOCIATE_DENTIST',
  PHYSICIAN = 'PHYSICIAN',
  ASSOCIATE_PHYSICIAN = 'ASSOCIATE_PHYSICIAN',
  NURSE_PRACTITIONER = 'NURSE_PRACTITIONER',
  REGISTERED_NURSE = 'REGISTERED_NURSE',

  // Dental Support Roles
  DENTAL_HYGIENIST = 'DENTAL_HYGIENIST',
  DENTAL_ASSISTANT = 'DENTAL_ASSISTANT',

  // Medical Assistant Roles
  SENIOR_MEDICAL_ASSISTANT = 'SENIOR_MEDICAL_ASSISTANT',
  MEDICAL_ASSISTANT = 'MEDICAL_ASSISTANT',

  // Medical Office Roles
  MEDICAL_OFFICE_MANAGER = 'MEDICAL_OFFICE_MANAGER',
  MEDICAL_OFFICE_SUPERVISOR = 'MEDICAL_OFFICE_SUPERVISOR',
  SENIOR_PATIENT_COORDINATOR = 'SENIOR_PATIENT_COORDINATOR',
  PATIENT_COORDINATOR = 'PATIENT_COORDINATOR',

  // Medical Billing Roles
  SENIOR_MEDICAL_BILLER = 'SENIOR_MEDICAL_BILLER',
  MEDICAL_BILLER = 'MEDICAL_BILLER',

  // Medical Records Roles
  MEDICAL_RECORDS_SPECIALIST = 'MEDICAL_RECORDS_SPECIALIST',
  MEDICAL_RECORDS_CLERK = 'MEDICAL_RECORDS_CLERK',

  // Laboratory Roles
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  LAB_ASSISTANT = 'LAB_ASSISTANT',

  // General/Support Roles
  CHIEF_OF_STAFF = 'CHIEF_OF_STAFF',
  CONSULTANT = 'CONSULTANT',
  CONTRACTOR = 'CONTRACTOR',
  INTERN = 'INTERN',
}

// Role DTO for role management
export interface RoleDto {
  id: string
  companyId: string
  companyName: string
  name: string
  title: RoleTitle
  description: string
  responsibilities: string
}

// ActivityEvent interfaces
export interface ActivityEventDto {
  id: string
  name: string
  description: string
  associatedRoleTitles: RoleTitle[]
  associatedEventCategories: EventCategory[]
  logLineEventTypeMappings: LogLineEventTypeMappingDto[]
  createdAt: string
}

export interface UpdateActivityEventRoleTitlesRequestDto {
  roleTitles: RoleTitle[]
}

export interface UpdateActivityEventLogLineTypesRequestDto {
  eventCategories: EventCategory[]
}

// Analysis interfaces
export interface ActivityEventAssociationsRequestDto {
  companyId: string
  activityEventIds: string[]
}

export interface ActivityEventAssociationDto {
  activityEvent: ActivityEventDto
  matchingSteps: StepDto[]
  matchingLogLines: LogLineDto[]
}

export interface ActivityEventAssociationsResponseDto {
  associations: ActivityEventAssociationDto[]
}

// ===== Analysis Request/Response DTOs =====

/**
 * Request to analyze SOP steps
 */
export interface AnalyzeSopRequestDto {
  companyId: string
  sopId: string
}

/**
 * Log line analysis result - grouped by parent log
 */
export interface LogLineAnalysisDto {
  matchingLogs: LogMatchDto[]
}

/**
 * Activity event with its matched log lines
 */
export interface ActivityEventAnalysisDto {
  activityEvent: ActivityEventDto
  logLineAnalysis?: LogLineAnalysisDto
}

/**
 * Java Duration object from API
 */
export interface DurationDto {
  seconds: number
  nano?: number
  zero?: boolean
  negative?: boolean
  positive?: boolean
}

/**
 * Step analysis with matching activity events (FLAT structure)
 * Contains step details plus matching activity events and timing
 */
export interface StepAnalysisDto {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoringRequirements: string
  actorRoleTitle: RoleTitle | null
  nodeType: StepNodeType
  isFork: boolean
  isJoin: boolean
  matchingEmployeesForRoleTitle?: EmployeeDto[]
  matchingActivityEvents: ActivityEventAnalysisDto[]
  // Timing metadata (computed from log line timestamps)
  firstLogTimestamp?: string // ISO-8601 instant
  lastLogTimestamp?: string // ISO-8601 instant
  stepDuration?: DurationDto // Duration object from API
}

/**
 * Complete SOP analysis with enriched steps and edge timing
 */
export interface SopAnalysisDto {
  id: string
  companyId: string
  companyName: string
  name: string
  basicDescription?: string
  sopFile?: SopFileDto
  geminiResponseFiles?: GeminiResponseFileDto[]
  createdAt?: string
  dagValid?: boolean
  lastValidatedAt?: string
  validationErrors?: DagValidationErrorDto[]
  validationWarnings?: DagValidationWarningDto[]
  analysisTaskId?: string
  steps: StepAnalysisDto[]
  edges: EdgeDto[]
}

/**
 * Response for trace SOP steps operation (for UI display)
 * Wraps the SOP and step analysis data
 */
export interface TraceSopStepsResponseDto {
  sop: SopDto
  stepAnalyses: StepAnalysisDto[]
  edges?: EdgeDto[]
}

// ===== Log Match DTO for Analysis =====

/**
 * Grouped log line structure - groups matching log lines by their parent log
 */
export interface LogMatchDto {
  logId: string
  logName: string
  loggingSource: LoggingSource
  matchingLogLines: LogLineDto[]
  matchCount: number
}

/** @deprecated Legacy interface for JSON import/export. Use SopDto instead. */
export interface Sop {
  companyId: string
  companyName?: string
  sopName: string
  basicDescription: string
  steps: Step[]
  exportedAt?: string
}

/** Generic API response for mutation operations */
export interface ApiResponse {
  success: boolean
  message?: string
}

/** @deprecated Use ApiResponse instead */
export type SOPResponse = ApiResponse

export interface SopFileDto {
  id: string
  fileName: string
  uploadedAt: string
  contentType: string
  parsedText?: string
  parseError?: string
  fileSize: number
}

export interface GeminiResponseFileDto {
  id: string
  sourceRequestId: string
  sopId: string
  fileName: string
  uploadedAt: string
  contentType: string
  fileContent: string
  fileSize: number
}

/** @deprecated Use GeminiResponseFileDto instead */
export type GeminiResponseFile = GeminiResponseFileDto

export interface LogFileDto {
  id: string
  fileName: string
  uploadedAt: string
  contentType: string
  parsedText?: string
  parseError?: string
  fileSize: number
}

// Log interfaces
export enum LoggingSource {
  GOOGLE_WORKSPACE = 'GOOGLE_WORKSPACE',
  MICROSOFT_OFFICE = 'MICROSOFT_OFFICE',
}

export enum Pillar {
  DEFAULT = 'DEFAULT',
  EXECUTIVE_LEADERSHIP = 'EXECUTIVE_LEADERSHIP',
  ENGINEERING = 'ENGINEERING',
  PRODUCT = 'PRODUCT',
  DESIGN = 'DESIGN',
  SALES = 'SALES',
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  OPERATIONS = 'OPERATIONS',
  CUSTOMER_SUCCESS = 'CUSTOMER_SUCCESS',
  HEALTHCARE_CLINICAL = 'HEALTHCARE_CLINICAL',
  HEALTHCARE_OFFICE = 'HEALTHCARE_OFFICE',
  CROSS_FUNCTIONAL = 'CROSS_FUNCTIONAL',
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum GeminiRequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Cross-platform event categories for unified filtering
export enum EventCategory {
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  DOCUMENT_EDIT = 'DOCUMENT_EDIT',
  DOCUMENT_CREATE = 'DOCUMENT_CREATE',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  DOCUMENT_COPY = 'DOCUMENT_COPY',
  DOCUMENT_MOVE = 'DOCUMENT_MOVE',
  DOCUMENT_RENAME = 'DOCUMENT_RENAME',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',
  DOCUMENT_SYNC = 'DOCUMENT_SYNC',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  OWNERSHIP_CHANGE = 'OWNERSHIP_CHANGE',
  MEMBERSHIP_CHANGE = 'MEMBERSHIP_CHANGE',
  MESSAGE_SEND = 'MESSAGE_SEND',
  MESSAGE_RECEIVE = 'MESSAGE_RECEIVE',
  MESSAGE_VIEW = 'MESSAGE_VIEW',
  MESSAGE_DRAFT = 'MESSAGE_DRAFT',
  MESSAGE_LINK_CLICK = 'MESSAGE_LINK_CLICK',
  COMMENT_ADD = 'COMMENT_ADD',
  TASK_CREATE = 'TASK_CREATE',
  TASK_COMPLETE = 'TASK_COMPLETE',
  TASK_REOPEN = 'TASK_REOPEN',
  TASK_ASSIGN = 'TASK_ASSIGN',
  TASK_MODIFY = 'TASK_MODIFY',
  TASK_DELETE = 'TASK_DELETE',
  TASK_LIST_CREATE = 'TASK_LIST_CREATE',
  DEVICE_SYNC = 'DEVICE_SYNC',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  OTHER = 'OTHER',
}

// Source platform for audit log events
export enum Platform {
  GOOGLE = 'GOOGLE',
  SLACK = 'SLACK',
  MICROSOFT = 'MICROSOFT',
}

export interface LogLineDto {
  id: string
  logId: string
  // Platform-agnostic fields
  platform: Platform
  service: string
  event: string
  eventCategory: EventCategory
  // Resource fields
  resourceId?: string
  resourceTitle?: string
  resourceType?: string
  visibility?: string
  // Common fields
  date: string
  actor?: string
  owner?: string
  target?: string
  actorEmployeeId?: string
  ownerEmployeeId?: string
  targetEmployeeId?: string
  // Denormalized role titles for filtering
  actorRoleTitle?: RoleTitle
  ownerRoleTitle?: RoleTitle
  targetRoleTitle?: RoleTitle
  domain?: string
  ipAddress?: string
  lineNumber: number
  rawCsvLine: string
  createdAt: string
  // Platform-specific data stored in metadata
  metadata?: Record<string, unknown>
}

export interface Log {
  companyId: string
  logName: string
  loggingSource: LoggingSource
  metadata: Record<string, unknown>
}

export interface LogDto {
  id: string
  companyId: string
  companyName: string
  name: string
  loggingSource: LoggingSource
  metadata: Record<string, unknown>
  logFile: LogFileDto | null
  logLines: LogLineDto[]
  geminiResponseFiles: GeminiResponseFileDto[]
  driveLineCount: number
  mailLineCount: number
  tasksLineCount: number
  deviceLineCount: number
  totalLineCount: number
  processingStatus?: ProcessingStatus
  processingError?: string
  createdAt: string
}

export interface CreateLogResponseDto {
  success: boolean
  id?: string
  companyId?: string
  message?: string
}

/** @deprecated Use ApiResponse instead */
export type LogResponse = ApiResponse

// ===== SOP DAG Types =====

// Node type for DAG-based SOP steps
export type StepNodeType = 'START' | 'STEP' | 'END'

// Edge DTO representing a connection between two steps
export interface EdgeDto {
  id: string
  from: string // Source step UUID
  to: string // Target step UUID
  transitionDuration?: DurationDto // Duration object (only in trace responses)
}

// Request DTO for creating an edge
export interface CreateEdgeRequestDto {
  fromStepId: string
  toStepId: string
}

// Response DTO for edge creation (includes validation result)
export interface CreateEdgeResponseDto {
  edge: EdgeDto
  validation: DagValidationResultDto
}

// Validation warning codes (non-blocking)
export type DagValidationWarningCode =
  | 'NO_END_NODE'
  | 'UNREACHABLE_NODE'
  | 'DANGLING_NODE'
  | 'ORPHAN_NODE'

// Validation error codes (blocking)
export type DagValidationErrorCode =
  | 'NO_START_NODE'
  | 'MULTIPLE_START_NODES'
  | 'CYCLE_DETECTED'
  | 'START_HAS_PREDECESSORS'
  | 'END_HAS_SUCCESSORS'

// Validation warning DTO
export interface DagValidationWarningDto {
  code: DagValidationWarningCode
  message: string
  nodeId?: string
  nodeName?: string
}

// Validation error DTO
export interface DagValidationErrorDto {
  code: DagValidationErrorCode
  message: string
  affectedNodeIds?: string[]
}

// DAG validation result
export interface DagValidationResultDto {
  valid: boolean
  warnings: DagValidationWarningDto[]
  errors: DagValidationErrorDto[]
}

// ===== SOP DTOs =====

// DTOs matching backend schema
export interface StepDto {
  id: string
  name: string
  details: string
  postStepDocumentation: string
  monitoringRequirements: string
  actorRoleTitle: string | null // Only role title (RoleTitle enum), no separate role ID
  matchingEmployeesForRoleTitle: EmployeeDto[]
  // DAG fields
  nodeType: StepNodeType
  isFork: boolean // Has multiple successors
  isJoin: boolean // Has multiple predecessors
  // Inferred fields (computed by backend from step text)
  inferredEventCategories?: EventCategory[]
  inferredResourceType?: string
  inferredResourceTitle?: string
}

export interface SopDto {
  id: string
  companyId: string
  companyName: string
  name: string
  basicDescription: string
  steps: StepDto[]
  stepCount: number // Number of steps in the SOP
  edges: EdgeDto[] // DAG edges between steps
  sopFile: SopFileDto | null
  geminiResponseFiles: GeminiResponseFileDto[]
  createdAt: string
  analysisTaskId?: string // ID of async analysis task if running
  // DAG validation fields
  dagValid: boolean // true if DAG has no errors (warnings OK)
  lastValidatedAt: string | null // ISO timestamp of last validation
  validationErrors: DagValidationErrorDto[] // Blocking errors that prevent analysis
  validationWarnings: DagValidationWarningDto[] // Non-blocking informational warnings
}

export interface SopAnalysisStepDto {
  name: string
  details: string
  actorRoleTitle: string | null
  monitoringRequirements: string | null
  postStepDocumentation: string | null
}

/**
 * @deprecated Legacy DTO for Gemini processing results. Use SopAnalysisDto for trace analysis.
 */
export interface GeminiSopAnalysisDto {
  steps: SopAnalysisStepDto[]
}

export interface LogAnalysisDto {
  system: string
  actions: string[]
  users: string[]
}

export interface GenerateTextRequestDto {
  prompt: string
}

export interface GenerateTextResponseDto {
  generatedText: string
}

export interface CreateSopResponseDto extends SOPResponse {
  id?: string
  companyId?: string
}

export interface CompanyDto {
  id: string
  name: string
  address: string
  phoneNumber: string
  email: string
  ceoId: string | null
  ceoName: string | null
  pointOfContactId: string | null
  pointOfContactName: string | null
  pillars: Pillar[]
  createdAt: string
}

export interface UpdateCompanyRequestDto {
  name: string
  address?: string
  phoneNumber: string
  email: string
  ceoId?: string | null
  pointOfContactId?: string | null
  pillars: Pillar[]
}

export interface CreateCompanyRequestDto {
  name: string
  address?: string
  phoneNumber: string
  email: string
  ceoId?: string | null
  pointOfContactId?: string | null
  pillars: Pillar[]
}

/** @deprecated Use ApiResponse instead */
export type CompanyResponse = ApiResponse

// Employee interfaces
export interface EmployeeDto {
  id: string
  companyId: string
  companyName: string
  name: string
  phoneNumber: string
  email: string
  roleId: string | null
  roleTitle: RoleTitle | null
  managerId: string | null
  managerName: string | null
  createdAt: string
}

export interface CreateEmployeeRequestDto {
  companyId: string
  name: string
  phoneNumber: string
  email: string
  roleId?: string | null
  managerId?: string | null
}

export interface UpdateEmployeeRequestDto {
  name: string
  phoneNumber: string
  email: string
  roleId: string | null
  managerId: string | null
}

/** @deprecated Use ApiResponse instead */
export type EmployeeResponse = ApiResponse

// Bulk Employee interfaces (renamed from Batch to match OpenAPI spec)
export interface BulkCreateEmployeesRequestDto {
  employees: CreateEmployeeRequestDto[]
}

export interface EmployeeUpdateItem {
  id: string
  data: UpdateEmployeeRequestDto
}

export interface BulkUpdateEmployeesRequestDto {
  employees: EmployeeUpdateItem[]
}

export interface EmployeeResult {
  index: number
  employeeId: string | null
  success: boolean
  errorMessage: string | null
}

export interface BulkEmployeeResponseDto {
  totalRequested: number
  successCount: number
  failureCount: number
  results: EmployeeResult[]
}

// ===== Org Chart DTOs =====

/**
 * A node in the org chart representing an employee
 */
export interface OrgChartNodeDto {
  id: string
  name: string
  roleTitle?: RoleTitle
  email?: string
  roleId?: string
  hasDirectReports: boolean
  hasManager: boolean
}

/**
 * An edge in the org chart representing a manager-employee relationship
 */
export interface OrgChartEdgeDto {
  source: string // Manager employee ID
  target: string // Employee ID
}

/**
 * Org chart response containing nodes and edges for React Flow visualization
 */
export interface OrgChartResponseDto {
  companyId: string
  parentId?: string
  focusEmployeeId?: string
  nodes: OrgChartNodeDto[]
  edges: OrgChartEdgeDto[]
}

// ===== Request DTOs matching OpenAPI specification =====

// SOP Request DTOs
export interface CreateSopRequestDto {
  companyId: string
  name: string
  basicDescription?: string
  steps?: CreateStepRequestDto[]
}

export interface UpdateSopRequestDto {
  name: string
  basicDescription?: string
  steps?: UpdateStepRequestDto[]
}

export interface CreateStepRequestDto {
  name: string
  details?: string
  postStepDocumentation?: string
  monitoringRequirements?: string
  actorRoleTitle?: RoleTitle
  nodeType?: StepNodeType
}

export interface UpdateStepRequestDto {
  id?: string
  name: string
  details?: string
  postStepDocumentation?: string
  monitoringRequirements?: string
  actorRoleTitle?: RoleTitle
  nodeType?: StepNodeType
}

export interface UploadSopFileRequestDto {
  companyId?: string
  sopId?: string
}

// Log Request DTOs
export interface CreateLogRequestDto {
  companyId: string
  name: string
  loggingSource: LoggingSource
  metadata?: string
}

export interface UpdateLogRequestDto {
  name: string
  loggingSource: LoggingSource
  metadata?: string
}

export interface UploadLogFileRequestDto {
  companyId?: string
  logId?: string
}

// Role Request DTOs
export interface CreateRoleRequestDto {
  companyId: string
  name: string
  title: RoleTitle
  description?: string
  responsibilities?: string
}

export interface UpdateRoleRequestDto {
  name: string
  title: RoleTitle
  description?: string
  responsibilities?: string
}

// ActivityEvent Request DTOs
export interface CreateActivityEventRequestDto {
  name: string
  description?: string
  associatedRoleTitles?: RoleTitle[]
  associatedEventCategories?: EventCategory[]
  logLineEventTypeMappings?: LogLineEventTypeMappingDto[]
}

export interface UpdateActivityEventRequestDto {
  name: string
  description?: string
}

// Gemini request types for async task tracking
export enum GeminiRequestType {
  TEXT_GENERATION = 'TEXT_GENERATION',
  SOP_ANALYSIS = 'SOP_ANALYSIS',
  LOG_ANALYSIS = 'LOG_ANALYSIS',
  ACTIVITY_EVENT_FILTERING = 'ACTIVITY_EVENT_FILTERING',
  LOG_LINE_MATCHING = 'LOG_LINE_MATCHING',
}

// ===== Async Analysis DTOs =====

// Response when async analysis is queued
export interface AsyncAnalysisResponseDto {
  taskId: string
  status: string
  message: string
  statusUrl: string
}

// Status of an async Gemini task
export interface GeminiAsyncTaskDto {
  id: string
  status: ProcessingStatus
  requestType: GeminiRequestType
  apiMethodName: string
  entityType: string
  entityId: string
  errorMessage?: string
  responseFilePath?: string
  correlationId?: string
  queuedAt?: string
  startedAt?: string
  completedAt?: string
  geminiRequestId?: string
}

/**
 * Response when async SOP analysis is queued
 */
export interface AnalyzeSopAsyncResponseDto {
  sopId: string
  correlationId: string
  stepTaskMap: Record<string, string> // stepId -> taskId
  message: string
}

/**
 * Result of async step analysis processing
 */
export interface StepAnalysisAsyncResultDto {
  stepId: string
  taskId: string
  status: ProcessingStatus
  message?: string
  stepAnalysis?: StepAnalysisDto
  /** Maps activityEventId -> taskId for log line matching tasks */
  logLineMatchingTaskMap?: Record<string, string>
}

/**
 * Aggregated result of async SOP analysis processing
 * Includes complete SopAnalysisDto with edge timing when all tasks are complete
 */
export interface AsyncAnalysisAggregateResultDto {
  correlationId: string
  sopId: string
  allComplete: boolean
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  message?: string
  sopAnalysis?: SopAnalysisDto
}

// ===== Error Response DTOs =====

export interface SimpleErrorResponse {
  status: number
  message: string
  timestamp: string
}

export interface ValidationErrorResponse {
  status: number
  message: string
  errors: Record<string, string>
  timestamp: string
}

// ===== Log Line Event Type Mapping DTOs =====

export interface LogLineEventTypeMappingDto {
  platform: Platform
  service: string
  event: string
}

export interface LogLineMatchingAsyncResultDto {
  activityEventId?: string
  taskId?: string
  status?: ProcessingStatus
  message?: string
  matchingLogLineIds?: string[]
  logLineAnalysis?: LogLineAnalysisDto
}

export interface UpdateActivityEventLogLineEventTypesRequestDto {
  logLineEventTypeMappings: LogLineEventTypeMappingDto[]
}

export interface UpdateActivityEventEventCategoriesRequestDto {
  eventCategories: EventCategory[]
}

// ===== Log Line Statistics DTOs =====

export interface CategoryCount {
  eventCategory: EventCategory
  count: number
}

export interface ServiceCount {
  service: string
  count: number
}

export interface LogLineStatisticsDto {
  totalCount: number
  countByEventCategory: Record<string, number>
  countByService: Record<string, number>
  countByPlatform: Record<string, number>
  topEventCategories: CategoryCount[]
  topServices: ServiceCount[]
}

// ===== Statistics DTOs =====

export interface LogMetricsDto {
  totalCount: number
  totalLineCount: number
  countByProcessingStatus: Record<string, number>
  lineCountByPlatform: Record<string, number>
  lineCountByService: Record<string, number>
  topEventCategories: CategoryCount[]
  calculatedAt: string
}

// ===== CSRF Response DTO =====

export interface CsrfResponseDto {
  token: string
  headerName: string
}

// ===== Processing Result DTOs =====

/**
 * Result of synchronous SOP processing (Gemini analysis)
 */
export interface SopProcessingResultDto {
  steps: SopAnalysisStepDto[]
  edges?: EdgeDto[]
  formatFlags?: Record<string, boolean>
}

/**
 * Result of synchronous Log processing (Gemini analysis)
 */
export interface LogProcessingResultDto {
  system: string
  actions: string[]
  users: string[]
}

/**
 * Response when async processing is queued
 */
export interface AsyncProcessingResponseDto {
  taskId: string
  status: string
  message: string
  statusUrl: string
}

// ===== Cache Information DTOs =====

/**
 * @deprecated Legacy DTO — backend no longer returns this shape.
 */
export type ActivityEventCacheInfoDto = Record<string, unknown>

/**
 * SOP-level analysis results
 */
export interface AnalysisProgressDto {
  sopId: string
  totalSteps: number
  completedSteps: number
  totalLogLineTasks: number
  completedLogLineTasks: number
  progressPercentage: number
}

export interface StepActivityEventLogLineResultDto {
  id: string
  stepActivityEventResultId: string
  activityEventId: string
  activityEventName: string
  logFileId: string
  matchingLogLineCount: number
  matchingLogLineIds: string[]
  earliestLogTimestamp?: string
  latestLogTimestamp?: string
  logTimestampDurationMs?: number
  processingDurationMs?: number
  createdAt: string
  updatedAt: string
}

export interface StepActivityEventResultDto {
  id: string
  stepId: string
  stepName: string
  sopFileId: string
  activityEventCount: number
  selectedActivityEventNames: string[]
  totalLogLineTasks: number
  completedLogLineTasks: number
  fullyComplete: boolean
  logLineResults: StepActivityEventLogLineResultDto[]
  processingDurationMs?: number
  createdAt: string
  updatedAt: string
}

export interface SopCacheInfoDto {
  sopId: string
  sopName: string
  companyId: string
  companyName: string
  totalSteps: number
  stepsWithResults: number
  stepResults: StepActivityEventResultDto[]
  progress: AnalysisProgressDto
}

// ===== Health DTOs =====

/**
 * Public application health check (GET /api/health)
 */
export interface AppHealthDto {
  status: 'UP' | 'DOWN'
  database: 'UP' | 'DOWN'
  timestamp?: string
}

/**
 * Thread pool statistics (nested in AdminHealthDto)
 */
export interface ThreadPoolInfoDto {
  name?: string
  activeCount?: number
  maxPoolSize?: number
  queueSize?: number
  completedTaskCount?: number
  utilizationPercent?: number
}

/**
 * Admin health overview (GET /api/admin/health)
 */
export interface AdminHealthDto {
  status?: 'UP' | 'DOWN'
  uptime?: string
  database?: 'UP' | 'DOWN'
  heapUsed?: string
  heapMax?: string
  heapUtilizationPercent?: number
  nonHeapUsed?: string
  gcPauseCount?: number
  gcPauseTimeMs?: number
  availableProcessors?: number
  systemLoadAverage?: number
  processLoad?: number
  csvExecutor?: ThreadPoolInfoDto
  geminiExecutor?: ThreadPoolInfoDto
  auditExecutor?: ThreadPoolInfoDto
  taskCountByStatus?: Record<string, number>
  totalTaskCount?: number
  timestamp?: string
}

/**
 * Database connection pool health (GET /api/admin/db/health)
 */
export interface DbHealthDto {
  status?: 'UP' | 'DOWN'
  responseTimeMs?: number
  activeConnections?: number
  idleConnections?: number
  totalConnections?: number
  maxConnections?: number
  poolUtilizationPercent?: number
  pendingThreads?: number
  timestamp?: string
}

// ===== Admin DTOs =====

/**
 * Table size information
 */
export interface TableSizeDto {
  tableName?: string
  rowCount?: number
  totalSize?: string
  dataSize?: string
  indexSize?: string
}

/**
 * Index usage information
 */
export interface IndexUsageDto {
  tableName?: string
  indexName?: string
  indexScans?: number
  tuplesRead?: number
  tuplesFetched?: number
  indexSizePretty?: string
}

/**
 * Database statistics (GET /api/admin/db/stats)
 */
export interface DbStatsDto {
  totalTables?: number
  totalIndexes?: number
  totalDbSize?: string
  largestTables?: TableSizeDto[]
  unusedIndexes?: IndexUsageDto[]
  logCountMismatches?: number
  calculatedAt?: string
}

// ===== Pagination DTOs =====

/**
 * Sort object for paginated queries
 */
export interface SortObject {
  empty?: boolean
  sorted?: boolean
  unsorted?: boolean
}

/**
 * Pageable object for pagination info
 */
export interface PageableObject {
  offset?: number
  pageNumber?: number
  pageSize?: number
  paged?: boolean
  sort?: SortObject
  unpaged?: boolean
}

/**
 * Paginated log line response
 */
export interface PageLogLineDto {
  content?: LogLineDto[]
  empty?: boolean
  first?: boolean
  last?: boolean
  number?: number
  numberOfElements?: number
  pageable?: PageableObject
  size?: number
  sort?: SortObject
  totalElements?: number
  totalPages?: number
}

/**
 * Multi-attribute query request for log lines
 */
export interface GetMultiAttributeRequestDto {
  actor?: string
  domain?: string
  endDate?: string
  event?: string
  eventCategory?: EventCategory
  owner?: string
  page?: number
  platform?: Platform
  resourceId?: string
  resourceTitle?: string
  service?: string
  size?: number
  startDate?: string
  target?: string
}

// ===== SOP Processing DTOs =====

/**
 * Edge format from SOP file processing
 */
export interface SopProcessingEdgeDto {
  from?: string
  to?: string
}

/**
 * Step format from SOP file processing
 */
export interface SopProcessingStepDto {
  tempId?: string
  name?: string
  details?: string
  nodeType?: string
  actorRoleTitle?: string
  postStepDocumentation?: string
  monitoringRequirements?: string
}

import {
  makeRequest,
  makeArrayRequest,
  makeNullableRequest,
  makeObjectRequest,
  makeSimpleRequest,
} from './api-client-helpers'
import { API_HEADERS, DELETE_PASSWORD } from './api-constants'
import { AUTH_ENDPOINTS, AUTH_HEADERS } from './auth-constants'
import type {
  LoginRequest,
  LoginResponse,
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types/auth'

export class APIClient {
  private baseURL: string
  private authToken: string | null = null
  private csrfToken: string | null = null

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8080'
  ) {
    this.baseURL = baseURL
  }

  // ===== Auth Token Management =====

  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  clearAuthToken(): void {
    this.authToken = null
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  // ===== CSRF Token Management =====

  setCsrfToken(token: string | null): void {
    this.csrfToken = token
  }

  getCsrfToken(): string | null {
    return this.csrfToken
  }

  /**
   * Fetch CSRF token from backend
   * Should be called on app initialization and after login
   */
  async fetchCsrfToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.CSRF}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      })

      if (!response.ok) {
        console.warn('Failed to fetch CSRF token:', response.status)
        return
      }

      const data: CsrfResponseDto = await response.json()
      if (data?.token) {
        this.csrfToken = data.token
      }
    } catch (error) {
      // CSRF fetch failure is non-fatal - log and continue
      console.warn('Error fetching CSRF token:', error)
    }
  }

  /**
   * Get CSRF token with full response (includes headerName)
   * Use this if you need to know which header name to use
   */
  async getCsrfTokenResponse(): Promise<CsrfResponseDto | null> {
    try {
      const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.CSRF}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const data: CsrfResponseDto = await response.json()
      if (data?.token) {
        this.csrfToken = data.token
      }
      return data
    } catch (error) {
      console.warn('Error fetching CSRF token:', error)
      return null
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.authToken) {
      headers[AUTH_HEADERS.AUTHORIZATION] = `Bearer ${this.authToken}`
    }
    // Include CSRF token when available (for future implementation)
    if (this.csrfToken) {
      headers[AUTH_HEADERS.CSRF_TOKEN] = this.csrfToken
    }
    return headers
  }

  private getAuthHeadersWithDelete(): Record<string, string> {
    return {
      ...this.getAuthHeaders(),
      'X-Delete-Password': DELETE_PASSWORD,
    }
  }

  /**
   * Get auth headers for FormData requests (without Content-Type)
   * Browser must set Content-Type with boundary for multipart/form-data
   */
  private getFormDataAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.authToken) {
      headers[AUTH_HEADERS.AUTHORIZATION] = `Bearer ${this.authToken}`
    }
    if (this.csrfToken) {
      headers[AUTH_HEADERS.CSRF_TOKEN] = this.csrfToken
    }
    return headers
  }

  // ===== Auth API Methods =====

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await makeNullableRequest<LoginResponse>(
      `${this.baseURL}${AUTH_ENDPOINTS.LOGIN}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'logging in'
    )

    if (!response) {
      throw new Error('Failed to login')
    }

    // Set the token on successful login
    this.setAuthToken(response.token)
    return response
  }

  async getCurrentUser(): Promise<LoginResponse | null> {
    return makeNullableRequest<LoginResponse>(
      `${this.baseURL}${AUTH_ENDPOINTS.ME}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching current user'
    )
  }

  /**
   * Refresh access token using a refresh token
   * Call this before the access token expires to maintain the session
   * @param refreshToken - The refresh token from the login response
   * @returns New tokens if successful
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken }
    const response = await makeNullableRequest<RefreshTokenResponse>(
      `${this.baseURL}${AUTH_ENDPOINTS.REFRESH}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
      'refreshing token'
    )

    if (!response) {
      throw new Error('Failed to refresh token')
    }

    // Update the auth token with the new one
    this.setAuthToken(response.token)
    return response
  }

  /**
   * Logout and invalidate server-side session
   */
  async logout(): Promise<void> {
    try {
      await makeSimpleRequest(
        `${this.baseURL}${AUTH_ENDPOINTS.LOGOUT}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        },
        'logging out'
      )
    } finally {
      // Clear tokens regardless of server response
      this.clearAuthToken()
      this.csrfToken = null
    }
  }

  /**
   * Change the current user's password
   * Note: After successful password change, the token is invalidated and user must re-login
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}${AUTH_ENDPOINTS.CHANGE_PASSWORD}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'changing password'
    )
  }

  // ===== User Management (Admin Only) =====

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<UserDto[]> {
    return makeArrayRequest<UserDto>(
      `${this.baseURL}${AUTH_ENDPOINTS.USERS}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching users'
    )
  }

  /**
   * Get a user by ID (admin only)
   */
  async getUserById(id: string): Promise<UserDto | null> {
    return makeNullableRequest<UserDto>(
      `${this.baseURL}${AUTH_ENDPOINTS.USERS}/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching user'
    )
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(request: CreateUserRequest): Promise<UserDto> {
    const response = await makeNullableRequest<UserDto>(
      `${this.baseURL}${AUTH_ENDPOINTS.USERS}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'creating user'
    )

    if (!response) {
      throw new Error('Failed to create user')
    }

    return response
  }

  /**
   * Update a user (admin only)
   */
  async updateUser(id: string, request: UpdateUserRequest): Promise<UserDto> {
    const response = await makeNullableRequest<UserDto>(
      `${this.baseURL}${AUTH_ENDPOINTS.USERS}/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'updating user'
    )

    if (!response) {
      throw new Error('Failed to update user')
    }

    return response
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}${AUTH_ENDPOINTS.USERS}/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      },
      'deleting user'
    )
  }

  /**
   * @deprecated Use createSopWithFile() instead. This method will be removed in a future version.
   * The backend now expects multipart/form-data with optional file upload.
   */
  async createSOP(requestDto: CreateSopRequestDto): Promise<SopDto> {
    const response = await makeNullableRequest<SopDto>(
      `${this.baseURL}/api/sop`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating SOP'
    )

    if (!response) {
      throw new Error('Failed to create SOP')
    }

    return response
  }

  /**
   * Create SOP with multipart/form-data (aligned with OpenAPI spec)
   * @param requestDto - SOP metadata
   * @param file - Optional SOP file (.pdf, .doc, .docx)
   * @returns Created SOP
   */
  async createSopWithFile(
    requestDto: CreateSopRequestDto,
    file?: File
  ): Promise<SopDto> {
    const formData = new FormData()

    // Add the request DTO as JSON blob
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
    )

    // Add file if provided
    if (file) {
      formData.append('file', file)
    }

    const response = await makeNullableRequest<SopDto>(
      `${this.baseURL}/api/sop`,
      {
        method: 'POST',
        headers: this.getFormDataAuthHeaders(),
        body: formData,
      },
      'creating SOP with file'
    )

    if (!response) {
      throw new Error('Failed to create SOP')
    }

    return response
  }

  async updateSOP(id: string, requestDto: UpdateSopRequestDto): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/sop/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      `updating SOP ${id}`
    )
  }

  async getSops(companyId?: string): Promise<SopDto[]> {
    const params = companyId
      ? `?companyId=${encodeURIComponent(companyId)}`
      : ''
    const sops = await makeArrayRequest<SopDto>(
      `${this.baseURL}/api/sop${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching SOPs'
    )

    return sops
  }

  async getSopById(id: string): Promise<SopDto | null> {
    return makeNullableRequest<SopDto>(
      `${this.baseURL}/api/sop/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching SOP ${id}`
    )
  }

  /**
   * @deprecated Synchronous SOP processing no longer exists. The backend endpoint
   * POST /api/sop/process/{id} now returns an async task response.
   * Use processSopAsync() instead.
   */
  async processSop(id: string): Promise<SopProcessingResultDto | null> {
    console.warn(
      'processSop() is deprecated: POST /api/sop/process/{id} now returns async task. Use processSopAsync() instead.'
    )
    return makeNullableRequest<SopProcessingResultDto>(
      `${this.baseURL}/api/sop/process/${id}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      `processing SOP ${id}`
    )
  }

  /**
   * @deprecated Use processSop() instead. This alias will be removed in a future version.
   */
  async analyzeSop(id: string): Promise<GeminiSopAnalysisDto | null> {
    const result = await this.processSop(id)
    // Transform to legacy format for backward compatibility
    return result ? { steps: result.steps } : null
  }

  async deleteSop(id: string): Promise<SOPResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/sop/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting SOP ${id}`
    )
  }

  // ===== SOP DAG Edge Management =====

  /**
   * Create an edge between two steps in an SOP DAG
   * Returns the created edge and validation result
   * Will fail with 400 if the edge would create a cycle
   */
  async createEdge(
    sopId: string,
    request: CreateEdgeRequestDto
  ): Promise<CreateEdgeResponseDto> {
    return makeObjectRequest<CreateEdgeResponseDto>(
      `${this.baseURL}/api/sop/${sopId}/edges`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      `creating edge in SOP ${sopId}`
    )
  }

  /**
   * Delete an edge from an SOP DAG
   * Returns the validation result after deletion
   */
  async deleteEdge(
    sopId: string,
    edgeId: string
  ): Promise<DagValidationResultDto> {
    return makeObjectRequest<DagValidationResultDto>(
      `${this.baseURL}/api/sop/${sopId}/edges/${edgeId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting edge ${edgeId} from SOP ${sopId}`
    )
  }

  /**
   * Update a step's node type (START, STEP, or END)
   * Returns the updated step
   */
  async updateStepNodeType(
    sopId: string,
    stepId: string,
    nodeType: StepNodeType
  ): Promise<StepDto> {
    return makeObjectRequest<StepDto>(
      `${this.baseURL}/api/sop/${sopId}/steps/${stepId}/node-type?nodeType=${nodeType}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      },
      `updating node type for step ${stepId}`
    )
  }

  /**
   * Create a new step for an SOP
   * The step is created disconnected from the DAG - use edge endpoints to connect it
   */
  async createStep(
    sopId: string,
    request: CreateStepRequestDto
  ): Promise<StepDto> {
    return makeObjectRequest<StepDto>(
      `${this.baseURL}/api/sop/${sopId}/steps`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      `creating step for SOP ${sopId}`
    )
  }

  /**
   * Delete a step from an SOP
   * Automatically cleans up all connected edges
   */
  async deleteStep(sopId: string, stepId: string): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/sop/${sopId}/steps/${stepId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting step ${stepId} from SOP ${sopId}`
    )
  }

  /**
   * Validate the DAG structure of an SOP
   * Returns validation result with any errors and warnings
   */
  async validateDag(sopId: string): Promise<DagValidationResultDto> {
    return makeObjectRequest<DagValidationResultDto>(
      `${this.baseURL}/api/sop/${sopId}/validate`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `validating DAG for SOP ${sopId}`
    )
  }

  /**
   * @deprecated Backend endpoint POST /api/sop/{sopId}/migrate-to-dag has been removed.
   * All SOPs are now DAG-native. This method will 404.
   */
  async migrateToDag(sopId: string): Promise<DagValidationResultDto> {
    console.warn(
      'migrateToDag() is deprecated: endpoint removed from backend. All SOPs are DAG-native.'
    )
    return makeObjectRequest<DagValidationResultDto>(
      `${this.baseURL}/api/sop/${sopId}/migrate-to-dag`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      `migrating SOP ${sopId} to DAG format`
    )
  }

  async deleteAllSops(): Promise<SOPResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/sop`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      'deleting all SOPs'
    )
  }

  async uploadSopFile(
    file: File,
    requestDto: UploadSopFileRequestDto
  ): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('requestDto', JSON.stringify(requestDto))

    await makeSimpleRequest(
      `${this.baseURL}/api/sop/file`,
      {
        method: 'POST',
        headers: this.getFormDataAuthHeaders(),
        body: formData,
      },
      'uploading SOP file'
    )
  }

  async getSopFiles(): Promise<SopFileDto[]> {
    return makeArrayRequest<SopFileDto>(
      `${this.baseURL}/api/sop/file`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching SOP files'
    )
  }

  async getSopFileById(id: string): Promise<SopFileDto | null> {
    return makeNullableRequest<SopFileDto>(
      `${this.baseURL}/api/sop/file/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching SOP file ${id}`
    )
  }

  async deleteSopFile(id: string): Promise<SOPResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/sop/file/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting SOP file ${id}`
    )
  }

  async downloadSopFile(id: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/sop/file/${id}/download`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error(`Error downloading SOP file ${id}:`, error)
      throw error
    }
  }

  // Role methods
  async createRole(requestDto: CreateRoleRequestDto): Promise<RoleDto> {
    const response = await makeNullableRequest<RoleDto>(
      `${this.baseURL}/api/role`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating role'
    )

    if (!response) {
      throw new Error('Failed to create role')
    }

    return response
  }

  async getRoles(companyId?: string): Promise<RoleDto[]> {
    const params = companyId
      ? `?companyId=${encodeURIComponent(companyId)}`
      : ''
    return makeArrayRequest<RoleDto>(
      `${this.baseURL}/api/role${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching roles'
    )
  }

  async getRoleById(id: string): Promise<RoleDto | null> {
    return makeNullableRequest<RoleDto>(
      `${this.baseURL}/api/role/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching role ${id}`
    )
  }

  async getRolesByTitle(title: RoleTitle): Promise<RoleDto[]> {
    return makeArrayRequest<RoleDto>(
      `${this.baseURL}/api/role/title/${title}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching roles by title ${title}`
    )
  }

  async updateRole(
    id: string,
    requestDto: UpdateRoleRequestDto
  ): Promise<RoleDto> {
    const response = await makeNullableRequest<RoleDto>(
      `${this.baseURL}/api/role/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      `updating role ${id}`
    )

    if (!response) {
      throw new Error('Failed to update role')
    }

    return response
  }

  async deleteRole(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/role/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting role ${id}`
    )
  }

  async deleteAllRoles(): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/role`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      'deleting all roles'
    )
  }

  // Log methods
  /**
   * @deprecated Use createLogWithFile() instead. This method will be removed in a future version.
   * The backend now expects multipart/form-data with required file upload.
   */
  async createLog(requestDto: CreateLogRequestDto): Promise<LogDto> {
    const response = await makeNullableRequest<LogDto>(
      `${this.baseURL}/api/log`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating log'
    )

    if (!response) {
      throw new Error('Failed to create log')
    }

    return response
  }

  /**
   * Create Log with multipart/form-data (aligned with OpenAPI spec)
   * @param requestDto - Log metadata
   * @param file - REQUIRED log file (.log, .txt, .csv, .json)
   * @returns Created Log
   */
  async createLogWithFile(
    requestDto: CreateLogRequestDto,
    file: File
  ): Promise<LogDto> {
    const formData = new FormData()

    // Add the request DTO as JSON blob
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
    )

    // Add required file
    formData.append('file', file)

    const response = await makeNullableRequest<LogDto>(
      `${this.baseURL}/api/log`,
      {
        method: 'POST',
        headers: this.getFormDataAuthHeaders(),
        body: formData,
      },
      'creating log with file'
    )

    if (!response) {
      throw new Error('Failed to create log')
    }

    return response
  }

  async updateLog(id: string, requestDto: UpdateLogRequestDto): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/log/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      `updating log ${id}`
    )
  }

  async getLogs(companyId?: string): Promise<LogDto[]> {
    const params = companyId
      ? `?companyId=${encodeURIComponent(companyId)}`
      : ''
    return makeArrayRequest<LogDto>(
      `${this.baseURL}/api/log${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching logs'
    )
  }

  async getLogById(id: string): Promise<LogDto | null> {
    return makeNullableRequest<LogDto>(
      `${this.baseURL}/api/log/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log ${id}`
    )
  }

  /**
   * @deprecated Synchronous log processing no longer exists. The backend endpoint
   * POST /api/log/process/{id} now returns an async task response.
   * Use processLogAsync() instead.
   */
  async processLog(id: string): Promise<LogProcessingResultDto | null> {
    console.warn(
      'processLog() is deprecated: POST /api/log/process/{id} now returns async task. Use processLogAsync() instead.'
    )
    return makeNullableRequest<LogProcessingResultDto>(
      `${this.baseURL}/api/log/process/${id}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      `processing log ${id}`
    )
  }

  /**
   * @deprecated Use processLog() instead. This alias will be removed in a future version.
   */
  async analyzeLog(id: string): Promise<LogAnalysisDto | null> {
    return this.processLog(id)
  }

  async deleteLog(id: string): Promise<LogResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/log/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting log ${id}`
    )
  }

  async deleteAllLogs(): Promise<LogResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/log`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      'deleting all logs'
    )
  }

  // Log file methods
  async uploadLogFile(
    file: File,
    requestDto: UploadLogFileRequestDto
  ): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('requestDto', JSON.stringify(requestDto))

    await makeSimpleRequest(
      `${this.baseURL}/api/log/file`,
      {
        method: 'POST',
        headers: this.getFormDataAuthHeaders(),
        body: formData,
      },
      'uploading log file'
    )
  }

  async getLogFiles(): Promise<LogFileDto[]> {
    return makeArrayRequest<LogFileDto>(
      `${this.baseURL}/api/log/file`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching log files'
    )
  }

  async getLogFileById(id: string): Promise<LogFileDto | null> {
    return makeNullableRequest<LogFileDto>(
      `${this.baseURL}/api/log/file/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log file ${id}`
    )
  }

  async deleteLogFile(id: string): Promise<SOPResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/log/file/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting log file ${id}`
    )
  }

  async downloadLogFile(id: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/log/file/${id}/download`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error(`Error downloading log file ${id}:`, error)
      throw error
    }
  }

  // Log line query methods
  async getLogLinesByLogId(logId: string): Promise<LogLineDto[]> {
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/${logId}/lines`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines for log ${logId}`
    )
  }

  async getLogLinesByActor(actor: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ actor })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-actor?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by actor ${actor}`
    )
  }

  async getLogLinesByOwner(owner: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ owner })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-owner?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by owner ${owner}`
    )
  }

  async getLogLinesByEvent(event: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ event })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-event?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by event ${event}`
    )
  }

  async getLogLinesByDomain(domain: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ domain })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-domain?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by domain ${domain}`
    )
  }

  async getLogLinesByIp(ipAddress: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ ipAddress })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-ip?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by IP ${ipAddress}`
    )
  }

  async getLogLinesByDateRange(
    start: string,
    end: string
  ): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ start, end })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-date-range?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by date range`
    )
  }

  async getLogLinesByUser(user: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ user })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-user?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by user ${user}`
    )
  }

  async getLogLinesSharingDetection(owner: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ owner })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/sharing-detection?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching sharing detection for owner ${owner}`
    )
  }

  async getLogLinesByMultiAttribute(filters: {
    event?: string
    eventCategory?: EventCategory
    platform?: Platform
    service?: string
    actor?: string
    owner?: string
    target?: string
    domain?: string
    resourceId?: string
    resourceTitle?: string
    ipAddress?: string
    startDate?: string
    endDate?: string
  }): Promise<LogLineDto[]> {
    // Build query params, only including non-empty values
    const params = new URLSearchParams()
    if (filters.event) params.append('event', filters.event)
    if (filters.eventCategory)
      params.append('eventCategory', filters.eventCategory)
    if (filters.platform) params.append('platform', filters.platform)
    if (filters.service) params.append('service', filters.service)
    if (filters.actor) params.append('actor', filters.actor)
    if (filters.owner) params.append('owner', filters.owner)
    if (filters.target) params.append('target', filters.target)
    if (filters.domain) params.append('domain', filters.domain)
    if (filters.resourceId) params.append('resourceId', filters.resourceId)
    if (filters.resourceTitle)
      params.append('resourceTitle', filters.resourceTitle)
    if (filters.ipAddress) params.append('ipAddress', filters.ipAddress)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/multi-attribute?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by multi-attribute query`
    )
  }

  /**
   * @deprecated Backend endpoint GET /api/log/lines/statistics does not exist.
   * Statistics are now available via GET /api/statistics/log (requires integration).
   */
  async getLogLineStatistics(
    companyId: string
  ): Promise<LogLineStatisticsDto | null> {
    console.warn(
      'getLogLineStatistics() is deprecated: /api/log/lines/statistics does not exist. Statistics are under /api/statistics/log.'
    )
    const params = new URLSearchParams({ companyId })
    return makeNullableRequest<LogLineStatisticsDto>(
      `${this.baseURL}/api/log/lines/statistics?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log line statistics for company ${companyId}`
    )
  }

  async getLogLinesByPlatform(platform: Platform): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ platform })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-platform?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by platform ${platform}`
    )
  }

  async getLogLinesByPlatformAndService(
    platform: Platform,
    service: string
  ): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ platform, service })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-platform-service?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by platform ${platform} and service ${service}`
    )
  }

  async getLogLinesByService(service: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ service })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-service?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by service ${service}`
    )
  }

  async getLogLinesByResourceId(resourceId: string): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ resourceId })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-resource-id?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by resource ID ${resourceId}`
    )
  }

  async getLogLinesByResourceTitle(
    resourceTitle: string
  ): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ resourceTitle })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-resource-title?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by resource title ${resourceTitle}`
    )
  }

  async getLogLinesByEventCategory(
    eventCategory: EventCategory
  ): Promise<LogLineDto[]> {
    const params = new URLSearchParams({ eventCategory })
    return makeArrayRequest<LogLineDto>(
      `${this.baseURL}/api/log/lines/by-event-category?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching log lines by event category ${eventCategory}`
    )
  }

  // Company methods
  async createCompany(
    requestDto: CreateCompanyRequestDto
  ): Promise<CompanyDto> {
    return await makeObjectRequest<CompanyDto>(
      `${this.baseURL}/api/company`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating company'
    )
  }

  async getCompanies(): Promise<CompanyDto[]> {
    return makeArrayRequest<CompanyDto>(
      `${this.baseURL}/api/company`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching companies'
    )
  }

  async getCompanyById(id: string): Promise<CompanyDto | null> {
    return makeNullableRequest<CompanyDto>(
      `${this.baseURL}/api/company/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching company ${id}`
    )
  }

  async updateCompany(
    id: string,
    companyData: UpdateCompanyRequestDto
  ): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/company/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(companyData),
      },
      `updating company ${id}`
    )
  }

  async deleteCompany(id: string): Promise<CompanyResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/company/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting company ${id}`
    )
  }

  async deleteAllCompanies(): Promise<CompanyResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/company`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      'deleting all companies'
    )
  }

  // Employee methods
  async createEmployee(requestDto: CreateEmployeeRequestDto): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/company/${requestDto.companyId}/employee`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating employee'
    )
  }

  async getEmployees(companyId: string): Promise<EmployeeDto[]> {
    return makeArrayRequest<EmployeeDto>(
      `${this.baseURL}/api/company/${companyId}/employee`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching employees for company ${companyId}`
    )
  }

  async getEmployeeById(
    companyId: string,
    employeeId: string
  ): Promise<EmployeeDto | null> {
    return makeNullableRequest<EmployeeDto>(
      `${this.baseURL}/api/company/${companyId}/employee/${employeeId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching employee ${employeeId}`
    )
  }

  async updateEmployee(
    companyId: string,
    employeeId: string,
    employeeData: UpdateEmployeeRequestDto
  ): Promise<void> {
    await makeSimpleRequest(
      `${this.baseURL}/api/company/${companyId}/employee/${employeeId}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(employeeData),
      },
      `updating employee ${employeeId}`
    )
  }

  async deleteEmployee(
    companyId: string,
    employeeId: string
  ): Promise<EmployeeResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/company/${companyId}/employee/${employeeId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting employee ${employeeId}`
    )
  }

  async deleteAllEmployees(companyId: string): Promise<EmployeeResponse> {
    return makeSimpleRequest(
      `${this.baseURL}/api/company/${companyId}/employee`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting all employees for company ${companyId}`
    )
  }

  async bulkCreateEmployees(
    companyId: string,
    request: BulkCreateEmployeesRequestDto
  ): Promise<BulkEmployeeResponseDto> {
    const response = await makeNullableRequest<BulkEmployeeResponseDto>(
      `${this.baseURL}/api/company/${companyId}/employee/bulk`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'bulk creating employees'
    )

    if (!response) {
      throw new Error('Failed to bulk create employees')
    }

    return response
  }

  async bulkUpdateEmployees(
    companyId: string,
    request: BulkUpdateEmployeesRequestDto
  ): Promise<BulkEmployeeResponseDto> {
    const response = await makeNullableRequest<BulkEmployeeResponseDto>(
      `${this.baseURL}/api/company/${companyId}/employee/bulk`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'bulk updating employees'
    )

    if (!response) {
      throw new Error('Failed to bulk update employees')
    }

    return response
  }

  // Org Chart methods

  /**
   * Get root employees (no manager) to initialize the org chart
   */
  async getOrgChartRoots(companyId: string): Promise<OrgChartResponseDto> {
    const response = await makeNullableRequest<OrgChartResponseDto>(
      `${this.baseURL}/api/company/${companyId}/org-chart`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching org chart roots for company ${companyId}`
    )

    if (!response) {
      throw new Error('Failed to fetch org chart roots')
    }

    return response
  }

  /**
   * Get direct reports of an employee for lazy loading (navigate DOWN)
   */
  async getOrgChartDirectReports(
    companyId: string,
    employeeId: string
  ): Promise<OrgChartResponseDto> {
    const response = await makeNullableRequest<OrgChartResponseDto>(
      `${this.baseURL}/api/company/${companyId}/org-chart/${employeeId}/direct-reports`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching direct reports for employee ${employeeId}`
    )

    if (!response) {
      throw new Error('Failed to fetch direct reports')
    }

    return response
  }

  /**
   * Get centered view of an employee (1 level up + 1 level down)
   */
  async getOrgChartEmployee(
    companyId: string,
    employeeId: string
  ): Promise<OrgChartResponseDto> {
    const response = await makeNullableRequest<OrgChartResponseDto>(
      `${this.baseURL}/api/company/${companyId}/org-chart/employee/${employeeId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching org chart centered on employee ${employeeId}`
    )

    if (!response) {
      throw new Error('Failed to fetch employee org chart')
    }

    return response
  }

  /**
   * Get full manager chain to root (navigate UP)
   */
  async getOrgChartManagerChain(
    companyId: string,
    employeeId: string
  ): Promise<OrgChartResponseDto> {
    const response = await makeNullableRequest<OrgChartResponseDto>(
      `${this.baseURL}/api/company/${companyId}/org-chart/${employeeId}/manager-chain`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching manager chain for employee ${employeeId}`
    )

    if (!response) {
      throw new Error('Failed to fetch manager chain')
    }

    return response
  }

  /**
   * @deprecated Backend endpoint POST /api/gemini/generate is not in the OpenAPI spec.
   * This endpoint may have been removed. Use AI processing via processSopAsync/processLogAsync instead.
   */
  async generateText(prompt: string): Promise<GenerateTextResponseDto | null> {
    console.warn(
      'generateText() is deprecated: /api/gemini/generate may not exist on current backend.'
    )
    return makeNullableRequest<GenerateTextResponseDto>(
      `${this.baseURL}/api/gemini/generate`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ prompt }),
      },
      'generating text with Gemini'
    )
  }

  // ActivityEvent methods
  async createActivityEvent(
    requestDto: CreateActivityEventRequestDto
  ): Promise<ActivityEventDto> {
    const response = await makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      'creating activity event'
    )

    if (!response) {
      throw new Error('Failed to create activity event')
    }

    return response
  }

  async getActivityEvents(companyId?: string): Promise<ActivityEventDto[]> {
    const params = companyId
      ? `?companyId=${encodeURIComponent(companyId)}`
      : ''
    return makeArrayRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching activity events'
    )
  }

  async getActivityEventById(id: string): Promise<ActivityEventDto | null> {
    return makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching activity event ${id}`
    )
  }

  async updateActivityEvent(
    id: string,
    requestDto: UpdateActivityEventRequestDto
  ): Promise<ActivityEventDto> {
    const response = await makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestDto),
      },
      `updating activity event ${id}`
    )

    if (!response) {
      throw new Error('Failed to update activity event')
    }

    return response
  }

  async deleteActivityEvent(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/activity-event/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      `deleting activity event ${id}`
    )
  }

  async deleteAllActivityEvents(): Promise<{
    success: boolean
    message?: string
  }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/activity-event`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithDelete(),
      },
      'deleting all activity events'
    )
  }

  async updateActivityEventRoleTitles(
    id: string,
    roleTitles: RoleTitle[]
  ): Promise<ActivityEventDto | null> {
    return makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}/role-titles`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ roleTitles }),
      },
      `updating role titles for activity event ${id}`
    )
  }

  /**
   * @deprecated Backend endpoint PUT /api/activity-event/{id}/log-line-types does not exist.
   * Use updateActivityEventEventCategories() or updateActivityEventLogLineEventTypes() instead.
   */
  async updateActivityEventLogLineTypes(
    id: string,
    eventCategories: EventCategory[]
  ): Promise<ActivityEventDto | null> {
    console.warn(
      'updateActivityEventLogLineTypes() is deprecated: /log-line-types endpoint does not exist. Use updateActivityEventEventCategories() instead.'
    )
    return makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}/log-line-types`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ eventCategories }),
      },
      `updating event categories for activity event ${id}`
    )
  }

  async updateActivityEventEventCategories(
    id: string,
    eventCategories: EventCategory[]
  ): Promise<ActivityEventDto | null> {
    return makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}/event-categories`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ eventCategories }),
      },
      `updating event categories for activity event ${id}`
    )
  }

  async updateActivityEventLogLineEventTypes(
    id: string,
    logLineEventTypeMappings: LogLineEventTypeMappingDto[]
  ): Promise<ActivityEventDto | null> {
    return makeNullableRequest<ActivityEventDto>(
      `${this.baseURL}/api/activity-event/${id}/log-line-event-types`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ logLineEventTypeMappings }),
      },
      `updating log line event type mappings for activity event ${id}`
    )
  }

  // Analysis methods
  async getActivityEventAssociations(
    request: ActivityEventAssociationsRequestDto
  ): Promise<ActivityEventAssociationsResponseDto | null> {
    return makeNullableRequest<ActivityEventAssociationsResponseDto>(
      `${this.baseURL}/api/analysis/associations`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'fetching activity event associations'
    )
  }

  /**
   * @deprecated Synchronous analysis endpoint no longer exists on the backend.
   * Use analyzeSopOrchestrated() for async DAG-orchestrated analysis instead.
   */
  async traceSopSteps(
    request: AnalyzeSopRequestDto
  ): Promise<TraceSopStepsResponseDto | null> {
    console.warn(
      'traceSopSteps() is deprecated: synchronous /api/analysis/analyze no longer exists. Use analyzeSopOrchestrated() instead.'
    )
    return makeNullableRequest<TraceSopStepsResponseDto>(
      `${this.baseURL}/api/analysis/analyze`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'tracing SOP steps'
    )
  }

  // ===== Async Processing Methods =====

  /**
   * Process SOP with Gemini AI (asynchronous)
   * Queues SOP for background processing
   */
  async processSopAsync(id: string): Promise<AsyncProcessingResponseDto> {
    const response = await makeNullableRequest<AsyncProcessingResponseDto>(
      `${this.baseURL}/api/sop/process/${id}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      `queuing async SOP processing for ${id}`
    )
    if (!response) throw new Error('Failed to queue SOP processing')
    return response
  }

  /**
   * @deprecated Use processSopAsync() instead. This alias will be removed in a future version.
   */
  async analyzeSopAsync(id: string): Promise<AsyncAnalysisResponseDto> {
    return this.processSopAsync(id)
  }

  /**
   * Process Log with Gemini AI (asynchronous)
   * Queues log for background processing
   */
  async processLogAsync(id: string): Promise<AsyncProcessingResponseDto> {
    const response = await makeNullableRequest<AsyncProcessingResponseDto>(
      `${this.baseURL}/api/log/process/${id}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      `queuing async log processing for ${id}`
    )
    if (!response) throw new Error('Failed to queue log processing')
    return response
  }

  /**
   * @deprecated Use processLogAsync() instead. This alias will be removed in a future version.
   */
  async analyzeLogAsync(id: string): Promise<AsyncAnalysisResponseDto> {
    return this.processLogAsync(id)
  }

  // ===== Async Analysis Methods =====

  /**
   * Queue DAG-orchestrated async SOP analysis (recommended)
   * Steps wait for predecessors, enabling cascading time filters
   */
  async analyzeSopOrchestrated(
    request: AnalyzeSopRequestDto
  ): Promise<AnalyzeSopAsyncResponseDto> {
    const response = await makeNullableRequest<AnalyzeSopAsyncResponseDto>(
      `${this.baseURL}/api/analysis/analyze/async`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      },
      'queuing orchestrated SOP analysis'
    )
    if (!response) throw new Error('Failed to queue SOP analysis')
    return response
  }

  /**
   * Get async step analysis result
   */
  async getStepAnalysisResult(
    sopId: string,
    stepId: string,
    taskId: string
  ): Promise<StepAnalysisAsyncResultDto> {
    const params = new URLSearchParams({ sopId, stepId, taskId })
    const response = await makeNullableRequest<StepAnalysisAsyncResultDto>(
      `${this.baseURL}/api/analysis/analyze/async/result?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching step analysis result for step ${stepId}`
    )
    if (!response) throw new Error('Failed to fetch step analysis result')
    return response
  }

  /**
   * Get async LogLine matching result
   */
  async getLogLineMatchingResult(
    taskId: string
  ): Promise<LogLineMatchingAsyncResultDto> {
    const params = new URLSearchParams({ taskId })
    const response = await makeNullableRequest<LogLineMatchingAsyncResultDto>(
      `${this.baseURL}/api/analysis/analyze/async/logline-result?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching LogLine matching result for task ${taskId}`
    )
    if (!response) throw new Error('Failed to fetch LogLine matching result')
    return response
  }

  /**
   * Get aggregated analysis results with edge timing
   * Call after all step tasks complete for full SopAnalysisDto
   */
  async getAnalysisAggregateResult(
    correlationId: string,
    sopId: string
  ): Promise<AsyncAnalysisAggregateResultDto> {
    const params = new URLSearchParams({ correlationId, sopId })
    const response = await makeNullableRequest<AsyncAnalysisAggregateResultDto>(
      `${this.baseURL}/api/analysis/analyze/async/aggregate?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching analysis aggregate result'
    )
    if (!response) throw new Error('Failed to fetch aggregate result')
    return response
  }

  // ===== Analysis Results Methods (Admin) =====

  /**
   * Get analysis results for an SOP
   * Returns results for all steps in the SOP
   * Returns null if no results exist or user lacks admin access
   */
  async getSopCacheInfo(sopId: string): Promise<SopCacheInfoDto | null> {
    try {
      return await makeNullableRequest<SopCacheInfoDto>(
        `${this.baseURL}/api/admin/analysis-results/sop/${sopId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        },
        `fetching analysis results for SOP ${sopId}`
      )
    } catch {
      return null
    }
  }

  /**
   * Get analysis result for a specific step
   * Returns null if no results exist or user lacks admin access
   */
  async getStepCacheInfo(
    stepId: string
  ): Promise<StepActivityEventResultDto | null> {
    try {
      return await makeNullableRequest<StepActivityEventResultDto>(
        `${this.baseURL}/api/admin/analysis-results/step/${stepId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        },
        `fetching analysis result for step ${stepId}`
      )
    } catch {
      return null
    }
  }

  /**
   * @deprecated Backend does not have a GET endpoint for activity event analysis results.
   * Use getStepCacheInfo() to read results per step instead.
   */
  async getActivityEventCacheInfo(
    _activityEventId: string
  ): Promise<ActivityEventCacheInfoDto | null> {
    console.warn(
      'getActivityEventCacheInfo() is deprecated: no GET endpoint exists at /api/admin/analysis-results/activity-event/.'
    )
    return null
  }

  /**
   * Delete analysis results for a specific step
   * Clears cached ActivityEvent selection and LogLine matches
   */
  async invalidateStepCache(
    stepId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      return await makeSimpleRequest(
        `${this.baseURL}/api/admin/analysis-results/step/${stepId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        },
        `deleting analysis results for step ${stepId}`
      )
    } catch {
      return { success: false, message: 'Failed to delete step results' }
    }
  }

  /**
   * Delete all analysis results for an SOP
   * Clears all cached ActivityEvent selections and LogLine matches for all steps
   */
  async invalidateSopCache(
    sopId: string
  ): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/admin/analysis-results/sop/${sopId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      },
      `deleting analysis results for SOP ${sopId}`
    )
  }

  /**
   * Delete LogLine results for an ActivityEvent
   * Clears all cached LogLine matches that reference this ActivityEvent
   */
  async invalidateActivityEventCache(
    activityEventId: string
  ): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/admin/analysis-results/activity-event/${activityEventId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      },
      `deleting analysis results for activity event ${activityEventId}`
    )
  }

  // ===== Gemini Task Management Methods =====

  async getGeminiTaskStatus(taskId: string): Promise<GeminiAsyncTaskDto> {
    const response = await makeNullableRequest<GeminiAsyncTaskDto>(
      `${this.baseURL}/api/gemini/task/${taskId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching Gemini task status for ${taskId}`
    )
    if (!response) throw new Error('Failed to fetch task status')
    return response
  }

  async getGeminiTasksForEntity(
    entityType: string,
    entityId: string
  ): Promise<GeminiAsyncTaskDto[]> {
    const params = new URLSearchParams({ entityType, entityId })
    return makeArrayRequest<GeminiAsyncTaskDto>(
      `${this.baseURL}/api/gemini/task/status?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      `fetching Gemini tasks for ${entityType} ${entityId}`
    )
  }

  // ===== Health Check Methods =====

  /**
   * Get public application health (GET /api/health)
   */
  async getAppHealth(): Promise<AppHealthDto> {
    const response = await makeNullableRequest<AppHealthDto>(
      `${this.baseURL}/api/health`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching application health'
    )
    return response || { status: 'DOWN', database: 'DOWN' }
  }

  // ===== Statistics Methods =====

  /**
   * Get log metrics (GET /api/statistics/log)
   * System-wide log statistics (not company-scoped)
   */
  async getLogMetrics(): Promise<LogMetricsDto | null> {
    return makeNullableRequest<LogMetricsDto>(
      `${this.baseURL}/api/statistics/log`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching log metrics'
    )
  }

  // ===== Admin Methods =====

  /**
   * Get admin system health overview (GET /api/admin/health)
   */
  async getAdminHealth(): Promise<AdminHealthDto | null> {
    return makeNullableRequest<AdminHealthDto>(
      `${this.baseURL}/api/admin/health`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching admin health'
    )
  }

  /**
   * Get database connection pool health (GET /api/admin/db/health)
   */
  async getDbHealth(): Promise<DbHealthDto | null> {
    return makeNullableRequest<DbHealthDto>(
      `${this.baseURL}/api/admin/db/health`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching database health'
    )
  }

  /**
   * Get database statistics (GET /api/admin/db/stats)
   */
  async getDbStats(): Promise<DbStatsDto | null> {
    return makeNullableRequest<DbStatsDto>(
      `${this.baseURL}/api/admin/db/stats`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      },
      'fetching database stats'
    )
  }

  /**
   * Synchronize database counts
   * Recalculates cached count values
   */
  async syncDbCounts(): Promise<{ success: boolean; message?: string }> {
    return makeSimpleRequest(
      `${this.baseURL}/api/statistics/db/sync-counts`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      },
      'synchronizing database counts'
    )
  }
}

// Export a singleton instance
export const apiClient = new APIClient()
