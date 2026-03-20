# Frontend Developer Guide: SOP DAG API

A comprehensive guide for frontend developers working with the Standard Operating Procedure (SOP) Directed Acyclic Graph (DAG) API.

## Table of Contents

1. [Introduction](#introduction)
2. [API Quick Reference](#api-quick-reference)
3. [Data Model](#data-model)
   - [SopDto](#sopdto-sop-response)
   - [StepDto](#stepdto-node)
   - [EdgeDto](#edgedto)
   - [SopTraceDto vs SopDto](#soptracedto-vs-sopdto-trace-response)
   - [StepTraceDto](#steptracedto-enriched-step)
   - [LogMatchDto](#logmatchdto-log-source-context)
   - [Step and Edge Timing](#step-and-edge-timing)
4. [Common Operations](#common-operations)
5. [Validation Status & Analysis Blocking](#validation-status--analysis-blocking)
6. [Query Patterns & Performance](#query-patterns--performance)
7. [Best Practices](#best-practices)
8. [Validation Reference](#validation-reference)
9. [TypeScript Interfaces](#typescript-interfaces)
10. [Code Examples](#code-examples)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

SOPs in this system are represented as **Directed Acyclic Graphs (DAGs)** where:

- **Nodes** = Steps in the procedure
- **Edges** = Dependencies between steps (directed: from predecessor to successor)

### Key Concepts

| Concept        | Description                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| **START node** | Entry point of the workflow. Must have no predecessors. Only one allowed per SOP. |
| **STEP node**  | Intermediate step. Must have at least one predecessor and one successor.          |
| **END node**   | Terminal step. Must have no successors. Multiple END nodes are allowed.           |
| **Fork**       | A step with multiple successors (parallel paths begin here)                       |
| **Join**       | A step with multiple predecessors (parallel paths converge here)                  |

### OpenAPI Specification

For complete request/response schemas, see the OpenAPI spec:

- **Location:** [`../postman/openapi.json`](../postman/openapi.json)
- **Postman Collection:** [`../postman/postman-collection.json`](../postman/postman-collection.json)

---

## API Quick Reference

All DAG endpoints are under `/api/sop`.

| Method   | Endpoint                                      | Description                                            | Returns                  |
| -------- | --------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| `GET`    | `/{sopId}`                                    | Fetch SOP with all steps, edges, and validation status | `SopDto`                 |
| `PUT`    | `/{id}`                                       | Update SOP (returns validation status)                 | `SopDto`                 |
| `POST`   | `/{sopId}/steps`                              | Create a new step                                      | `StepDto`                |
| `DELETE` | `/{sopId}/steps/{stepId}`                     | Delete a step (cleans up edges)                        | `void`                   |
| `POST`   | `/{sopId}/edges`                              | Create edge between two steps                          | `CreateEdgeResponseDto`  |
| `DELETE` | `/{sopId}/edges/{edgeId}`                     | Remove an edge                                         | `DagValidationResultDto` |
| `PUT`    | `/{sopId}/steps/{stepId}/node-type?nodeType=` | Change step's node type                                | `StepDto`                |
| `GET`    | `/{sopId}/validate`                           | Validate DAG structure                                 | `DagValidationResultDto` |
| `POST`   | `/{sopId}/migrate-to-dag`                     | Convert legacy SOP to DAG format                       | `DagValidationResultDto` |

### Analysis Endpoints (Require Valid DAG)

| Method | Endpoint                                         | Description                              | Returns                                  |
| ------ | ------------------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| `POST` | `/analyze/{id}`                                  | AI analysis (sync)                       | `SopAnalysisDto` or `422`                |
| `POST` | `/analyze/{id}/async`                            | AI analysis (async)                      | `AsyncAnalysisResponseDto` or `422`      |
| `POST` | `/analysis/trace-sop-steps`                      | Trace SOP with events (sync)             | `SopTraceDto` or `422`                   |
| `POST` | `/analysis/trace-sop-steps/async`                | Trace SOP (async)                        | `TraceSopStepsAsyncResponseDto` or `422` |
| `GET`  | `/analysis/trace-sop-steps/async/result`         | Get async step result                    | `StepTraceAsyncResultDto`                |
| `GET`  | `/analysis/trace-sop-steps/async/logline-result` | Get async logline result                 | `LogLineMatchingAsyncResultDto`          |
| `GET`  | `/analysis/trace-sop-steps/async/aggregate`      | Aggregate async results with edge timing | `AsyncTraceAggregateResultDto`           |

**Note:** Analysis endpoints return `422 Unprocessable Entity` if the DAG has validation errors.

---

## Data Model

### SopDto (SOP Response)

A single `GET /api/sop/{id}` returns the complete graph with validation status:

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "companyName": "Acme Corp",
  "sopName": "Employee Onboarding",
  "basicDescription": "New hire process",
  "createdAt": "2025-01-15T10:30:00Z",
  "steps": [
    /* StepDto[] */
  ],
  "edges": [
    /* EdgeDto[] */
  ],
  "sopFile": {
    /* SopFileDto */
  },
  "analysisTaskId": null,
  "dagValid": true,
  "lastValidatedAt": "2025-01-15T10:35:00Z",
  "validationErrors": [],
  "validationWarnings": [
    {
      "code": "NO_END_NODE",
      "message": "No END node found. Mark terminal steps as END.",
      "affectedNodeIds": []
    }
  ]
}
```

**Key insights:**

- Both `steps` and `edges` are returned in a single response. No separate fetch needed.
- `dagValid` indicates if the DAG can be used for analysis (errors block, warnings don't).
- `validationErrors` and `validationWarnings` are computed on fetch.
- `lastValidatedAt` shows when the DAG was last validated.

### StepDto (Node)

```json
{
  "id": "uuid",
  "name": "Verify Documents",
  "details": "Check all required documents...",
  "postStepDocumentation": "Log verification result",
  "monitoringRequirements": "Supervisor review required",
  "actorRoleTitle": "HR_MANAGER",
  "nodeType": "STEP",
  "isFork": false,
  "isJoin": true,
  "matchingEmployeesForRoleTitle": [
    /* EmployeeDto[] */
  ]
}
```

| Field                           | Type    | Description                    |
| ------------------------------- | ------- | ------------------------------ |
| `id`                            | UUID    | Step identifier                |
| `name`                          | string  | Step title (max 200 chars)     |
| `details`                       | string  | Full instructions              |
| `nodeType`                      | enum    | `START`, `STEP`, or `END`      |
| `isFork`                        | boolean | Has multiple outgoing edges    |
| `isJoin`                        | boolean | Has multiple incoming edges    |
| `actorRoleTitle`                | enum    | Role responsible for execution |
| `matchingEmployeesForRoleTitle` | array   | Employees with that role       |

### EdgeDto

```json
{
  "id": "uuid",
  "from": "step-uuid-1",
  "to": "step-uuid-2",
  "transitionDuration": "PT4M30S"
}
```

| Field                | Type     | Description                                  |
| -------------------- | -------- | -------------------------------------------- |
| `id`                 | UUID     | Edge identifier (for deletion)               |
| `from`               | UUID     | Source step ID (predecessor)                 |
| `to`                 | UUID     | Target step ID (successor)                   |
| `transitionDuration` | Duration | Time between steps (only in trace responses) |

**Note:** `transitionDuration` is only populated in `SopTraceDto` responses (from `traceSopSteps`). It represents the time from the last log of the source step to the first log of the target step. See [Step and Edge Timing](#step-and-edge-timing) for details.

### DagValidationResultDto

```json
{
  "valid": true,
  "warnings": [
    {
      "code": "DANGLING_NODE",
      "message": "Node 'Review' has no successors but is not marked as END",
      "nodeId": "uuid",
      "nodeName": "Review"
    }
  ],
  "errors": [
    {
      "code": "CYCLE_DETECTED",
      "message": "Adding this edge would create a cycle",
      "affectedNodeIds": ["uuid-1", "uuid-2"]
    }
  ]
}
```

**Rule:** `valid: true` means no errors (warnings are OK). `valid: false` means structural problems exist.

### SopTraceDto vs SopDto (Trace Response)

The `traceSopSteps` endpoint returns `SopTraceDto`, which extends the standard `SopDto` structure with trace enrichment data embedded directly in each step. This eliminates the need for a separate step traces array.

#### Key Differences

| Aspect           | `SopDto` (Standard)            | `SopTraceDto` (Trace)             |
| ---------------- | ------------------------------ | --------------------------------- |
| Steps type       | `StepDto[]`                    | `StepTraceDto[]`                  |
| Activity events  | Not included                   | Embedded in each step             |
| Log line matches | Not included                   | Embedded in activity events       |
| Use case         | DAG editing, structure display | Compliance analysis, audit trails |

#### SopTraceDto Structure

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "companyName": "Acme Corp",
  "sopName": "Employee Onboarding",
  "basicDescription": "New hire process",
  "createdAt": "2025-01-15T10:30:00Z",
  "dagValid": true,
  "lastValidatedAt": "2025-01-15T10:35:00Z",
  "validationErrors": [],
  "validationWarnings": [],
  "analysisTaskId": "uuid",
  "sopFile": {
    /* SopFileDto */
  },
  "geminiResponseFiles": [
    /* GeminiResponseFileDto[] */
  ],
  "steps": [
    /* StepTraceDto[] - enriched steps */
  ],
  "edges": [
    /* EdgeDto[] */
  ]
}
```

**Key insight:** `SopTraceDto` has the same top-level structure as `SopDto`, but uses `StepTraceDto` instead of `StepDto` for steps. This means the same graph rendering logic works for both.

### StepTraceDto (Enriched Step)

Each step in the trace response includes all standard step fields plus trace enrichment and timing metadata:

```json
{
  "id": "uuid",
  "name": "Verify Documents",
  "details": "Check all required documents...",
  "postStepDocumentation": "Log verification result",
  "monitoringRequirements": "Supervisor review required",
  "actorRoleTitle": "HR_MANAGER",
  "nodeType": "STEP",
  "isFork": false,
  "isJoin": true,
  "matchingEmployeesForRoleTitle": [
    /* EmployeeDto[] */
  ],
  "firstLogTimestamp": "2025-01-15T09:00:00Z",
  "lastLogTimestamp": "2025-01-15T09:15:30Z",
  "stepDuration": "PT15M30S",
  "matchingActivityEvents": [
    {
      "activityEvent": {
        /* ActivityEventDto */
      },
      "logLineTrace": {
        "matchingLogs": [
          {
            "logId": "uuid",
            "logName": "Drive Audit Log",
            "loggingSource": "GOOGLE_DRIVE",
            "matchingLogLines": [
              /* LogLineDto[] */
            ],
            "matchCount": 15
          }
        ]
      }
    }
  ]
}
```

| Field                          | Type     | Description                                            |
| ------------------------------ | -------- | ------------------------------------------------------ |
| _All StepDto fields_           | -        | Standard step properties (id, name, nodeType, etc.)    |
| `firstLogTimestamp`            | Instant  | Earliest log line timestamp across all activity events |
| `lastLogTimestamp`             | Instant  | Latest log line timestamp across all activity events   |
| `stepDuration`                 | Duration | Time between first and last log (ISO-8601 format)      |
| `matchingActivityEvents`       | array    | Activity events matched to this step by AI             |
| Each event's `logLineTrace`    | object   | Log lines matching the activity event                  |
| `matchingLogs[].logName`       | string   | Human-readable log source name                         |
| `matchingLogs[].loggingSource` | enum     | `GOOGLE_DRIVE`, `GOOGLE_MAIL`, `GOOGLE_TASKS`, etc.    |
| `matchingLogs[].matchCount`    | number   | Count of matching log lines                            |

**Timing fields** are `null` when no matching log lines exist for the step. See [Step and Edge Timing](#step-and-edge-timing) for computation details.

### LogMatchDto (Log Source Context)

Each log source in the trace includes full context:

```json
{
  "logId": "uuid",
  "logName": "Q4 Drive Activity",
  "loggingSource": "GOOGLE_DRIVE",
  "matchingLogLines": [
    {
      "logLineType": "GOOGLE_DRIVE",
      "id": "uuid",
      "logId": "parent-log-uuid",
      "date": "2025-01-15T09:30:00Z",
      "eventType": "view",
      "actor": "john@company.com",
      "owner": "jane@company.com",
      "target": "onboarding-checklist.docx",
      "domain": "company.com",
      "ipAddress": "192.168.1.1",
      "event": "view",
      "documentId": "abc123",
      "title": "Onboarding Checklist",
      "documentType": "DOCUMENT"
    }
  ],
  "matchCount": 1
}
```

**Note:** The `logLineType` field is a Jackson discriminator that indicates the subclass type. Additional fields vary by type (e.g., `event`, `documentId`, `title` for Google Drive).

### Step and Edge Timing

Trace responses include timing metadata computed from log line timestamps. This enables workflow duration analysis and bottleneck identification.

#### How Timing is Computed

**Step Timing** is derived from all log lines across all matching activity events for a step:

```
Step A
├── ActivityEvent 1
│   └── LogLines: [2025-01-15T09:00:00Z, 2025-01-15T09:05:00Z]
└── ActivityEvent 2
    └── LogLines: [2025-01-15T09:03:00Z, 2025-01-15T09:15:30Z]

Result:
  firstLogTimestamp = 2025-01-15T09:00:00Z  (earliest across all)
  lastLogTimestamp  = 2025-01-15T09:15:30Z  (latest across all)
  stepDuration      = PT15M30S              (15 minutes 30 seconds)
```

**Edge Transition Time** is computed from adjacent steps:

```
Step A (lastLogTimestamp: 09:15:30) ──edge──> Step B (firstLogTimestamp: 09:20:00)

Result:
  edge.transitionDuration = PT4M30S  (4 minutes 30 seconds)
```

#### Duration Format (ISO-8601)

Java `Duration` serializes to ISO-8601 format:

| Example    | Meaning                                |
| ---------- | -------------------------------------- |
| `PT15M30S` | 15 minutes 30 seconds                  |
| `PT1H`     | 1 hour                                 |
| `PT2H30M`  | 2 hours 30 minutes                     |
| `PT0S`     | Zero (single log line)                 |
| `PT-5M`    | Negative 5 minutes (overlapping steps) |

#### Edge Cases

| Scenario                | Step Timing                  | Edge Timing                    |
| ----------------------- | ---------------------------- | ------------------------------ |
| No matching logs        | All timing fields are `null` | `transitionDuration` is `null` |
| Single log line         | `stepDuration = PT0S`        | Normal calculation             |
| Source step has no logs | N/A                          | `transitionDuration` is `null` |
| Target step has no logs | N/A                          | `transitionDuration` is `null` |
| Overlapping execution   | Normal calculation           | Negative duration possible     |

**Negative transition times** can occur when steps execute in parallel (fork/join patterns) or when log timestamps overlap. This is valid data - the UI should interpret it as concurrent execution.

#### JSON Response Example

```json
{
  "steps": [
    {
      "id": "step-1-uuid",
      "name": "Review Document",
      "firstLogTimestamp": "2025-01-15T09:00:00Z",
      "lastLogTimestamp": "2025-01-15T09:15:30Z",
      "stepDuration": "PT15M30S",
      "matchingActivityEvents": [...]
    },
    {
      "id": "step-2-uuid",
      "name": "Approve Document",
      "firstLogTimestamp": "2025-01-15T09:20:00Z",
      "lastLogTimestamp": "2025-01-15T09:25:00Z",
      "stepDuration": "PT5M",
      "matchingActivityEvents": [...]
    }
  ],
  "edges": [
    {
      "id": "edge-uuid",
      "from": "step-1-uuid",
      "to": "step-2-uuid",
      "transitionDuration": "PT4M30S"
    }
  ]
}
```

#### Parsing Durations in TypeScript

```typescript
// Parse ISO-8601 duration to milliseconds
function parseDuration(iso8601: string | null): number | null {
  if (!iso8601) return null

  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/)
  if (!match) return null

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseFloat(match[3] || '0')

  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

// Format duration for display
function formatDuration(iso8601: string | null): string {
  const ms = parseDuration(iso8601)
  if (ms === null) return 'N/A'

  const totalSeconds = Math.abs(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const sign = ms < 0 ? '-' : ''

  if (hours > 0) return `${sign}${hours}h ${minutes}m`
  if (minutes > 0) return `${sign}${minutes}m ${seconds}s`
  return `${sign}${seconds}s`
}

// Usage
formatDuration('PT15M30S') // "15m 30s"
formatDuration('PT1H') // "1h 0m"
formatDuration('PT-5M') // "-5m 0s" (overlapping steps)
```

#### Displaying Step Timing

```typescript
function StepTimingInfo({ step }: { step: StepTraceDto }) {
  if (!step.firstLogTimestamp || !step.lastLogTimestamp) {
    return <span className="muted">No timing data</span>;
  }

  return (
    <div className="timing-info">
      <div>
        <Label>First Activity:</Label>
        <Time>{formatTimestamp(step.firstLogTimestamp)}</Time>
      </div>
      <div>
        <Label>Last Activity:</Label>
        <Time>{formatTimestamp(step.lastLogTimestamp)}</Time>
      </div>
      <div>
        <Label>Duration:</Label>
        <Duration>{formatDuration(step.stepDuration)}</Duration>
      </div>
    </div>
  );
}
```

#### Displaying Edge Transitions

```typescript
function EdgeTransitionInfo({
  edge,
  fromStep,
  toStep
}: {
  edge: EdgeDto;
  fromStep: StepTraceDto;
  toStep: StepTraceDto;
}) {
  if (!edge.transitionDuration) {
    return <span className="muted">No transition data</span>;
  }

  const durationMs = parseDuration(edge.transitionDuration);
  const isNegative = durationMs !== null && durationMs < 0;

  return (
    <div className={`transition ${isNegative ? 'concurrent' : ''}`}>
      <span>{fromStep.name}</span>
      <Arrow />
      <span>{toStep.name}</span>
      <Duration negative={isNegative}>
        {formatDuration(edge.transitionDuration)}
        {isNegative && <Tooltip>Steps executed concurrently</Tooltip>}
      </Duration>
    </div>
  );
}
```

### Using Trace Response for Compliance Display

```typescript
// Render step with compliance information
function StepComplianceCard({ step }: { step: StepTraceDto }) {
  const totalLogMatches = step.matchingActivityEvents.reduce(
    (sum, ae) => sum + ae.logLineTrace.matchingLogs.reduce(
      (logSum, log) => logSum + log.matchCount, 0
    ), 0
  );

  return (
    <Card>
      <Header>
        {step.nodeType === 'START' && <Badge color="green">START</Badge>}
        {step.nodeType === 'END' && <Badge color="red">END</Badge>}
        {step.isFork && <Badge color="purple">FORK</Badge>}
        {step.isJoin && <Badge color="purple">JOIN</Badge>}
        <Title>{step.name}</Title>
      </Header>

      <Info>
        <Role>{step.actorRoleTitle}</Role>
        <EmployeeCount>
          {step.matchingEmployeesForRoleTitle?.length || 0} employees
        </EmployeeCount>
      </Info>

      {step.matchingActivityEvents.length > 0 ? (
        <ActivityList>
          <Label>
            {step.matchingActivityEvents.length} Activity Events
            ({totalLogMatches} log matches)
          </Label>
          {step.matchingActivityEvents.map(ae => (
            <ActivityEventItem
              key={ae.activityEvent.id}
              event={ae}
            />
          ))}
        </ActivityList>
      ) : (
        <NoData>No matching activity events</NoData>
      )}
    </Card>
  );
}

// Display activity event with log sources
function ActivityEventItem({ event }: { event: ActivityEventTraceDto }) {
  return (
    <div>
      <EventName>{event.activityEvent.name}</EventName>
      {event.logLineTrace.matchingLogs.map(log => (
        <LogSource key={log.logId}>
          <Icon source={log.loggingSource} />
          <span>{log.logName}</span>
          <Badge>{log.matchCount} lines</Badge>
        </LogSource>
      ))}
    </div>
  );
}
```

### Async Trace Workflow

For large SOPs, use the async endpoint to avoid timeouts:

```typescript
// 1. Start async trace
const asyncResponse = await fetch('/api/analysis/trace-sop-steps/async', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyId, sopId }),
})
const { correlationId, stepTaskMap } = await asyncResponse.json()

// 2. Poll for each step's result (for progress display)
async function pollStepResult(
  sopId: string,
  stepId: string,
  taskId: string
): Promise<StepTraceDto> {
  while (true) {
    const result = await fetch(
      `/api/analysis/trace-sop-steps/async/result?sopId=${sopId}&stepId=${stepId}&taskId=${taskId}`
    ).then((r) => r.json())

    if (result.status === 'COMPLETED') {
      return result.stepTrace // StepTraceDto with step timing
    }
    if (result.status === 'FAILED') {
      throw new Error(result.message)
    }
    await sleep(1000)
  }
}

// 3. Get complete SopTraceDto with edge timing via aggregation endpoint
async function getAggregatedTrace(
  correlationId: string,
  sopId: string
): Promise<SopTraceDto | null> {
  const result = await fetch(
    `/api/analysis/trace-sop-steps/async/aggregate?correlationId=${correlationId}&sopId=${sopId}`
  ).then((r) => r.json())

  if (result.allComplete && result.sopTrace) {
    return result.sopTrace // Complete SopTraceDto with edge transitionDuration
  }
  if (result.failedTasks > 0) {
    throw new Error(`${result.failedTasks} tasks failed`)
  }
  return null // Still processing
}

// Recommended workflow:
// 1. Poll individual steps for progress display
// 2. Once all complete, use aggregate endpoint for final result with edge timing
const enrichedSteps = await Promise.all(
  Object.entries(stepTaskMap).map(([stepId, taskId]) =>
    pollStepResult(sopId, stepId, taskId as string)
  )
)

// Get complete trace with edge transitions
const completeTrace = await getAggregatedTrace(correlationId, sopId)
```

#### Sync vs Async: Edge Timing Differences

| Aspect                    | Sync (`/trace-sop-steps`) | Async (individual results) | Async (aggregate)             |
| ------------------------- | ------------------------- | -------------------------- | ----------------------------- |
| Step timing               | ✅ Included               | ✅ Included                | ✅ Included                   |
| Edge `transitionDuration` | ✅ Calculated server-side | ❌ Not available           | ✅ Calculated server-side     |
| Use case                  | Small SOPs                | Progress display           | Final result with edge timing |

**Recommendation:** Use the aggregate endpoint after all tasks complete to get the full `SopTraceDto` with edge timing, matching the sync endpoint's response format.

---

## Common Operations

### Fetching an SOP with Graph Data

```http
GET /api/sop/{sopId}
```

**Response includes:**

- All steps with their `nodeType`, `isFork`, `isJoin` flags
- All edges connecting steps
- No separate call needed for edges

**DB Load:** 2-3 queries

---

### Adding an Edge

```http
POST /api/sop/{sopId}/edges
Content-Type: application/json

{
  "fromStepId": "uuid-source",
  "toStepId": "uuid-target"
}
```

**Response (201 Created):**

```json
{
  "edge": {
    "id": "new-edge-uuid",
    "from": "uuid-source",
    "to": "uuid-target"
  },
  "validation": {
    "valid": true,
    "warnings": [],
    "errors": []
  }
}
```

**Cycle Detection:** If adding this edge would create a cycle, the request fails with `400 Bad Request`. The edge is NOT saved.

**DB Load:** 7-10 queries (includes full validation)

---

### Removing an Edge

```http
DELETE /api/sop/{sopId}/edges/{edgeId}
```

**Response (200 OK):** Returns `DagValidationResultDto` with post-removal validation.

**DB Load:** 5-7 queries

---

### Creating a New Step

```http
POST /api/sop/{sopId}/steps
Content-Type: application/json

{
  "name": "Review Documents",
  "details": "Verify all submitted documents are complete",
  "nodeType": "STEP",
  "actorRoleTitle": "HR_MANAGER"
}
```

**Response (201 Created):** Returns the created `StepDto`.

**Workflow:** Create step first, then connect it to the DAG via edge operations.

**DB Load:** 3-5 queries

---

### Deleting a Step

```http
DELETE /api/sop/{sopId}/steps/{stepId}
```

**Response (204 No Content)**

**Important:** This automatically:

- Removes all edges connected to this step
- Updates both edge representations (embedded arrays + edge table)
- Re-validates the DAG and persists status

**DB Load:** 6-10 queries

---

### Updating Node Type

```http
PUT /api/sop/{sopId}/steps/{stepId}/node-type?nodeType=END
```

**Valid values:** `START`, `STEP`, `END`

**Validation Rules:**

- Cannot set `START` if step has predecessors
- Cannot set `END` if step has successors
- Only one `START` node allowed per SOP

**Response (200 OK):** Updated `StepDto`

**DB Load:** 3-4 queries

---

### Validating the DAG

```http
GET /api/sop/{sopId}/validate
```

**When to use:**

- On page load to show current state
- **NOT** after add/remove edge (those responses include validation)

**DB Load:** 1 query + O(V+E) in-memory processing

---

## Validation Status & Analysis Blocking

### Understanding Validation State

Every SOP has persistent validation status:

| Field                | Type          | Description                    |
| -------------------- | ------------- | ------------------------------ |
| `dagValid`           | boolean       | `true` if no structural errors |
| `lastValidatedAt`    | ISO timestamp | When last validated            |
| `validationErrors`   | array         | Errors that block analysis     |
| `validationWarnings` | array         | Informational warnings         |

**Key Rule:** Only `errors` block analysis. Warnings are informational and do not prevent operations.

### When Validation Runs

Validation runs automatically and persists status after:

- Creating a step (`POST /{sopId}/steps`)
- Deleting a step (`DELETE /{sopId}/steps/{stepId}`)
- Adding an edge (`POST /{sopId}/edges`)
- Removing an edge (`DELETE /{sopId}/edges/{edgeId}`)
- Changing node type (`PUT /{sopId}/steps/{stepId}/node-type`)

You don't need to call `GET /{sopId}/validate` separately - just use the response from mutations.

### Analysis Blocking

Analysis operations require a valid DAG (`dagValid: true`):

```http
POST /api/sop/process/{id}
```

**If DAG is valid:** Analysis proceeds normally.

**If DAG has errors (422 Unprocessable Entity):**

```json
{
  "error": "INVALID_DAG_FOR_ANALYSIS",
  "message": "Cannot perform analysis on SOP ... - DAG is invalid. Please fix validation errors first.",
  "validation": {
    "valid": false,
    "errors": [
      {
        "code": "NO_START_NODE",
        "message": "No START node found",
        "affectedNodeIds": []
      }
    ],
    "warnings": []
  },
  "path": "/api/sop/process/...",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Handling Analysis Blocking in UI

```typescript
async function requestAnalysis(sopId: string): Promise<AnalysisResult | null> {
  try {
    const response = await fetch(`/api/sop/process/${sopId}`, {
      method: 'POST',
    })

    if (response.status === 422) {
      const error = await response.json()
      // Show validation errors to user
      showValidationErrors(error.validation.errors)
      return null
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}

function showValidationErrors(errors: DagValidationErrorDto[]) {
  // Display each error with affected nodes highlighted
  errors.forEach((err) => {
    showToast(`${err.code}: ${err.message}`, 'error')
    highlightNodes(err.affectedNodeIds)
  })
}
```

### Gemini Analysis Creates Possibly Invalid DAGs

When Gemini AI analyzes an SOP and generates steps/edges:

- The DAG is saved even if validation fails
- `dagValid` will be `false` if there are issues
- Users must fix validation errors before running further analysis

**UI Workflow:**

1. User uploads SOP document
2. Gemini analyzes and creates steps/edges
3. Check `dagValid` on the response
4. If `false`, prompt user to fix the DAG structure
5. Once `dagValid: true`, analysis operations are available

### Displaying Validation Status

```typescript
function ValidationBadge({ sop }: { sop: SopDto }) {
  if (sop.dagValid) {
    return (
      <Badge color="green">
        DAG Valid
        {sop.validationWarnings?.length > 0 && (
          <span> ({sop.validationWarnings.length} warnings)</span>
        )}
      </Badge>
    );
  }

  return (
    <Badge color="red">
      DAG Invalid ({sop.validationErrors?.length || 0} errors)
    </Badge>
  );
}

function AnalysisButton({ sop }: { sop: SopDto }) {
  const canAnalyze = sop.dagValid;

  return (
    <Button
      disabled={!canAnalyze}
      title={canAnalyze ? 'Run analysis' : 'Fix validation errors first'}
    >
      Analyze
    </Button>
  );
}
```

---

## Query Patterns & Performance

| Operation        | DB Queries | Typical Latency | Best Use Case                   |
| ---------------- | ---------- | --------------- | ------------------------------- |
| GET SOP          | 2-3        | 10-50ms         | Page load, refresh              |
| Create Step      | 3-5        | 30-100ms        | Adding new node                 |
| Delete Step      | 6-10       | 50-150ms        | Removing node (cleans up edges) |
| Add Edge         | 7-10       | 50-200ms        | User draws connection           |
| Remove Edge      | 5-7        | 30-150ms        | User deletes connection         |
| Validate         | 1          | 5-20ms          | Already included in mutations   |
| Update Node Type | 3-4        | 20-80ms         | User changes step type          |
| Migrate to DAG   | 2n+4       | 100ms-1s        | One-time legacy conversion      |

### Complexity Notes

- **Cycle detection:** O(V+E) using DFS with 3-color marking
- **Reachability check:** O(V+E) using BFS from START
- **Validation runs after every mutation** - no need to call separately
- **Large SOPs (>100 steps):** Consider pagination for step lists

---

## Best Practices

### 1. Efficient Graph Rendering

```typescript
// Use server-provided flags for layout decisions
steps.forEach((step) => {
  if (step.nodeType === 'START') {
    // Position at top/left
  } else if (step.nodeType === 'END') {
    // Position at bottom/right
  }

  if (step.isFork) {
    // Prepare for multiple outgoing paths
  }

  if (step.isJoin) {
    // Show merge indicator
  }
})
```

### 2. Avoid Redundant API Calls

```typescript
// BAD: Calling validate after addEdge
async function addEdge(sopId: string, from: string, to: string) {
  await api.post(`/api/sop/${sopId}/edges`, { fromStepId: from, toStepId: to })
  await api.get(`/api/sop/${sopId}/validate`) // UNNECESSARY!
}

// GOOD: Use the response from addEdge
async function addEdge(sopId: string, from: string, to: string) {
  const response = await api.post(`/api/sop/${sopId}/edges`, {
    fromStepId: from,
    toStepId: to,
  })
  // response.validation already contains the validation result
  return response
}
```

### 3. Handle Cycle Detection Gracefully

```typescript
async function tryAddEdge(sopId: string, from: string, to: string) {
  try {
    const response = await api.post(`/api/sop/${sopId}/edges`, {
      fromStepId: from,
      toStepId: to,
    })
    return {
      success: true,
      edge: response.edge,
      validation: response.validation,
    }
  } catch (error) {
    if (error.status === 400) {
      // Likely a cycle - show user-friendly message
      return {
        success: false,
        message: 'This connection would create a circular dependency',
      }
    }
    throw error
  }
}
```

### 4. Batch UI Updates

```typescript
// BAD: Updating state after every single edge operation
edges.forEach(async (edge) => {
  await addEdge(sopId, edge.from, edge.to)
  await refreshGraph() // N refreshes!
})

// GOOD: Batch operations, single refresh
for (const edge of edges) {
  await addEdge(sopId, edge.from, edge.to)
}
await refreshGraph() // Single refresh at the end
```

### 5. Debounce Rapid Changes

```typescript
import { debounce } from 'lodash'

const debouncedValidate = debounce(async (sopId: string) => {
  const result = await api.get(`/api/sop/${sopId}/validate`)
  updateValidationUI(result)
}, 500)
```

---

## Validation Reference

### Error Codes (Blocking)

These prevent the DAG from functioning correctly. Must be fixed.

| Code                     | Meaning                       | User Action                               |
| ------------------------ | ----------------------------- | ----------------------------------------- |
| `NO_START_NODE`          | No START node defined         | Mark one step as START                    |
| `MULTIPLE_START_NODES`   | More than one START node      | Change extra START nodes to STEP          |
| `CYCLE_DETECTED`         | Circular dependency exists    | Remove the edge causing the cycle         |
| `START_HAS_PREDECESSORS` | START node has incoming edges | Remove incoming edges or change node type |
| `END_HAS_SUCCESSORS`     | END node has outgoing edges   | Remove outgoing edges or change node type |

### Warning Codes (Non-Blocking)

These indicate potential issues but don't prevent execution.

| Code               | Meaning                       | Suggested Fix                           |
| ------------------ | ----------------------------- | --------------------------------------- |
| `NO_END_NODE`      | No END nodes defined          | Mark terminal steps as END              |
| `UNREACHABLE_NODE` | Node not reachable from START | Add connecting edge from reachable node |
| `DANGLING_NODE`    | STEP with no successors       | Add outgoing edge or mark as END        |
| `ORPHAN_NODE`      | STEP with no predecessors     | Add incoming edge or mark as START      |

---

## TypeScript Interfaces

```typescript
// Node types
type StepNodeType = 'START' | 'STEP' | 'END'

// Role titles (subset - see OpenAPI for full list)
type RoleTitle =
  | 'CEO'
  | 'CFO'
  | 'COO'
  | 'CTO'
  | 'HR_MANAGER'
  | 'HR_DIRECTOR'
  | 'OPERATIONS_MANAGER'
  | 'OPERATIONS_DIRECTOR'
  | 'UNKNOWN'

// Employee assigned to a role
interface EmployeeDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  roleTitle: RoleTitle
  companyId: string
}

// Edge connecting two steps
interface EdgeDto {
  id: string
  from: string // Source step UUID
  to: string // Target step UUID
  transitionDuration?: string // ISO-8601 duration (only in trace responses)
}

// Step (node in the DAG)
interface StepDto {
  id: string
  name: string
  details: string
  postStepDocumentation?: string
  monitoringRequirements?: string
  actorRoleTitle?: RoleTitle
  nodeType: StepNodeType
  isFork: boolean
  isJoin: boolean
  matchingEmployeesForRoleTitle?: EmployeeDto[]
}

// Complete SOP with graph and validation status
interface SopDto {
  id: string
  companyId: string
  companyName: string
  sopName: string
  basicDescription: string
  createdAt: string
  steps: StepDto[]
  edges: EdgeDto[]
  sopFile?: SopFileDto
  analysisTaskId?: string
  // Validation status
  dagValid: boolean
  lastValidatedAt?: string
  validationErrors: DagValidationErrorDto[]
  validationWarnings: DagValidationWarningDto[]
}

// Validation warning
interface DagValidationWarningDto {
  code: string
  message: string
  nodeId?: string
  nodeName?: string
}

// Validation error
interface DagValidationErrorDto {
  code: string
  message: string
  affectedNodeIds?: string[]
}

// Validation result
interface DagValidationResultDto {
  valid: boolean
  warnings: DagValidationWarningDto[]
  errors: DagValidationErrorDto[]
}

// Edge creation request
interface CreateEdgeRequestDto {
  fromStepId: string
  toStepId: string
}

// Edge creation response
interface CreateEdgeResponseDto {
  edge: EdgeDto
  validation: DagValidationResultDto
}

// Step creation request
interface CreateStepRequestDto {
  name: string
  details?: string
  postStepDocumentation?: string
  monitoringRequirements?: string
  actorRoleTitle?: RoleTitle
  nodeType?: StepNodeType // Defaults to STEP if not provided
  stepOrder?: number
}

// Analysis blocking error response (422)
interface DagValidationErrorResponse {
  error: string // "INVALID_DAG_FOR_ANALYSIS"
  message: string
  validation: DagValidationResultDto
  path: string
  timestamp: string
}

// ============================================================
// Trace DTOs (for traceSopSteps endpoint)
// ============================================================

// Log source types
type LoggingSource =
  | 'GOOGLE_DRIVE'
  | 'GOOGLE_MAIL'
  | 'GOOGLE_TASKS'
  | 'GOOGLE_MOBILE_DEVICE'

// Log source with matching lines
interface LogMatchDto {
  logId: string
  logName: string
  loggingSource: LoggingSource
  matchingLogLines: LogLineDto[]
  matchCount: number
}

// Log line trace container
interface LogLineTraceDto {
  matchingLogs: LogMatchDto[]
}

// Activity event with associated log matches
interface ActivityEventTraceDto {
  activityEvent: ActivityEventDto
  logLineTrace: LogLineTraceDto
}

// Enriched step with trace data (extends StepDto)
interface StepTraceDto {
  // All StepDto fields
  id: string
  name: string
  details: string
  postStepDocumentation?: string
  monitoringRequirements?: string
  actorRoleTitle?: RoleTitle
  nodeType: StepNodeType
  isFork: boolean
  isJoin: boolean
  matchingEmployeesForRoleTitle?: EmployeeDto[]
  // Timing metadata (computed from log line timestamps)
  firstLogTimestamp?: string // ISO-8601 instant (earliest log across all activity events)
  lastLogTimestamp?: string // ISO-8601 instant (latest log across all activity events)
  stepDuration?: string // ISO-8601 duration (time between first and last log)
  // Trace enrichment
  matchingActivityEvents: ActivityEventTraceDto[]
}

// Complete SOP trace response (extends SopDto structure)
interface SopTraceDto {
  id: string
  companyId: string
  companyName: string
  sopName: string
  basicDescription: string
  createdAt: string
  sopFile?: SopFileDto
  geminiResponseFiles?: GeminiResponseFileDto[]
  // Validation status
  dagValid: boolean
  lastValidatedAt?: string
  validationErrors?: DagValidationErrorDto[]
  validationWarnings?: DagValidationWarningDto[]
  analysisTaskId?: string
  // Graph with enriched steps
  steps: StepTraceDto[] // Note: StepTraceDto, not StepDto
  edges: EdgeDto[]
}

// Async trace response (initial response with task map)
interface TraceSopStepsAsyncResponseDto {
  correlationId: string
  sopId: string
  stepTaskMap: Record<string, string> // stepId -> taskId
}

// Async step result (polling response)
interface StepTraceAsyncResultDto {
  stepId: string
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  message?: string
  stepTrace?: StepTraceDto // Present when COMPLETED
  logLineMatchingTaskMap?: Record<string, string> // activityEventId -> taskId
}

// Async logline matching result
interface LogLineMatchingAsyncResultDto {
  activityEventId: string
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  message?: string
  logLineTrace?: LogLineTraceDto // Present when COMPLETED
}

// Async trace aggregation result (includes edge timing)
interface AsyncTraceAggregateResultDto {
  correlationId: string
  sopId: string
  allComplete: boolean
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  message?: string
  sopTrace?: SopTraceDto // Present when allComplete=true and no failures
}

// Trace request
interface TraceSopStepsRequestDto {
  companyId: string
  sopId: string
}
```

---

## Code Examples

### Building an Adjacency List for Rendering

```typescript
function buildAdjacencyList(sop: SopDto): Map<string, string[]> {
  const adjacency = new Map<string, string[]>()

  // Initialize with all steps
  sop.steps.forEach((step) => {
    adjacency.set(step.id, [])
  })

  // Add edges
  sop.edges.forEach((edge) => {
    const successors = adjacency.get(edge.from) || []
    successors.push(edge.to)
    adjacency.set(edge.from, successors)
  })

  return adjacency
}
```

### Finding the START Node

```typescript
function findStartNode(sop: SopDto): StepDto | undefined {
  return sop.steps.find((step) => step.nodeType === 'START')
}
```

### Displaying Validation Results

```typescript
function ValidationDisplay({ validation }: { validation: DagValidationResultDto }) {
  return (
    <div>
      {validation.valid ? (
        <span className="success">DAG is valid</span>
      ) : (
        <span className="error">DAG has structural errors</span>
      )}

      {validation.errors.map((error, i) => (
        <div key={i} className="error-item">
          <strong>{error.code}:</strong> {error.message}
        </div>
      ))}

      {validation.warnings.map((warning, i) => (
        <div key={i} className="warning-item">
          <strong>{warning.code}:</strong> {warning.message}
          {warning.nodeName && <span> (Node: {warning.nodeName})</span>}
        </div>
      ))}
    </div>
  );
}
```

### Handling Edge Creation with UI Feedback

```typescript
async function handleEdgeCreate(
  sopId: string,
  fromStepId: string,
  toStepId: string
): Promise<void> {
  setLoading(true)

  try {
    const response = await fetch(`/api/sop/${sopId}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromStepId, toStepId }),
    })

    if (!response.ok) {
      if (response.status === 400) {
        showToast('Cannot create edge: would create a cycle', 'error')
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const result: CreateEdgeResponseDto = await response.json()

    // Update local state with new edge
    setEdges((prev) => [...prev, result.edge])

    // Show any warnings from validation
    if (result.validation.warnings.length > 0) {
      showToast(
        `Edge created with ${result.validation.warnings.length} warning(s)`,
        'warning'
      )
    }
  } catch (error) {
    showToast('Failed to create edge', 'error')
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

---

## Troubleshooting

### "Adding this edge would create a cycle"

**Cause:** The proposed edge would create a circular dependency.

**Solution:**

1. Visualize the current graph to identify the path
2. Consider if the dependency direction should be reversed
3. Or add an intermediate step to break the cycle

### Empty `edges` array despite having steps

**Cause:** The SOP was created before DAG support (legacy format).

**Solution:** Call the migration endpoint:

```http
POST /api/sop/{sopId}/migrate-to-dag
```

This converts `stepOrder`-based ordering to sequential edges.

### All steps have `nodeType: "STEP"`

**Cause:** AI analysis didn't assign START/END types, or migration wasn't run.

**Solution:**

1. Identify the first step and update its type to START
2. Identify terminal steps and update their types to END

```http
PUT /api/sop/{sopId}/steps/{firstStepId}/node-type?nodeType=START
PUT /api/sop/{sopId}/steps/{lastStepId}/node-type?nodeType=END
```

### Validation shows "UNREACHABLE_NODE" warnings

**Cause:** Some steps aren't connected to the main graph starting from START.

**Solution:**

1. Check if the node should be connected (add edge from a reachable node)
2. Or if it's an alternate entry point, consider if your process needs multiple SOPs

### `isFork` and `isJoin` are always `false`

**Cause:** These are computed properties. If no step has multiple predecessors or successors, both will be false.

**This is expected for simple linear workflows.** Fork/join only appear when:

- `isFork: true` = step has 2+ outgoing edges
- `isJoin: true` = step has 2+ incoming edges

### Analysis returns 422 "INVALID_DAG_FOR_ANALYSIS"

**Cause:** The DAG has structural errors that prevent analysis.

**Solution:**

1. Check `validationErrors` on the SopDto for specific issues
2. Common fixes:
   - Add a START node: `PUT /{sopId}/steps/{stepId}/node-type?nodeType=START`
   - Fix cycles by removing problematic edges
   - Connect orphan nodes to the main graph
3. Once `dagValid: true`, analysis will proceed

```typescript
// Check before requesting analysis
if (!sop.dagValid) {
  showErrors(sop.validationErrors)
  return
}
await requestAnalysis(sop.id)
```

### `dagValid` is `false` after Gemini analysis

**Cause:** AI-generated DAG structure may not always be perfect.

**This is expected behavior.** Gemini analysis saves the DAG even if invalid so users can fix it.

**Solution:**

1. Review the generated steps and edges
2. Check `validationErrors` for specific issues
3. Use edge and node-type endpoints to fix the structure
4. Once errors are resolved, `dagValid` will become `true`

### How to add a new step to an existing DAG

**Workflow:**

1. Create the step first:
   ```http
   POST /api/sop/{sopId}/steps
   {"name": "New Step", "nodeType": "STEP"}
   ```
2. Connect it to existing nodes:

   ```http
   POST /api/sop/{sopId}/edges
   {"fromStepId": "predecessor-id", "toStepId": "new-step-id"}

   POST /api/sop/{sopId}/edges
   {"fromStepId": "new-step-id", "toStepId": "successor-id"}
   ```

**Note:** The step exists in an "orphan" state (with warnings) until connected.

### Trace response has no `matchingActivityEvents`

**Cause:** Steps may not have `actorRoleTitle` assigned, or no ActivityEvents are defined for those roles.

**Solution:**

1. Ensure steps have `actorRoleTitle` set (AI analysis should assign these)
2. Check that ActivityEvents exist with matching `roleTitles` associations
3. Verify the company has logs uploaded that could match

### Trace response shows empty `matchingLogs`

**Cause:** No log lines matched the activity event's criteria.

**Solution:**

1. Check that logs are uploaded for the company
2. Verify ActivityEvent has `logLineEventTypeMappings` configured
3. Ensure log line event types match the ActivityEvent configuration

### Async trace shows "FAILED" status

**Cause:** The Gemini AI call failed or timed out.

**Solution:**

1. Check the `message` field in the response for error details
2. Retry the request - transient failures are common
3. For large SOPs, ensure adequate timeout settings

### Step timing fields are `null` despite having matching logs

**Cause:** Timing is computed from `LogLineDto.date` timestamps. If these are null, timing cannot be calculated.

**Solution:**

1. Check that the CSV log files have valid date columns
2. Verify the CSV parser is correctly extracting the `date` field
3. Inspect a sample `LogLineDto` in the response to confirm `date` is populated
4. If logs show `matchCount > 0` but `matchingLogLines` is empty, the full log line data may not be included (check API configuration)

**Technical note:** Timing traverses: `matchingActivityEvents` → `logLineTrace` → `matchingLogs` → `matchingLogLines` → `date`. All must be present for timing to be computed.

### Edge `transitionDuration` is negative

**This is expected behavior.** Negative transition times indicate overlapping or concurrent execution:

- **Fork/join patterns:** Parallel branches may have overlapping timestamps
- **Concurrent work:** Multiple people working on steps simultaneously
- **Data quality:** Log timestamps may not perfectly reflect step ordering

**UI handling:**

```typescript
if (parseDuration(edge.transitionDuration) < 0) {
  // Display as "concurrent" or "overlapping" instead of negative time
  return <Badge color="purple">Concurrent</Badge>;
}
```

### SopTraceDto vs SopDto: Which to use?

| Scenario                                             | Use                                                    |
| ---------------------------------------------------- | ------------------------------------------------------ |
| DAG editing UI (add/remove edges, change node types) | `SopDto` via `GET /api/sop/{id}`                       |
| Compliance dashboard showing step execution evidence | `SopTraceDto` via `POST /api/analysis/trace-sop-steps` |
| Quick SOP overview with validation status            | `SopDto`                                               |
| Audit trail with log line details                    | `SopTraceDto`                                          |

**Key insight:** Both share the same structure for graph rendering. The only difference is `SopTraceDto.steps` contains enriched `StepTraceDto` with activity/log data.

---

## Related Resources

- [OpenAPI Specification](../postman/openapi.json)
- [Postman Collection](../postman/postman-collection.json)
- [Steps as DAG Implementation RFC](../rfc/steps-as-dag_rfc.md)
- [DAG Validation Improvements RFC](../rfc/dag_validation_improvements_rfc.md)
