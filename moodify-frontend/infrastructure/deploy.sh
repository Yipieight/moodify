#!/bin/bash
# Quick deployment script for Moodify updates
set -e

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="moodify"

echo "🚀 Deploying Moodify to ECS..."

# Build and push new image
echo "🐳 Building Docker image..."
cd ..
docker build -t $ECR_REPO:latest .

echo "📤 Pushing to ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Force new deployment
echo "🔄 Updating ECS service..."
SERVICE_NAME=$(aws ecs list-services --cluster moodify-prod --region $REGION | jq -r '.serviceArns[0]' | cut -d'/' -f3)

if [ ! -z "$SERVICE_NAME" ]; then
  aws ecs update-service \
    --cluster moodify-prod \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $REGION
  
  echo "✅ Deployment initiated! ECS will roll out the new version."
else
  echo "⚠️  No ECS service found. Run setup-aws.sh first."
fi

