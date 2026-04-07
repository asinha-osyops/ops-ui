# E2 VM Deployment Infrastructure RFC

## What Was Implemented

Docker containerization and GCP Compute Engine E2 VM deployment infrastructure for ops-ui, ported from the `ops-ui-landing-tmp` project and adapted for ops-ui's specific requirements.

## Key Files Changed

### New Files (6)

- **`app/api/health/route.ts`** — Health check endpoint (`GET /api/health`) returning `{ status: "ok", timestamp }`. Used by Docker `HEALTHCHECK` directive.
- **`Dockerfile`** — Multi-stage production build. Stage 1 builds with `npm ci` + `npm run build`, Stage 2 runs standalone Next.js on port 8080 as non-root user.
- **`Dockerfile.dev`** — Development Dockerfile for docker-compose hot reload. Uses `npm` (not yarn like the landing project).
- **`.dockerignore`** — Excludes `node_modules`, `.next`, `.git`, `docs/`, `.claude/`, and other non-runtime files to reduce image size.
- **`docker-compose.yml`** — Two services: `dev` (hot reload on port 3000) and `prod` (production build on port 8080, behind `prod` profile).
- **`scripts/deploy-e2-vm.sh`** — Full deployment script: builds Docker image, pushes to Artifact Registry, creates/updates E2 VM with startup script.

### Modified Files (2)

- **`next.config.js`** — Gated `allowedDevOrigins` behind `NODE_ENV === 'development'` check. Added `async headers()` with security headers (HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- **`package.json`** — Added 5 scripts: `docker:build`, `docker:run`, `docker:dev`, `docker:prod`, `deploy:e2`.

### Documentation (2)

- **`docs/e2-vm-deployment-guide.md`** — Deployment guide with prerequisites, configuration table, local testing, architecture diagram, cost estimate, and troubleshooting.
- **`docs/rfc/e2_vm_deployment_rfc.md`** — This file.

## Design Decisions

1. **`NEXT_PUBLIC_API_BASE_URL` as Docker build arg**: Next.js inlines `NEXT_PUBLIC_*` environment variables at build time. The production Docker image is therefore tied to a specific API endpoint. Changing the URL requires rebuilding the image. This is an inherent Next.js constraint, not a design choice.

2. **Health endpoint is unauthenticated**: The existing `middleware.ts` already skips `/api` routes via `SKIP_PATTERNS`, so the health endpoint works without any middleware changes.

3. **Security headers always active**: Applied via `next.config.js headers()` on all paths (`/:path*`). This runs in both dev and prod but has negligible overhead since Next.js caches the headers config.

4. **npm instead of yarn**: The landing project's `Dockerfile.dev` used yarn. ops-ui uses npm throughout, so both Dockerfiles use `npm ci` / `npm run dev`.

5. **Container name `ops-ui`**: All Docker container references (deploy script, docker-compose) use `ops-ui` instead of the landing project's `osyops-landing`.

6. **No `NEXT_PUBLIC_SITE_URL`**: The landing project passed this env var for SEO/metadata. ops-ui doesn't use it, so it was removed from all Docker configs.

## Testing Performed

- Verified `middleware.ts` already skips `/api` routes (line 34: `'/api'` in `SKIP_PATTERNS`)
- Confirmed `output: 'standalone'` was already set in `next.config.js`
- Validated all config files adapted from landing project references
- Ran `npm run format` to ensure Prettier compliance
