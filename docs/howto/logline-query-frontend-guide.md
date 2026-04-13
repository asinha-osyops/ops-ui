# Frontend Developer Guide: LogLine Query API

A comprehensive guide for frontend developers integrating with the LogLine query endpoints for audit log visualization, filtering, and analysis.

## Table of Contents

1. [Introduction](#introduction)
2. [API Quick Reference](#api-quick-reference)
3. [Data Model](#data-model)
   - [LogLineDto](#loglinedto)
   - [Platform & Service](#platform--service)
   - [EventCategory](#eventcategory)
   - [Statistics](#statistics)
4. [Query Patterns](#query-patterns)
   - [Simple Queries](#simple-queries)
   - [Cross-Platform Queries](#cross-platform-queries)
   - [Multi-Attribute Search](#multi-attribute-search)
5. [Pagination](#pagination)
6. [Best Practices](#best-practices)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [Code Examples](#code-examples)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

The LogLine API provides access to parsed audit logs from multiple platforms (Google Workspace, Slack, Microsoft 365). The unified data model enables:

- **Cross-platform queries** - Find all document edits regardless of source
- **Flexible filtering** - Filter by actor, resource, date range, event type
- **Resource tracking** - Follow all activity on a specific document or message
- **User activity analysis** - See everything a user did or was affected by

### Key Concepts

| Concept           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| **Platform**      | Source system: `GOOGLE`, `SLACK`, `MICROSOFT`                     |
| **Service**       | Subsystem within platform: `DRIVE`, `MAIL`, `TASKS`, `DEVICE`     |
| **EventCategory** | Cross-platform event abstraction: `DOCUMENT_EDIT`, `MESSAGE_SEND` |
| **Event**         | Service-specific event name: `Edit`, `Send`, `message_posted`     |
| **ResourceId**    | Unified identifier (documentId, messageId, taskId, deviceId)      |

### OpenAPI Specification

For complete request/response schemas:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

---

## API Quick Reference

All LogLine query endpoints are under `/api/log/lines`.

### Single-Field Queries

| Method | Endpoint                   | Description                    | Parameters     |
| ------ | -------------------------- | ------------------------------ | -------------- |
| `GET`  | `/lines/by-actor`          | Find by actor email            | `actor`        |
| `GET`  | `/lines/by-owner`          | Find by resource owner         | `owner`        |
| `GET`  | `/lines/by-event`          | Find by service-specific event | `event`        |
| `GET`  | `/lines/by-domain`         | Find by domain                 | `domain`       |
| `GET`  | `/lines/by-ip`             | Find by IP address             | `ipAddress`    |
| `GET`  | `/lines/by-date-range`     | Find within date range         | `start`, `end` |
| `GET`  | `/lines/by-user`           | Find all user activity         | `user`         |
| `GET`  | `/lines/sharing-detection` | Find sharing activity          | `owner`        |

### Platform/Service/Category Queries (New)

| Method | Endpoint                     | Description                     | Parameters            |
| ------ | ---------------------------- | ------------------------------- | --------------------- |
| `GET`  | `/lines/by-platform`         | Find by platform                | `platform`            |
| `GET`  | `/lines/by-service`          | Find by service                 | `service`             |
| `GET`  | `/lines/by-event-category`   | Find by cross-platform category | `eventCategory`       |
| `GET`  | `/lines/by-platform-service` | Find by platform + service      | `platform`, `service` |

### Resource Queries (New)

| Method | Endpoint                   | Description                   | Parameters      |
| ------ | -------------------------- | ----------------------------- | --------------- |
| `GET`  | `/lines/by-resource-id`    | Find by resource ID           | `resourceId`    |
| `GET`  | `/lines/by-resource-title` | Find by title (partial match) | `resourceTitle` |

### Advanced Queries

| Method | Endpoint                 | Description                  | Returns                |
| ------ | ------------------------ | ---------------------------- | ---------------------- |
| `GET`  | `/lines/multi-attribute` | Multi-filter with pagination | `Page<LogLineDto>`     |
| `GET`  | `/lines/statistics`      | Aggregated counts            | `LogLineStatisticsDto` |
| `GET`  | `/{logId}/lines`         | All lines for a specific log | `LogLineDto[]`         |

---

## Data Model

### LogLineDto

The unified response object for all log line queries:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "logId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",

  "platform": "GOOGLE",
  "service": "DRIVE",

  "eventCategory": "DOCUMENT_EDIT",
  "event": "Edit",

  "date": "2024-12-15T14:30:00Z",

  "actor": "john@acme.com",
  "owner": "jane@acme.com",
  "target": null,
  "domain": "acme.com",
  "ipAddress": "192.168.1.100",

  "resourceId": "1abc123def456",
  "resourceTitle": "Q4 Financial Report.xlsx",
  "resourceType": "SPREADSHEET",
  "visibility": "shared_internally",

  "metadata": {
    "sharedDriveId": "0AGfh...",
    "revisionId": "2"
  },

  "actorEmployeeId": "8f14e45f-ceea-467f-a8e8-7f9c8c5a9b3e",
  "ownerEmployeeId": "9a23f56g-deeb-578g-b9f9-8g0d9d6b0c4f",
  "targetEmployeeId": null,

  "lineNumber": 42,
  "createdAt": "2024-12-15T14:35:00Z"
}
```

### Platform & Service

**Platform** identifies the source system:

| Platform    | Display Name     | Available Services                                 |
| ----------- | ---------------- | -------------------------------------------------- |
| `GOOGLE`    | Google Workspace | `DRIVE`, `MAIL`, `TASKS`, `DEVICE`                 |
| `SLACK`     | Slack            | `MESSAGE`, `CHANNEL`, `FILE` (future)              |
| `MICROSOFT` | Microsoft 365    | `ONEDRIVE`, `OUTLOOK`, `TEAMS`, `AZUREAD` (future) |

**Service** is a string (not enum) for extensibility. Current values:

| Service  | Platform | Description                  |
| -------- | -------- | ---------------------------- |
| `DRIVE`  | GOOGLE   | Google Drive file operations |
| `MAIL`   | GOOGLE   | Gmail email operations       |
| `TASKS`  | GOOGLE   | Google Tasks operations      |
| `DEVICE` | GOOGLE   | Mobile device management     |

### EventCategory

Cross-platform event abstraction (30 categories). Group log lines by behavior regardless of source:

#### Document Operations

| Category            | Description           | Google Mappings               |
| ------------------- | --------------------- | ----------------------------- |
| `DOCUMENT_VIEW`     | Viewing a document    | Drive.View                    |
| `DOCUMENT_EDIT`     | Modifying content     | Drive.Edit                    |
| `DOCUMENT_CREATE`   | Creating new document | Drive.Create                  |
| `DOCUMENT_DELETE`   | Deleting/trashing     | Drive.Trash                   |
| `DOCUMENT_COPY`     | Copying               | Drive.Copy, Drive.Source Copy |
| `DOCUMENT_MOVE`     | Moving                | Drive.Move                    |
| `DOCUMENT_RENAME`   | Renaming              | Drive.Rename                  |
| `DOCUMENT_UPLOAD`   | Uploading             | Drive.Upload                  |
| `DOCUMENT_DOWNLOAD` | Downloading           | Drive.Download                |
| `DOCUMENT_SYNC`     | Syncing               | Drive.Item content synced     |

#### Permission Operations

| Category            | Description         | Google Mappings                       |
| ------------------- | ------------------- | ------------------------------------- |
| `PERMISSION_CHANGE` | Sharing/ACL changes | Drive.User Sharing Permissions Change |
| `OWNERSHIP_CHANGE`  | Owner transfer      | Drive.Owner changed                   |
| `MEMBERSHIP_CHANGE` | Drive membership    | Drive.Change shared drive membership  |

#### Communication

| Category             | Description           | Google Mappings      |
| -------------------- | --------------------- | -------------------- |
| `MESSAGE_SEND`       | Sending message/email | Mail.Send            |
| `MESSAGE_RECEIVE`    | Receiving             | Mail.Receive         |
| `MESSAGE_VIEW`       | Opening/viewing       | Mail.View, Mail.Open |
| `MESSAGE_DRAFT`      | Creating draft        | Mail.Draft           |
| `MESSAGE_LINK_CLICK` | Clicking link         | Mail.Link click      |

#### Task Operations

| Category           | Description   | Google Mappings               |
| ------------------ | ------------- | ----------------------------- |
| `TASK_CREATE`      | Creating task | Tasks.Task created            |
| `TASK_COMPLETE`    | Completing    | Tasks.Task completed          |
| `TASK_REOPEN`      | Uncompleting  | Tasks.Task uncompleted        |
| `TASK_ASSIGN`      | Assigning     | Tasks.Task assigned           |
| `TASK_MODIFY`      | Modifying     | Tasks.Task title/time changed |
| `TASK_DELETE`      | Deleting      | Tasks.Task deleted            |
| `TASK_LIST_CREATE` | Creating list | Tasks.Task list created       |

#### Other

| Category      | Description      | Google Mappings          |
| ------------- | ---------------- | ------------------------ |
| `COMMENT_ADD` | Adding comment   | Drive.Comment created    |
| `DEVICE_SYNC` | Device sync      | Device.Device sync event |
| `USER_LOGIN`  | Login event      | (future: Azure AD)       |
| `USER_LOGOUT` | Logout event     | (future: Azure AD)       |
| `OTHER`       | Unknown/unmapped | \*.Unknown               |

### Statistics

`GET /api/log/lines/statistics?companyId={uuid}` returns aggregated counts:

```json
{
  "totalCount": 15234,
  "countByEventCategory": {
    "DOCUMENT_EDIT": 5420,
    "DOCUMENT_VIEW": 3210,
    "MESSAGE_SEND": 2100,
    "TASK_CREATE": 890
  },
  "countByService": {
    "DRIVE": 8630,
    "MAIL": 4200,
    "TASKS": 1890,
    "DEVICE": 514
  },
  "countByPlatform": {
    "GOOGLE": 15234
  },
  "topEventCategories": [
    { "eventCategory": "DOCUMENT_EDIT", "count": 5420 },
    { "eventCategory": "DOCUMENT_VIEW", "count": 3210 },
    { "eventCategory": "MESSAGE_SEND", "count": 2100 }
  ],
  "topServices": [
    { "service": "DRIVE", "count": 8630 },
    { "service": "MAIL", "count": 4200 }
  ]
}
```

---

## Query Patterns

### Simple Queries

**Find all edits by a user:**

```http
GET /api/log/lines/by-actor?actor=john@acme.com
```

**Find all activity on a document:**

```http
GET /api/log/lines/by-resource-id?resourceId=1abc123def456
```

**Find events in date range:**

```http
GET /api/log/lines/by-date-range?start=2024-12-01T00:00:00Z&end=2024-12-31T23:59:59Z
```

### Cross-Platform Queries

**Find ALL document edits (any platform):**

```http
GET /api/log/lines/by-event-category?eventCategory=DOCUMENT_EDIT
```

**Find all Google Drive activity:**

```http
GET /api/log/lines/by-platform-service?platform=GOOGLE&service=DRIVE
```

**Find all email operations:**

```http
GET /api/log/lines/by-service?service=MAIL
```

### Multi-Attribute Search

The most powerful endpoint for complex filtering with pagination:

```http
GET /api/log/lines/multi-attribute?platform=GOOGLE&eventCategory=DOCUMENT_EDIT&actor=john@acme.com&startDate=2024-12-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&page=0&size=50
```

**Available filters (all optional):**

| Parameter       | Type          | Description                         |
| --------------- | ------------- | ----------------------------------- |
| `platform`      | Platform      | GOOGLE, SLACK, MICROSOFT            |
| `service`       | String        | DRIVE, MAIL, TASKS, DEVICE          |
| `eventCategory` | EventCategory | DOCUMENT_EDIT, MESSAGE_SEND, etc.   |
| `event`         | String        | Service-specific: Edit, View, Send  |
| `actor`         | String        | Actor email                         |
| `owner`         | String        | Resource owner email                |
| `target`        | String        | Target email                        |
| `domain`        | String        | Domain filter                       |
| `resourceId`    | String        | Specific resource ID                |
| `resourceTitle` | String        | Partial title match                 |
| `startDate`     | ISO-8601      | Range start (inclusive)             |
| `endDate`       | ISO-8601      | Range end (inclusive)               |
| `page`          | Integer       | Page number (0-based, default: 0)   |
| `size`          | Integer       | Page size (default: 100, max: 1000) |

**Validation rules:**

- `page` must be >= 0
- `size` must be 1-1000
- `startDate` must be <= `endDate` (if both provided)

---

## Pagination

Multi-attribute search returns a Spring `Page` object:

```json
{
  "content": [
    /* LogLineDto[] */
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 50,
    "sort": {
      "sorted": true,
      "orders": [{ "property": "date", "direction": "DESC" }]
    }
  },
  "totalElements": 1523,
  "totalPages": 31,
  "first": true,
  "last": false,
  "numberOfElements": 50
}
```

**Pagination fields:**

| Field              | Description                          |
| ------------------ | ------------------------------------ |
| `content`          | Array of LogLineDto for current page |
| `totalElements`    | Total matching records               |
| `totalPages`       | Total pages available                |
| `first`            | Is this the first page?              |
| `last`             | Is this the last page?               |
| `numberOfElements` | Records in current page              |

**Frontend pagination example:**

```typescript
async function fetchLogLines(page: number, filters: LogLineFilters) {
  const params = new URLSearchParams({
    ...filters,
    page: String(page),
    size: '50',
  })

  const response = await fetch(`/api/log/lines/multi-attribute?${params}`)
  const data: Page<LogLineDto> = await response.json()

  return {
    items: data.content,
    totalPages: data.totalPages,
    currentPage: data.pageable.pageNumber,
    hasMore: !data.last,
  }
}
```

---

## Best Practices

### 1. Use EventCategory for Cross-Platform Features

```typescript
// BAD: Hardcoded to Google Drive
const edits = await fetch('/api/log/lines/by-event?event=Edit')

// GOOD: Works across all platforms
const edits = await fetch(
  '/api/log/lines/by-event-category?eventCategory=DOCUMENT_EDIT'
)
```

### 2. Prefer Multi-Attribute for Complex Filters

```typescript
// BAD: Multiple API calls, client-side filtering
const byActor = await fetch('/api/log/lines/by-actor?actor=john@acme.com')
const filtered = byActor.filter((l) => l.eventCategory === 'DOCUMENT_EDIT')

// GOOD: Single API call, server-side filtering
const edits = await fetch(
  '/api/log/lines/multi-attribute?actor=john@acme.com&eventCategory=DOCUMENT_EDIT'
)
```

### 3. Always Use Pagination for Large Datasets

```typescript
// BAD: Fetches all records (could be thousands)
const allLines = await fetch('/api/log/lines/by-platform?platform=GOOGLE')

// GOOD: Paginated fetch
const page1 = await fetch(
  '/api/log/lines/multi-attribute?platform=GOOGLE&page=0&size=100'
)
```

### 4. Use Statistics for Dashboards

```typescript
// For pie charts, counters, dashboards - use statistics endpoint
const stats = await fetch('/api/log/lines/statistics?companyId=xxx')

// Only fetch full records when user drills down
const driveEdits = await fetch(
  '/api/log/lines/multi-attribute?service=DRIVE&eventCategory=DOCUMENT_EDIT'
)
```

### 5. Cache Statistics, Refresh on Demand

Statistics don't change frequently. Cache them client-side:

```typescript
const STATS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

let statsCache: { data: LogLineStatisticsDto; timestamp: number } | null = null

async function getStatistics(companyId: string, forceRefresh = false) {
  if (
    !forceRefresh &&
    statsCache &&
    Date.now() - statsCache.timestamp < STATS_CACHE_TTL
  ) {
    return statsCache.data
  }

  const stats = await fetch(`/api/log/lines/statistics?companyId=${companyId}`)
  statsCache = { data: await stats.json(), timestamp: Date.now() }
  return statsCache.data
}
```

### 6. Handle Date Ranges Properly

```typescript
// Always use ISO-8601 format with timezone
const startDate = new Date('2024-12-01').toISOString() // "2024-12-01T00:00:00.000Z"
const endDate = new Date('2024-12-31T23:59:59').toISOString()

// For "today"
const today = new Date()
today.setHours(0, 0, 0, 0)
const startOfDay = today.toISOString()

today.setHours(23, 59, 59, 999)
const endOfDay = today.toISOString()
```

---

## TypeScript Interfaces

```typescript
// Platform enum
type Platform = 'GOOGLE' | 'SLACK' | 'MICROSOFT'

// EventCategory enum (30 values)
type EventCategory =
  // Document operations
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_EDIT'
  | 'DOCUMENT_CREATE'
  | 'DOCUMENT_DELETE'
  | 'DOCUMENT_COPY'
  | 'DOCUMENT_MOVE'
  | 'DOCUMENT_RENAME'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_SYNC'
  // Permission operations
  | 'PERMISSION_CHANGE'
  | 'OWNERSHIP_CHANGE'
  | 'MEMBERSHIP_CHANGE'
  // Communication
  | 'MESSAGE_SEND'
  | 'MESSAGE_RECEIVE'
  | 'MESSAGE_VIEW'
  | 'MESSAGE_DRAFT'
  | 'MESSAGE_LINK_CLICK'
  // Collaboration
  | 'COMMENT_ADD'
  // Tasks
  | 'TASK_CREATE'
  | 'TASK_COMPLETE'
  | 'TASK_REOPEN'
  | 'TASK_ASSIGN'
  | 'TASK_MODIFY'
  | 'TASK_DELETE'
  | 'TASK_LIST_CREATE'
  // Security/Device
  | 'DEVICE_SYNC'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  // Catch-all
  | 'OTHER'

// LogLine DTO
interface LogLineDto {
  id: string
  logId: string

  platform: Platform
  service: string

  eventCategory: EventCategory
  event: string

  date: string // ISO-8601

  actor: string | null
  owner: string | null
  target: string | null
  domain: string | null
  ipAddress: string | null

  resourceId: string | null
  resourceTitle: string | null
  resourceType: string | null
  visibility: string | null

  metadata: Record<string, unknown> | null

  actorEmployeeId: string | null
  ownerEmployeeId: string | null
  targetEmployeeId: string | null

  lineNumber: number | null
  rawCsvLine: string | null
  createdAt: string
}

// Multi-attribute search request
interface GetMultiAttributeRequest {
  platform?: Platform
  service?: string
  eventCategory?: EventCategory
  event?: string
  actor?: string
  owner?: string
  target?: string
  domain?: string
  resourceId?: string
  resourceTitle?: string
  startDate?: string // ISO-8601
  endDate?: string // ISO-8601
  page?: number // 0-based, default 0
  size?: number // 1-1000, default 100
}

// Paginated response
interface Page<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      orders: Array<{ property: string; direction: 'ASC' | 'DESC' }>
    }
  }
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  numberOfElements: number
}

// Statistics response
interface LogLineStatisticsDto {
  totalCount: number
  countByEventCategory: Record<EventCategory, number>
  countByService: Record<string, number>
  countByPlatform: Record<Platform, number>
  topEventCategories: Array<{ eventCategory: EventCategory; count: number }>
  topServices: Array<{ service: string; count: number }>
}
```

---

## Code Examples

### React: LogLine Table with Filters

```tsx
import React, { useState, useEffect } from 'react'

interface Filters {
  platform?: Platform
  eventCategory?: EventCategory
  actor?: string
  startDate?: string
  endDate?: string
}

function LogLineTable({ companyId }: { companyId: string }) {
  const [logLines, setLogLines] = useState<LogLineDto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogLines()
  }, [page, filters])

  async function fetchLogLines() {
    setLoading(true)

    const params = new URLSearchParams()
    if (filters.platform) params.set('platform', filters.platform)
    if (filters.eventCategory)
      params.set('eventCategory', filters.eventCategory)
    if (filters.actor) params.set('actor', filters.actor)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    params.set('page', String(page))
    params.set('size', '50')

    try {
      const response = await fetch(`/api/log/lines/multi-attribute?${params}`)
      const data: Page<LogLineDto> = await response.json()

      setLogLines(data.content)
      setTotalPages(data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="filters">
        <select
          value={filters.platform || ''}
          onChange={(e) =>
            setFilters({ ...filters, platform: e.target.value as Platform })
          }
        >
          <option value="">All Platforms</option>
          <option value="GOOGLE">Google Workspace</option>
          <option value="SLACK">Slack</option>
          <option value="MICROSOFT">Microsoft 365</option>
        </select>

        <select
          value={filters.eventCategory || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              eventCategory: e.target.value as EventCategory,
            })
          }
        >
          <option value="">All Events</option>
          <option value="DOCUMENT_EDIT">Document Edit</option>
          <option value="DOCUMENT_VIEW">Document View</option>
          <option value="MESSAGE_SEND">Message Send</option>
          {/* ... more options */}
        </select>

        <input
          type="text"
          placeholder="Actor email"
          value={filters.actor || ''}
          onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
        />
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Platform</th>
            <th>Event</th>
            <th>Actor</th>
            <th>Resource</th>
          </tr>
        </thead>
        <tbody>
          {logLines.map((line) => (
            <tr key={line.id}>
              <td>{new Date(line.date).toLocaleString()}</td>
              <td>
                {line.platform} / {line.service}
              </td>
              <td>{line.eventCategory}</td>
              <td>{line.actor}</td>
              <td>{line.resourceTitle || line.resourceId}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

### React: Activity Dashboard with Statistics

```tsx
import React, { useState, useEffect } from 'react'
import { PieChart, BarChart } from 'your-chart-library'

function ActivityDashboard({ companyId }: { companyId: string }) {
  const [stats, setStats] = useState<LogLineStatisticsDto | null>(null)

  useEffect(() => {
    fetch(`/api/log/lines/statistics?companyId=${companyId}`)
      .then((res) => res.json())
      .then(setStats)
  }, [companyId])

  if (!stats) return <div>Loading...</div>

  const categoryData = Object.entries(stats.countByEventCategory).map(
    ([category, count]) => ({
      name: category.replace('_', ' '),
      value: count,
    })
  )

  const serviceData = Object.entries(stats.countByService).map(
    ([service, count]) => ({
      name: service,
      value: count,
    })
  )

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Total Log Lines</h3>
        <span className="big-number">{stats.totalCount.toLocaleString()}</span>
      </div>

      <div className="chart-container">
        <h3>Activity by Category</h3>
        <PieChart data={categoryData} />
      </div>

      <div className="chart-container">
        <h3>Activity by Service</h3>
        <BarChart data={serviceData} />
      </div>

      <div className="top-lists">
        <div>
          <h4>Top Event Categories</h4>
          <ol>
            {stats.topEventCategories.map(({ eventCategory, count }) => (
              <li key={eventCategory}>
                {eventCategory}: {count.toLocaleString()}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
```

### Vue 3: Resource Timeline

```vue
<template>
  <div class="resource-timeline">
    <h2>Activity on: {{ resourceTitle }}</h2>

    <div class="timeline">
      <div v-for="event in timeline" :key="event.id" class="timeline-event">
        <div class="event-time">{{ formatDate(event.date) }}</div>
        <div class="event-icon" :class="getEventClass(event.eventCategory)">
          {{ getEventIcon(event.eventCategory) }}
        </div>
        <div class="event-details">
          <strong>{{ event.event }}</strong> by {{ event.actor }}
          <div class="event-meta">
            {{ event.platform }} / {{ event.service }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  resourceId: string
  resourceTitle: string
}>()

const timeline = ref<LogLineDto[]>([])

onMounted(async () => {
  const response = await fetch(
    `/api/log/lines/by-resource-id?resourceId=${props.resourceId}`
  )
  timeline.value = await response.json()
})

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function getEventClass(category: EventCategory): string {
  if (category.startsWith('DOCUMENT_')) return 'document-event'
  if (category.startsWith('MESSAGE_')) return 'message-event'
  if (category.startsWith('TASK_')) return 'task-event'
  return 'other-event'
}

function getEventIcon(category: EventCategory): string {
  const icons: Record<string, string> = {
    DOCUMENT_EDIT: 'pencil',
    DOCUMENT_VIEW: 'eye',
    DOCUMENT_CREATE: 'plus',
    DOCUMENT_DELETE: 'trash',
    MESSAGE_SEND: 'send',
    // ... etc
  }
  return icons[category] || 'circle'
}
</script>
```

---

## Performance Considerations

### Query Performance by Endpoint

| Endpoint             | Performance | Notes                                |
| -------------------- | ----------- | ------------------------------------ |
| `/by-platform`       | Fast        | Indexed column                       |
| `/by-service`        | Fast        | Indexed column                       |
| `/by-event-category` | Fast        | Indexed column                       |
| `/by-resource-id`    | Fast        | Indexed column                       |
| `/by-actor`          | Fast        | Indexed column                       |
| `/by-resource-title` | Slow        | Uses LIKE %pattern% (full scan)      |
| `/multi-attribute`   | Varies      | Uses composite indexes when possible |
| `/statistics`        | Medium      | Aggregation queries                  |

### Optimization Tips

1. **Avoid `/by-resource-title` for large datasets** - Use `/by-resource-id` when possible
2. **Add date range to broad queries** - Limits scan scope
3. **Use statistics for counts** - Don't fetch all records just to count
4. **Limit page size** - Max 1000, but 50-100 is recommended

### Expected Response Times (1M+ records)

| Query Type                    | Expected Time |
| ----------------------------- | ------------- |
| Single indexed field          | < 50ms        |
| Multi-attribute (2-3 filters) | < 100ms       |
| Multi-attribute (5+ filters)  | < 200ms       |
| Statistics aggregation        | < 500ms       |
| Title search (LIKE)           | 1-5 seconds   |

---

## Troubleshooting

### Common Issues

**Q: Getting empty results when filtering by EventCategory?**

- Ensure you're using exact enum values: `DOCUMENT_EDIT` not `document_edit`
- Check that logs have been parsed (CSV files uploaded and processed)

**Q: Date range not working?**

- Use ISO-8601 format: `2024-12-01T00:00:00Z`
- Ensure startDate <= endDate (validation will reject otherwise)

**Q: Pagination returning wrong page?**

- Pages are 0-indexed (page=0 is first page)
- Check `totalPages` before requesting higher page numbers

**Q: Getting 400 Bad Request on multi-attribute?**

- Check pagination constraints: page >= 0, 1 <= size <= 1000
- Check date range validity
- Verify enum values are correct case

### Error Responses

| Status | Meaning       | Common Cause                                   |
| ------ | ------------- | ---------------------------------------------- |
| `400`  | Bad Request   | Invalid filter values, pagination out of range |
| `404`  | Not Found     | Invalid logId in path                          |
| `422`  | Unprocessable | Date range validation failed                   |
| `500`  | Server Error  | Contact backend team                           |

### Debugging

Enable request logging in browser DevTools:

- Network tab > filter by `/api/log`
- Check request URL parameters
- Inspect response body for error details

---

## Changelog

| Version | Date    | Changes                                            |
| ------- | ------- | -------------------------------------------------- |
| 2.0     | 2024-01 | Added Platform, Service, EventCategory filtering   |
| 2.0     | 2024-01 | Added Resource queries (resourceId, resourceTitle) |
| 2.0     | 2024-01 | Added multi-attribute search with pagination       |
| 2.0     | 2024-01 | Added statistics endpoint                          |
| 1.0     | 2023-11 | Initial LogLine query endpoints                    |
