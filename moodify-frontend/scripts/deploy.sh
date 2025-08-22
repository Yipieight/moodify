#!/bin/bash

# MOODIFY Deployment Script for AWS
# This script automates the deployment process to AWS ECS

set -e  # Exit on any error

# Configuration
PROJECT_NAME="moodify"
ENVIRONMENT="${ENVIRONMENT:-prod}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="${PROJECT_NAME}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        warning "Terraform is not installed. Infrastructure deployment will be skipped."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials are not configured. Please run 'aws configure' first."
    fi
    
    success "Prerequisites check completed"
}

# Build and push Docker image
build_and_push_image() {
    log "Building and pushing Docker image..."
    
    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build Docker image
    log "Building Docker image..."
    docker build -t $ECR_REPOSITORY:$IMAGE_TAG .
    
    # Tag image for ECR
    ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    # Push image to ECR
    log "Pushing image to ECR..."
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    success "Image built and pushed successfully"
    echo "Image URI: $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    if ! command -v terraform &> /dev/null; then
        warning "Terraform not found. Skipping infrastructure deployment."
        return 0
    fi
    
    log "Deploying infrastructure with Terraform..."
    
    cd infrastructure/terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan \
        -var="environment=$ENVIRONMENT" \
        -var="container_image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" \
        -out=tfplan
    
    # Apply changes
    log "Applying Terraform changes..."
    terraform apply -auto-approve tfplan
    
    cd ../..
    
    success "Infrastructure deployed successfully"
}

# Update ECS service
update_ecs_service() {
    log "Updating ECS service..."
    
    CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-service"
    
    # Check if cluster exists
    if ! aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION &> /dev/null; then
        error "ECS cluster $CLUSTER_NAME not found. Please deploy infrastructure first."
    fi
    
    # Update service
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION
    
    # Wait for deployment to complete
    log "Waiting for deployment to complete..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    success "ECS service updated successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get ALB DNS name from Terraform output
    if command -v terraform &> /dev/null; then
        cd infrastructure/terraform
        ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "")
        cd ../..
        
        if [ -n "$ALB_DNS" ]; then
            log "Checking application health at http://$ALB_DNS/api/health"
            
            # Wait a bit for the service to be ready
            sleep 30
            
            # Perform health check
            for i in {1..10}; do
                if curl -f -s "http://$ALB_DNS/api/health" > /dev/null; then
                    success "Application is healthy and responding"
                    echo "Application URL: http://$ALB_DNS"
                    return 0
                fi
                log "Health check attempt $i/10 failed, retrying in 10 seconds..."
                sleep 10
            done
            
            warning "Health check failed after 10 attempts"
        else
            warning "Could not determine ALB DNS name for health check"
        fi
    else
        warning "Terraform not available, skipping automated health check"
    fi
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-service"
    
    # Get previous task definition
    CURRENT_TASK_DEF=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --query 'services[0].taskDefinition' \
        --output text \
        --region $AWS_REGION)
    
    # Extract revision number and calculate previous revision
    CURRENT_REVISION=$(echo $CURRENT_TASK_DEF | grep -o '[0-9]*$')
    PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
    
    if [ $PREVIOUS_REVISION -lt 1 ]; then
        error "No previous revision found for rollback"
    fi
    
    FAMILY=$(echo $CURRENT_TASK_DEF | sed 's/:[0-9]*$//')
    PREVIOUS_TASK_DEF="$FAMILY:$PREVIOUS_REVISION"
    
    log "Rolling back to task definition: $PREVIOUS_TASK_DEF"
    
    # Update service with previous task definition
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --task-definition $PREVIOUS_TASK_DEF \
        --region $AWS_REGION
    
    # Wait for rollback to complete
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    success "Rollback completed successfully"
}

# Main deployment function
main() {
    log "Starting MOODIFY deployment..."
    log "Environment: $ENVIRONMENT"
    log "Region: $AWS_REGION"
    log "Image Tag: $IMAGE_TAG"
    
    case "$1" in
        "build")
            check_prerequisites
            build_and_push_image
            ;;
        "infrastructure")
            check_prerequisites
            deploy_infrastructure
            ;;
        "deploy")
            check_prerequisites
            build_and_push_image
            update_ecs_service
            health_check
            ;;
        "full")
            check_prerequisites
            build_and_push_image
            deploy_infrastructure
            update_ecs_service
            health_check
            ;;
        "rollback")
            check_prerequisites
            rollback
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 {build|infrastructure|deploy|full|rollback|health}"
            echo ""
            echo "Commands:"
            echo "  build         - Build and push Docker image only"
            echo "  infrastructure - Deploy infrastructure with Terraform only"
            echo "  deploy        - Deploy application (build + ECS update)"
            echo "  full          - Full deployment (build + infrastructure + deploy)"
            echo "  rollback      - Rollback to previous version"
            echo "  health        - Check application health"
            echo ""
            echo "Environment variables:"
            echo "  ENVIRONMENT   - Deployment environment (default: prod)"
            echo "  AWS_REGION    - AWS region (default: us-east-1)"
            echo "  IMAGE_TAG     - Docker image tag (default: git commit hash)"
            exit 1
            ;;
    esac
    
    success "Deployment process completed!"
}

# Run main function with all arguments
main "$@"