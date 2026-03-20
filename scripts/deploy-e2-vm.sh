#!/bin/bash
set -e

# ============================================
# ops-ui - E2 VM Deployment Script
# Deploys to a single e2-micro instance
# ============================================

# Configuration (override with environment variables)
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
ZONE="${GCP_ZONE:-us-central1-a}"
REGION="${GCP_REGION:-us-central1}"
INSTANCE_NAME="${GCP_INSTANCE_NAME:-ops-ui-vm}"
MACHINE_TYPE="${GCP_MACHINE_TYPE:-e2-micro}"
REPOSITORY="${GCP_REPOSITORY:-osyops}"
SERVICE_NAME="${GCP_SERVICE_NAME:-ops-ui}"
API_URL="${NEXT_PUBLIC_API_BASE_URL:?Error: NEXT_PUBLIC_API_BASE_URL must be set}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Validate configuration variables contain only safe characters
validate_input() {
    local name="$1"
    local value="$2"
    if [[ ! "$value" =~ ^[a-zA-Z0-9._:/-]+$ ]]; then
        echo -e "${RED}Error: ${name} contains invalid characters: ${value}${NC}"
        exit 1
    fi
}

validate_input "GCP_PROJECT_ID" "$PROJECT_ID"
validate_input "GCP_ZONE" "$ZONE"
validate_input "GCP_REGION" "$REGION"
validate_input "GCP_INSTANCE_NAME" "$INSTANCE_NAME"
validate_input "GCP_MACHINE_TYPE" "$MACHINE_TYPE"
validate_input "GCP_REPOSITORY" "$REPOSITORY"
validate_input "GCP_SERVICE_NAME" "$SERVICE_NAME"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ops-ui - E2 VM Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Configuration:${NC}"
echo -e "  Project:       ${PROJECT_ID}"
echo -e "  Zone:          ${ZONE}"
echo -e "  Instance:      ${INSTANCE_NAME}"
echo -e "  Machine Type:  ${MACHINE_TYPE}"
echo -e "  API URL:       ${API_URL}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}Not authenticated. Running gcloud auth login...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${YELLOW}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable compute.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo -e "${YELLOW}Creating Artifact Registry repository...${NC}"
gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --description="OSY Operations Docker images" \
    2>/dev/null || echo "Repository already exists"

# Configure Docker auth
echo -e "${YELLOW}Configuring Docker authentication...${NC}"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build and push image (force linux/amd64 for GCP VMs)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:${GIT_SHA}"
IMAGE_TAG_LATEST="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest"

echo -e "${YELLOW}Building Docker image for linux/amd64: ${IMAGE_TAG}${NC}"
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_BASE_URL="$API_URL" -t "$IMAGE_TAG" -t "$IMAGE_TAG_LATEST" .

echo -e "${YELLOW}Pushing image to Artifact Registry...${NC}"
docker push "$IMAGE_TAG"
docker push "$IMAGE_TAG_LATEST"

# Create firewall rules for HTTP/HTTPS (if they don't exist)
echo -e "${YELLOW}Creating firewall rules...${NC}"
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags=http-server \
    --description="Allow HTTP traffic" \
    2>/dev/null || echo "HTTP firewall rule already exists"

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --target-tags=https-server \
    --description="Allow HTTPS traffic" \
    2>/dev/null || echo "HTTPS firewall rule already exists"

# Create startup script for the VM
STARTUP_SCRIPT=$(cat <<'STARTUP_EOF'
#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/startup-script.log) 2>&1
echo "Starting startup script at $(date)"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io

    systemctl enable docker
    systemctl start docker
fi

# Configure Docker to use gcloud for authentication
echo "Configuring Docker authentication..."
gcloud auth configure-docker __PLACEHOLDER_REGION__-docker.pkg.dev --quiet

# Pull and run the container
echo "Pulling and running container..."
docker pull __PLACEHOLDER_IMAGE_TAG__

# Stop existing container if running
docker stop ops-ui 2>/dev/null || true
docker rm ops-ui 2>/dev/null || true

# Run the new container
docker run -d \
    --name ops-ui \
    --restart unless-stopped \
    -p 80:8080 \
    -e NODE_ENV=production \
    __PLACEHOLDER_IMAGE_TAG__

echo "Container started successfully at $(date)"
STARTUP_EOF
)

# Replace placeholders in startup script
STARTUP_SCRIPT="${STARTUP_SCRIPT//__PLACEHOLDER_IMAGE_TAG__/$IMAGE_TAG}"
STARTUP_SCRIPT="${STARTUP_SCRIPT//__PLACEHOLDER_REGION__/$REGION}"

# Check if instance already exists
if gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" &>/dev/null; then
    echo -e "${YELLOW}Instance already exists. Updating container...${NC}"

    # Write update commands to a temporary script to avoid shell injection
    UPDATE_SCRIPT=$(mktemp)
    cat > "$UPDATE_SCRIPT" <<UPDATE_EOF
#!/bin/bash
set -e
sudo gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
sudo docker pull ${IMAGE_TAG}
sudo docker stop ops-ui 2>/dev/null || true
sudo docker rm ops-ui 2>/dev/null || true
sudo docker run -d \
    --name ops-ui \
    --restart unless-stopped \
    -p 80:8080 \
    -e NODE_ENV=production \
    ${IMAGE_TAG}
UPDATE_EOF

    gcloud compute scp "$UPDATE_SCRIPT" "$INSTANCE_NAME":/tmp/update-container.sh --zone="$ZONE"
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="bash /tmp/update-container.sh && rm /tmp/update-container.sh"
    rm "$UPDATE_SCRIPT"
else
    echo -e "${YELLOW}Creating new VM instance...${NC}"

    # Create the VM with minimal scopes (Artifact Registry read + logging + monitoring)
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --image-family=debian-12 \
        --image-project=debian-cloud \
        --boot-disk-size=10GB \
        --boot-disk-type=pd-standard \
        --tags=http-server,https-server \
        --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write \
        --metadata=startup-script="$STARTUP_SCRIPT"

    echo -e "${YELLOW}Waiting for VM to initialize...${NC}"
    sleep 30
fi

# Get the external IP
EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" \
    --zone="$ZONE" \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Instance:    ${CYAN}${INSTANCE_NAME}${NC}"
echo -e "Zone:        ${CYAN}${ZONE}${NC}"
echo -e "Image:       ${CYAN}${IMAGE_TAG}${NC}"
echo -e "External IP: ${CYAN}${EXTERNAL_IP}${NC}"
echo -e "URL:         ${GREEN}http://${EXTERNAL_IP}${NC}"
echo ""
echo -e "${YELLOW}Estimated monthly cost: ~\$6-7 USD${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait for Docker to install and container to start"
echo "2. Test: curl http://${EXTERNAL_IP}/api/health"
echo "3. Reserve static IP: gcloud compute addresses create ops-ui-ip --region ${REGION}"
echo "4. Point your domain DNS A record to: ${EXTERNAL_IP}"
echo "5. Set up SSL with Let's Encrypt (see docs)"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  SSH into VM:       gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE}"
echo "  View logs:         gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='sudo docker logs ops-ui'"
echo "  Restart container: gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='sudo docker restart ops-ui'"
echo "  Stop VM:           gcloud compute instances stop ${INSTANCE_NAME} --zone=${ZONE}"
echo "  Delete VM:         gcloud compute instances delete ${INSTANCE_NAME} --zone=${ZONE}"
