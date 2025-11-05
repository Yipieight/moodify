#!/bin/bash
# AWS ECS Deployment Setup Script for Moodify
set -e

# Configuration
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="moodify"
PROJECT="moodify"

echo "🚀 Moodify AWS ECS Deployment Setup"
echo "======================================"
echo "Account ID: $ACCOUNT_ID"
echo "Region: $REGION"
echo ""

# Step 1: Create ECR Repository
echo "📦 Step 1: Creating ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $REGION 2>/dev/null || \
aws ecr create-repository \
  --repository-name $ECR_REPO \
  --region $REGION \
  --image-scanning-configuration scanOnPush=true

# Step 2: Create AWS Secrets
echo "🔐 Step 2: Creating AWS Secrets Manager entries..."

# Read .env file values
if [ -f "../.env" ]; then
  source ../.env
  
  # Create secrets
  aws secretsmanager create-secret \
    --name "$PROJECT/database-url" \
    --secret-string "$DATABASE_URL" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$PROJECT/database-url" \
    --secret-string "$DATABASE_URL" \
    --region $REGION

  aws secretsmanager create-secret \
    --name "$PROJECT/nextauth-secret" \
    --secret-string "$NEXTAUTH_SECRET" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$PROJECT/nextauth-secret" \
    --secret-string "$NEXTAUTH_SECRET" \
    --region $REGION

  aws secretsmanager create-secret \
    --name "$PROJECT/nextauth-url" \
    --secret-string "${NEXTAUTH_URL:-https://your-domain.com}" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$PROJECT/nextauth-url" \
    --secret-string "${NEXTAUTH_URL:-https://your-domain.com}" \
    --region $REGION

  aws secretsmanager create-secret \
    --name "$PROJECT/spotify-client-id" \
    --secret-string "$NEXT_PUBLIC_SPOTIFY_CLIENT_ID" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$PROJECT/spotify-client-id" \
    --secret-string "$NEXT_PUBLIC_SPOTIFY_CLIENT_ID" \
    --region $REGION

  aws secretsmanager create-secret \
    --name "$PROJECT/spotify-client-secret" \
    --secret-string "$SPOTIFY_CLIENT_SECRET" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$PROJECT/spotify-client-secret" \
    --secret-string "$SPOTIFY_CLIENT_SECRET" \
    --region $REGION

  echo "✅ Secrets created/updated"
else
  echo "⚠️  .env file not found at ../env"
  echo "Creating .env from env.example.txt..."
  if [ -f "../env.example.txt" ]; then
    cp ../env.example.txt ../.env
    echo "📝 Please edit .env file with your actual values and run this script again."
    exit 1
  else
    echo "❌ env.example.txt not found. Please create .env manually."
    exit 1
  fi
fi

# Step 3: Build and Push Docker Image
echo "🐳 Step 3: Building and pushing Docker image..."
cd ..

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build image
docker build -t $ECR_REPO:latest \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  .

# Tag and push
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

echo "✅ Docker image pushed to ECR"

# Step 4: Setup Terraform Backend
echo "🏗️  Step 4: Setting up Terraform backend..."
cd infrastructure/terraform

# Create S3 bucket for Terraform state
aws s3 mb s3://$PROJECT-terraform-state-$ACCOUNT_ID --region $REGION 2>/dev/null || true
aws s3api put-bucket-versioning \
  --bucket $PROJECT-terraform-state-$ACCOUNT_ID \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name $PROJECT-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION 2>/dev/null || true

echo "✅ Terraform backend ready"

# Step 5: Create terraform.tfvars
echo "📝 Step 5: Creating terraform.tfvars..."
cat > terraform.tfvars <<EOF
aws_region      = "$REGION"
environment     = "prod"
project_name    = "$PROJECT"
container_image = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest"

secrets = [
  {
    name      = "DATABASE_URL"
    valueFrom = "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/database-url"
  },
  {
    name      = "NEXTAUTH_SECRET"
    valueFrom = "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/nextauth-secret"
  },
  {
    name      = "NEXTAUTH_URL"
    valueFrom = "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/nextauth-url"
  },
  {
    name      = "NEXT_PUBLIC_SPOTIFY_CLIENT_ID"
    valueFrom = "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/spotify-client-id"
  },
  {
    name      = "SPOTIFY_CLIENT_SECRET"
    valueFrom = "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:$PROJECT/spotify-client-secret"
  }
]
EOF

# Create backend.tf
cat > backend.tf <<EOF
terraform {
  backend "s3" {
    bucket         = "$PROJECT-terraform-state-$ACCOUNT_ID"
    key            = "prod/terraform.tfstate"
    region         = "$REGION"
    dynamodb_table = "$PROJECT-terraform-locks"
    encrypt        = true
  }
}
EOF

echo "✅ Terraform configuration created"

echo ""
echo "======================================"
echo "✅ AWS Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. cd infrastructure/terraform"
echo "2. terraform init"
echo "3. terraform plan"
echo "4. terraform apply"
echo ""
echo "Your app will be available at the ALB DNS name (shown after apply)"

