export interface Section {
  title: string
  items: Array<{ label: string; value: string }>
}

export function formatSectionHeader(
  title: string,
  lineLength: number = 50
): string {
  return `${title}\n${'='.repeat(lineLength)}\n`
}

export function formatSectionDivider(lineLength: number = 30): string {
  return '-'.repeat(lineLength)
}

export function formatKeyValue(label: string, value: string): string {
  return `${label}: ${value || '(empty)'}\n`
}

export function formatTextDocument(sections: Section[]): string {
  let text = ''

  sections.forEach((section, index) => {
    text += formatSectionHeader(section.title)
    section.items.forEach((item) => {
      text += formatKeyValue(item.label, item.value)
    })

    if (index < sections.length - 1) {
      text += '\n\n'
    }
  })

  return text
}

// Specialized formatters for Company
export function formatCompanyAsText(company: {
  name: string
  address: string
  phoneNumber: string
  email: string
  createdAt: string
}): string {
  return formatTextDocument([
    {
      title: 'COMPANY INFORMATION',
      items: [
        { label: 'Name', value: company.name },
        { label: 'Address', value: company.address },
        { label: 'Phone Number', value: company.phoneNumber },
        { label: 'Email', value: company.email },
        {
          label: 'Created',
          value: new Date(company.createdAt).toLocaleDateString(),
        },
      ],
    },
  ])
}

// Specialized formatters for SOP
export function formatSopAsText(sop: {
  companyName: string
  name: string
  basicDescription: string
  createdAt: string
  steps: Array<{
    name: string
    details: string
    postStepDocumentation: string
    monitoringRequirements: string
  }>
}): string {
  const sections: Section[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Company', value: sop.companyName },
        { label: 'SOP Name', value: sop.name },
        {
          label: 'Created',
          value: new Date(sop.createdAt).toLocaleDateString(),
        },
        { label: '\nDescription', value: sop.basicDescription },
      ],
    },
  ]

  const stepItems: Array<{ label: string; value: string }> = []
  sop.steps.forEach((step, index) => {
    stepItems.push(
      { label: `\nStep ${index + 1}`, value: formatSectionDivider() },
      { label: 'Name', value: step.name },
      { label: 'Details', value: step.details },
      { label: 'Post-Step Documentation', value: step.postStepDocumentation },
      { label: 'Monitoring Requirements', value: step.monitoringRequirements }
    )
  })
  sections.push({
    title: 'STEPS',
    items: stepItems,
  })

  return formatTextDocument(sections)
}

// Specialized formatters for Employee
export function formatEmployeeAsText(employee: {
  name: string
  phoneNumber: string
  email: string
  roleTitle: string | null
  managerName: string | null
  createdAt: string
}): string {
  const items = [
    { label: 'Name', value: employee.name },
    { label: 'Email', value: employee.email },
    { label: 'Phone Number', value: employee.phoneNumber },
  ]

  if (employee.roleTitle) {
    items.push({ label: 'Role', value: employee.roleTitle })
  }

  if (employee.managerName) {
    items.push({ label: 'Manager', value: employee.managerName })
  }

  items.push({
    label: 'Created',
    value: new Date(employee.createdAt).toLocaleDateString(),
  })

  return formatTextDocument([
    {
      title: 'EMPLOYEE INFORMATION',
      items,
    },
  ])
}

// Specialized formatters for Role
export function formatRoleAsText(role: {
  name: string
  title: string
  description: string
  responsibilities: string
}): string {
  return formatTextDocument([
    {
      title: 'ROLE INFORMATION',
      items: [
        { label: 'Name', value: role.name },
        { label: 'Title', value: role.title },
        { label: 'Description', value: role.description },
        { label: 'Responsibilities', value: role.responsibilities },
      ],
    },
  ])
}

// Specialized formatters for ActivityEvent
export function formatActivityEventAsText(activityEvent: {
  name: string
  description: string
  associatedRoleTitles: string[]
  associatedEventCategories: string[]
  logLineEventTypeMappings: Array<{
    platform: string
    service: string
    event: string
  }>
  createdAt: string
}): string {
  const mappingsFormatted =
    activityEvent.logLineEventTypeMappings.length > 0
      ? activityEvent.logLineEventTypeMappings
          .map((m) => `${m.platform}/${m.service}/${m.event}`)
          .join(', ')
      : '(none)'

  return formatTextDocument([
    {
      title: 'ACTIVITY EVENT INFORMATION',
      items: [
        { label: 'Name', value: activityEvent.name },
        { label: 'Description', value: activityEvent.description },
        {
          label: 'Associated Role Titles',
          value: activityEvent.associatedRoleTitles.join(', ') || '(none)',
        },
        {
          label: 'Associated Event Categories',
          value: activityEvent.associatedEventCategories.join(', ') || '(none)',
        },
        { label: 'Log Line Event Type Mappings', value: mappingsFormatted },
        {
          label: 'Created',
          value: new Date(activityEvent.createdAt).toLocaleDateString(),
        },
      ],
    },
  ])
}

// Specialized formatters for Log
export function formatLogAsText(log: {
  companyName: string
  name: string
  loggingSource: string
  createdAt: string
  driveLineCount?: number
  mailLineCount?: number
  tasksLineCount?: number
  deviceLineCount?: number
  metadata?: Record<string, unknown>
}): string {
  const items = [
    { label: 'Company', value: log.companyName },
    { label: 'Log Name', value: log.name },
    { label: 'Logging Source', value: log.loggingSource },
    { label: 'Created', value: new Date(log.createdAt).toLocaleDateString() },
  ]

  // Add log line counts if available
  const totalLines =
    (log.driveLineCount || 0) +
    (log.mailLineCount || 0) +
    (log.tasksLineCount || 0) +
    (log.deviceLineCount || 0)

  if (totalLines > 0) {
    items.push({ label: '\nLog Statistics', value: formatSectionDivider() })
    items.push({ label: 'Total Lines', value: totalLines.toString() })
    if (log.driveLineCount)
      items.push({
        label: 'Google Drive Lines',
        value: log.driveLineCount.toString(),
      })
    if (log.mailLineCount)
      items.push({
        label: 'Google Mail Lines',
        value: log.mailLineCount.toString(),
      })
    if (log.tasksLineCount)
      items.push({
        label: 'Google Tasks Lines',
        value: log.tasksLineCount.toString(),
      })
    if (log.deviceLineCount)
      items.push({
        label: 'Google Device Lines',
        value: log.deviceLineCount.toString(),
      })
  }

  // Add metadata if exists
  if (log.metadata && Object.keys(log.metadata).length > 0) {
    items.push({
      label: '\nMetadata',
      value: JSON.stringify(log.metadata, null, 2),
    })
  }

  return formatTextDocument([
    {
      title: 'LOG INFORMATION',
      items,
    },
  ])
}
