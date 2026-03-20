# E2 VM Deployment Guide

Deploy ops-ui to a Google Cloud Compute Engine E2 instance.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- [Docker](https://docs.docker.com/get-docker/) installed locally
- A GCP project with billing enabled

## Quick Start

```bash
# Set your GCP project ID and API URL
export GCP_PROJECT_ID=your-project-id
export NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8080

# Deploy
npm run deploy:e2
```

## Configuration

| Variable                   | Default                     | Description                  |
| -------------------------- | --------------------------- | ---------------------------- |
| `GCP_PROJECT_ID`           | `your-project-id`           | GCP project ID               |
| `GCP_ZONE`                 | `us-central1-a`             | Compute Engine zone          |
| `GCP_REGION`               | `us-central1`               | GCP region                   |
| `GCP_INSTANCE_NAME`        | `ops-ui-vm`                 | VM instance name             |
| `GCP_MACHINE_TYPE`         | `e2-micro`                  | Machine type                 |
| `GCP_REPOSITORY`           | `osyops`                    | Artifact Registry repository |
| `GCP_SERVICE_NAME`         | `ops-ui`                    | Docker image/service name    |
| `NEXT_PUBLIC_API_BASE_URL` | `http://192.168.1.158:8080` | Backend API URL              |

## Local Docker Testing

### Development (hot reload)

```bash
npm run docker:dev
# App at http://localhost:3000
```

### Production (mirrors deployment)

```bash
export NEXT_PUBLIC_API_BASE_URL=http://your-api:8080
npm run docker:build
npm run docker:run
# App at http://localhost:8080
```

### Using docker-compose profiles

```bash
# Dev
docker compose up --build dev

# Prod
docker compose --profile prod up --build prod
```

## Architecture

```
┌─────────────────────────────────────┐
│         E2 VM (e2-micro)            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Docker Container (ops-ui)    │  │
│  │  Node.js + Next.js standalone │  │
│  │  Port 8080 (internal)         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Port 80 → 8080 (mapped)           │
└─────────────────────────────────────┘
         │
         ▼
   External IP (HTTP)
```

- **Image Registry**: Google Artifact Registry
- **OS**: Debian 12
- **Runtime**: Node.js 20 (slim)
- **Process**: Next.js standalone server (`node server.js`)
- **Health check**: `GET /api/health` every 30s

## Cost Estimate

| Resource                       | Monthly Cost |
| ------------------------------ | ------------ |
| e2-micro instance (always-on)  | ~$6-7        |
| 10GB standard persistent disk  | ~$0.40       |
| Artifact Registry storage      | ~$0.10       |
| Network egress (light traffic) | ~$0          |
| **Total**                      | **~$6-7**    |

## Troubleshooting

### Container won't start

```bash
# SSH into VM
gcloud compute ssh ops-ui-vm --zone=us-central1-a

# Check Docker logs
sudo docker logs ops-ui

# Check if container is running
sudo docker ps -a
```

### Health check failing

```bash
# Test from VM
gcloud compute ssh ops-ui-vm --zone=us-central1-a \
  --command='curl -s http://localhost:8080/api/health'
```

### Rebuild and redeploy

```bash
# Re-run the deploy script — it handles existing instances
npm run deploy:e2
```

### View startup script logs

```bash
gcloud compute ssh ops-ui-vm --zone=us-central1-a \
  --command='sudo cat /var/log/startup-script.log'
```

## Useful GCP Commands

```bash
# SSH into VM
gcloud compute ssh ops-ui-vm --zone=us-central1-a

# View container logs
gcloud compute ssh ops-ui-vm --zone=us-central1-a \
  --command='sudo docker logs ops-ui'

# Restart container
gcloud compute ssh ops-ui-vm --zone=us-central1-a \
  --command='sudo docker restart ops-ui'

# Stop VM (saves compute cost, disk still billed)
gcloud compute instances stop ops-ui-vm --zone=us-central1-a

# Start VM
gcloud compute instances start ops-ui-vm --zone=us-central1-a

# Delete VM entirely
gcloud compute instances delete ops-ui-vm --zone=us-central1-a

# Reserve a static IP
gcloud compute addresses create ops-ui-ip --region=us-central1

# List Artifact Registry images
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/YOUR_PROJECT/osyops
```
