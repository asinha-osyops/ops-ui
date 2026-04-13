# Orchestrated SOP Analysis Integration Guide

This guide explains how to integrate with the orchestrated SOP analysis API endpoints to trigger analysis, track progress, and retrieve results.

## Overview

Orchestrated SOP analysis is an async, multi-stage process:

1. **Trigger** - Start analysis for a SOP
2. **Track** - Poll task status for each step
3. **Retrieve** - Get results as tasks complete
4. **Aggregate** - Get final combined results with timing data

### Key Features

- **DAG-ordered processing** - Steps are processed respecting their dependencies in the SOP graph
- **Cascading time filters** - Predecessor timing data informs successor step analysis
- **Complete step results** - Step tasks wait for all child LogLine matching tasks before completing
- **Accurate timing data** - `earliestCandidateTime` is computed from child tasks before step completes

---

## 1. Triggering Analysis

### Endpoint

```
POST /api/analysis/analyze/orchestrated
```

### Request

```json
{
  "companyId": "uuid",
  "sopId": "uuid"
}
```

### Response (202 Accepted)

```json
{
  "sopId": "uuid",
  "correlationId": "uuid",
  "stepTaskMap": {
    "<stepId-1>": "<taskId-1>",
    "<stepId-2>": "<taskId-2>",
    "<stepId-3>": "<taskId-3>"
  },
  "message": "Queued async processing for 3 steps (DAG-orchestrated with cascading time filters)"
}
```

### Key Fields

| Field           | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `correlationId` | Groups all tasks for this analysis session. **Save this!** |
| `stepTaskMap`   | Maps each Step ID to its Task ID for polling               |

---

## 2. Initial Return Value

After triggering, you immediately receive the `stepTaskMap`. Use this to:

1. Build your UI showing all steps with "Pending" status
2. Start polling for completion
3. Store the `correlationId` for final aggregation

### Suggested Initial UI State

```typescript
interface StepStatus {
  stepId: string
  taskId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  result?: StepAnalysisResult
}

// Initialize from response
const stepStatuses: Map<string, StepStatus> = new Map()
for (const [stepId, taskId] of Object.entries(response.stepTaskMap)) {
  stepStatuses.set(stepId, {
    stepId,
    taskId,
    status: 'PENDING',
  })
}
```

---

## 3. Tracking Progression

### Task Status Values

| Status       | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `PENDING`    | Task queued, waiting for predecessors to complete            |
| `PROCESSING` | AI is analyzing (ActivityEvent selection + LogLine matching) |
| `COMPLETED`  | Done - all results available including child tasks           |
| `FAILED`     | Error occurred                                               |

### Polling Strategy

#### Option A: Poll Aggregate Status (Recommended)

```
GET /api/analysis/analyze/async/aggregate?correlationId={correlationId}&sopId={sopId}
```

**Response:**

```json
{
  "correlationId": "uuid",
  "sopId": "uuid",
  "allComplete": false,
  "totalTasks": 5,
  "completedTasks": 3,
  "failedTasks": 0,
  "pendingTasks": 2,
  "message": "3 of 5 tasks complete",
  "sopAnalysis": null
}
```

#### Option B: Poll Individual Steps

```
GET /api/analysis/analyze/async/result?sopId={sopId}&stepId={stepId}&taskId={taskId}
```

**Response:**

```json
{
  "stepId": "uuid",
  "taskId": "uuid",
  "status": "COMPLETED",
  "message": null,
  "stepAnalysis": {
    "step": {
      /* StepDto */
    },
    "matchingActivityEvents": [
      /* ActivityEventDto[] */
    ],
    "firstLogTimestamp": "2024-03-15T10:30:00Z",
    "lastLogTimestamp": "2024-03-15T14:45:00Z",
    "stepDuration": "PT4H15M"
  },
  "logLineMatchingTaskMap": {
    "<activityEventId-1>": "<logLineTaskId-1>",
    "<activityEventId-2>": "<logLineTaskId-2>"
  }
}
```

### Recommended Polling Pattern

Since orchestrated mode waits for LogLine tasks, polling is simplified:

