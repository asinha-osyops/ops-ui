# ops-ui

## Basic Overview

A Next.js-based web application for managing Standard Operating Procedures (SOPs), Companies, Employees, Logs, and Activity Events.

**Key Features:**

- Create and visualize SOPs as DAG workflows
- Manage organizational structures with org chart visualization
- Analyze SOP execution through log line matching
- Two-level async task processing with real-time status updates

**Tech Stack:**

- Next.js 15 (App Router) with React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- ReactFlow for graph visualization

## Design

The application follows a component-based architecture:

- `app/` - Next.js App Router pages
- `components/` - Reusable UI components (~90 shadcn/ui components)
- `lib/` - API client, hooks, schemas, utilities, and global state
- `docs/rfc/` - Implementation RFCs

See `CLAUDE.md` for detailed architecture documentation.

## Build

```bash
# Install dependencies
npm install

# Development build
npm run dev

# Production build
npm run build
```

**Environment Configuration:**

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.158:8080
```

Note: If your IP address changes, update both:

1. `.env.local` (for API calls)
2. `next.config.js` (for allowed dev origins)

## Test

```bash
# Run linting
npm run lint
```

## Deploy

### Local Production

```bash
npm run build
npm run start
```

The application runs on `http://0.0.0.0:3000` (accessible on local network).

### Docker

```bash
# Development with hot reload
npm run docker:dev
# App at http://localhost:3000

# Production build and run
export NEXT_PUBLIC_API_BASE_URL=http://your-api:8080
npm run docker:build
npm run docker:run
# App at http://localhost:8080
```

> **Note:** `NEXT_PUBLIC_API_BASE_URL` is inlined at build time by Next.js. Changing the API URL requires rebuilding the image.

### GCP Compute Engine (E2 VM)

Deploys to a single `e2-micro` instance (~$6-7/month):

```bash
export GCP_PROJECT_ID=your-project-id
export NEXT_PUBLIC_API_BASE_URL=http://your-api:8080
npm run deploy:e2
```

The script handles Docker image build, Artifact Registry push, and VM creation/update. See [docs/e2-vm-deployment-guide.md](docs/e2-vm-deployment-guide.md) for full configuration options and troubleshooting.