```typescript
async function pollAnalysis(
  sopId: string,
  correlationId: string
): Promise<SopAnalysisDto> {
  const POLL_INTERVAL = 3000 // 3 seconds - slightly longer since steps wait for children
  const MAX_POLLS = 100 // 5 minutes max

  let pollCount = 0

  while (pollCount < MAX_POLLS) {
    const aggregate = await fetch(
      `/api/analysis/analyze/async/aggregate?correlationId=${correlationId}&sopId=${sopId}`
    ).then((r) => r.json())

    updateProgressUI(aggregate.completedTasks, aggregate.totalTasks)

    if (aggregate.allComplete) {
      // Everything is done - sopAnalysis includes all timing data
      return aggregate.sopAnalysis
    }

    await sleep(POLL_INTERVAL)
    pollCount++
  }

  throw new Error('Analysis timed out')
}
```

---

## 4. Retrieving Results

### Step-Level Results

When a step task completes, the response includes:

```json
{
  "stepAnalysis": {
    "step": {
      "id": "uuid",
      "name": "Review patient intake form",
      "actorRoleTitle": "MEDICAL_OFFICE_MANAGER",
      "nodeType": "START",
      "inferredEventCategories": ["DOCUMENT_VIEW", "FORM_SUBMIT"],
      "inferredResourceType": "DOCUMENT"
    },
    "matchingActivityEvents": [
      {
        "id": "uuid",
        "name": "Patient Form Review",
        "associatedEventCategories": ["DOCUMENT_VIEW", "FORM_SUBMIT"]
      }
    ],
    "firstLogTimestamp": "2024-03-15T10:30:00Z",
    "lastLogTimestamp": "2024-03-15T10:45:00Z",
    "stepDuration": "PT15M"
  },
  "logLineMatchingTaskMap": {
    "<activityEventId>": "<logLineTaskId>"
  }
}
```

### LogLine Matching Results (Optional)

Since step tasks wait for LogLine matching to complete, timing data is already included in the step result. However, you can still poll for detailed LogLine data:

```
GET /api/analysis/analyze/async/logline-result?taskId={logLineTaskId}
```

**Response:**

```json
{
  "activityEventId": "uuid",
  "taskId": "uuid",
  "status": "COMPLETED",
  "matchingLogLineIds": ["uuid1", "uuid2", "uuid3"],
  "logLineAnalysis": {
    "logId": "uuid",
    "logName": "March 2024 Google Workspace Logs",
    "matchingLogLines": [
      {
        "id": "uuid",
        "date": "2024-03-15T10:32:00Z",
        "actor": "jane@clinic.com",
        "actorRoleTitle": "MEDICAL_OFFICE_MANAGER",
        "event": "view",
        "resourceTitle": "Patient Intake - John Smith.pdf",
        "eventCategory": "DOCUMENT_VIEW"
      }
    ]
  }
}
```

### Final Aggregated Results

When `allComplete: true`, the aggregate endpoint returns the full `SopAnalysisDto`:

```json
{
  "allComplete": true,
  "sopAnalysis": {
    "sop": {
      /* Full SopDto with steps and edges */
    },
    "stepAnalyses": [
      {
        "step": {
          /* StepDto */
        },
        "matchingActivityEvents": [
          /* ActivityEventDto[] */
        ],
        "firstLogTimestamp": "...",
        "lastLogTimestamp": "...",
        "stepDuration": "PT15M"
      }
    ],
    "edgeAnalyses": [
      {
        "edge": {
          "sourceStepId": "uuid",
          "targetStepId": "uuid"
        },
        "transitionTime": "PT30M"
      }
    ]
  }
}
```

---

## 5. Example Flow

### Complete Integration Example

```typescript
// 1. Trigger analysis
const triggerResponse = await fetch('/api/analysis/analyze/orchestrated', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyId, sopId }),
})
const { correlationId, stepTaskMap } = await triggerResponse.json()

// 2. Initialize UI
showAnalysisStarted(Object.keys(stepTaskMap).length)

// 3. Poll for completion with exponential backoff
let interval = 2000
const maxInterval = 10000

const pollInterval = setInterval(async () => {
  const aggregate = await fetch(
    `/api/analysis/analyze/async/aggregate?correlationId=${correlationId}&sopId=${sopId}`
  ).then((r) => r.json())

  // Update progress bar
  updateProgress(aggregate.completedTasks, aggregate.totalTasks)

  // Check for completion
  if (aggregate.allComplete) {
    clearInterval(pollInterval)

    if (aggregate.failedTasks === 0) {
      // Success! Display full analysis
      displaySopAnalysis(aggregate.sopAnalysis)
    } else {
      // Partial failure - show what completed
      displayPartialResults(aggregate)
    }
  } else {
    // Increase interval for next poll (exponential backoff)
    interval = Math.min(interval * 1.5, maxInterval)
  }
}, interval)

// 4. Cancel polling on component unmount
return () => clearInterval(pollInterval)
```

---

## 6. Tips & Things to Watch Out For

### Understanding Step Completion

A step task only reaches `COMPLETED` status **after all its LogLine matching child tasks finish**. This means:

- Timing data (`earliestCandidateTime`, `firstLogTimestamp`, `lastLogTimestamp`) is accurate when you poll the step
- You don't need to separately poll LogLine tasks for timing info
- Step tasks take slightly longer to complete but results are more accurate

### Task Hierarchy

```
Analysis Trigger
└── Step Task (per step)
    └── LogLine Matching Task (per selected ActivityEvent)

Step completes → All child LogLine tasks already finished
```

### DAG Processing Order

- Steps are processed respecting their dependencies
- A step stays `PENDING` until all predecessors complete
- Don't assume all steps start immediately after triggering
- START nodes begin first, then their successors, etc.

### Common Gotchas

1. **Don't forget the `correlationId`**
   - Store it immediately after triggering
   - Required for final aggregation

2. **Handle partial failures gracefully**
   - Individual steps can fail while others succeed
   - Check `failedTasks` in aggregate response
   - Display successful results even if some failed

3. **Steps may stay PENDING longer than expected**
   - This is normal - they're waiting for predecessors
   - Don't treat prolonged PENDING status as an error

### Polling Best Practices

```typescript
// DO: Use exponential backoff
let interval = 2000
const maxInterval = 10000

async function poll() {
  const result = await checkStatus()
  if (!result.allComplete) {
    interval = Math.min(interval * 1.5, maxInterval)
    setTimeout(poll, interval)
  }
}

// DO: Cancel polling on component unmount
useEffect(() => {
  const controller = new AbortController()
  startPolling(controller.signal)
  return () => controller.abort()
}, [])

// DON'T: Poll too frequently
// Bad: setInterval(..., 100)
// Good: setInterval(..., 2000) or exponential backoff
```

### Status Transitions

```
PENDING → PROCESSING → COMPLETED
                    ↘ FAILED
```

- Tasks never go backward
- `FAILED` is terminal - won't retry automatically

### Displaying Duration

The API returns ISO 8601 durations (e.g., `"PT4H15M"`). Parse with:

```typescript
function formatIsoDuration(iso: string): string {
  // Parse PT4H15M → { hours: 4, minutes: 15 }
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return iso

  const duration = {
    hours: parseInt(match[1] || '0'),
    minutes: parseInt(match[2] || '0'),
    seconds: parseInt(match[3] || '0'),
  }

  const parts = []
  if (duration.hours) parts.push(`${duration.hours}h`)
  if (duration.minutes) parts.push(`${duration.minutes}m`)
  if (duration.seconds) parts.push(`${duration.seconds}s`)

  return parts.join(' ') || '0s'
}

// "4h 15m"
```

### Error Handling

```typescript
interface AnalysisError {
  stepId?: string
  taskId?: string
  message: string
  status: 'FAILED'
}

function handleAnalysisError(result: StepAnalysisAsyncResultDto) {
  if (result.status === 'FAILED') {
    console.error(`Step ${result.stepId} failed: ${result.message}`)

    // Common errors:
    // - "No candidate ActivityEvents found" → Normal, step has no matching events
    // - "Gemini API error" → Retry or show error
    // - "Step has no actorRoleTitle" → Expected for some steps
  }
}
```

---

## Quick Reference

| Action               | Endpoint                                     | Method |
| -------------------- | -------------------------------------------- | ------ |
| Start analysis       | `/api/analysis/analyze/orchestrated`         | POST   |
| Check step status    | `/api/analysis/analyze/async/result`         | GET    |
| Check LogLine status | `/api/analysis/analyze/async/logline-result` | GET    |
| Get aggregate/final  | `/api/analysis/analyze/async/aggregate`      | GET    |

### Query Parameters

| Endpoint                | Parameters                  |
| ----------------------- | --------------------------- |
| `/async/result`         | `sopId`, `stepId`, `taskId` |
| `/async/logline-result` | `taskId`                    |
| `/async/aggregate`      | `correlationId`, `sopId`    |
