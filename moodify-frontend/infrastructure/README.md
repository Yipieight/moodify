# MOODIFY - AWS Deployment Configuration

This directory contains all the necessary configurations for deploying MOODIFY to AWS using a modern containerized infrastructure.

## 🏗️ Architecture Overview

```
Internet → ALB → ECS Fargate Tasks → Application
              ↓
        CloudWatch Logs & Metrics
              ↓
        CloudWatch Alarms → SNS (optional)
```

### Components

- **Amazon ECS Fargate**: Serverless container hosting
- **Application Load Balancer**: Traffic distribution and SSL termination
- **Amazon ECR**: Docker image registry
- **VPC with NAT Gateways**: Secure network architecture
- **CloudWatch**: Comprehensive monitoring and logging
- **AWS Secrets Manager**: Secure configuration management
- **Route53**: DNS management (optional)
- **ACM**: SSL/TLS certificates (optional)

## 📋 Prerequisites

### 1. AWS Account Setup
- Active AWS account with programmatic access
- AWS CLI installed and configured
- Appropriate IAM permissions (see `docs/aws-deployment.md`)

### 2. Development Tools
- Docker Desktop
- Node.js 18+
- Terraform (optional, for infrastructure management)
- Git

### 3. Environment Configuration
- Spotify Developer Account for API access
- Domain name (optional, for custom domain)
- SSL certificate (optional, via ACM)

## 🚀 Quick Start

### Option 1: Automated Deployment

```bash
# 1. Clone and prepare the project
git clone <repository-url>
cd moodify-frontend

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# 3. Run automated deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh full
```

### Option 2: Step-by-Step Deployment

#### Step 1: Prepare Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with your actual values
nano .env.production
```

#### Step 2: Create AWS Resources

```bash
# Create ECR repository
aws ecr create-repository --repository-name moodify --region us-east-1

# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name "moodify/nextauth-secret" \
  --secret-string "your-secure-nextauth-secret"

aws secretsmanager create-secret \
  --name "moodify/spotify-client-id" \
  --secret-string "your-spotify-client-id"

aws secretsmanager create-secret \
  --name "moodify/spotify-client-secret" \
  --secret-string "your-spotify-client-secret"
```

#### Step 3: Deploy Infrastructure (Terraform)

```bash
cd infrastructure/terraform

# Copy and customize configuration
cp terraform.tfvars.example terraform.tfvars
cp backend.tf.example backend.tf
# Edit both files with your AWS account details

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

#### Step 4: Build and Deploy Application

```bash
# Build and push Docker image
./scripts/deploy.sh build

# Deploy application to ECS
./scripts/deploy.sh deploy
```

## 📁 File Structure

```
infrastructure/
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                  # Main configuration
│   ├── variables.tf             # Variable definitions
│   ├── outputs.tf               # Output values
│   ├── backend.tf.example       # State backend config
│   ├── terraform.tfvars.example # Variable values template
│   ├── ecs-task-definition.json # ECS task template
│   └── modules/                 # Terraform modules
│       ├── vpc/                 # Network infrastructure
│       ├── ecs/                 # Container orchestration
│       ├── alb/                 # Load balancer
│       ├── security/            # Security groups
│       ├── cloudwatch/          # Monitoring
│       └── route53/             # DNS management
├── .github/workflows/           # CI/CD pipelines
│   └── deploy.yml              # GitHub Actions workflow
├── scripts/                    # Deployment scripts
│   └── deploy.sh              # Main deployment script
├── Dockerfile                 # Container definition
├── docker-compose.yml         # Local testing
├── .dockerignore             # Docker build exclusions
└── .env.example              # Environment template
```

## ⚙️ Configuration Options

### Environment Variables

Required for deployment:
- `NEXTAUTH_SECRET`: Secure random string for NextAuth
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`: Spotify client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify client secret

Optional:
- `NEXTAUTH_URL`: Application URL (auto-detected in production)
- `LOG_LEVEL`: Logging level (info, debug, error)

### Terraform Variables

Key configuration options in `terraform.tfvars`:

```hcl
# Basic configuration
aws_region = "us-east-1"
environment = "prod"
project_name = "moodify"

# Container configuration
container_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/moodify:latest"
desired_count = 2
cpu = 512
memory = 1024

# Custom domain (optional)
domain_name = "moodify.yourdomain.com"
certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The deployment includes a comprehensive CI/CD pipeline:

1. **Test Stage**: Linting, type checking, unit tests
2. **Security Stage**: Vulnerability scanning with Trivy
3. **Build Stage**: Docker image build and push to ECR
4. **Deploy Stage**: ECS service update
5. **Infrastructure Stage**: Terraform apply (on main branch)

### Required GitHub Secrets

Set these in your repository settings:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `ECR_REGISTRY`

## 📊 Monitoring and Observability

### CloudWatch Integration

- **Application Logs**: Structured logging to CloudWatch
- **Metrics**: CPU, memory, task count monitoring
- **Alarms**: Automated alerts for issues
- **Dashboard**: Real-time system overview

### Health Checks

- **Load Balancer**: HTTP health checks at `/api/health`
- **Container**: Built-in health check endpoint
- **ECS**: Service-level health monitoring

### Alerting

Configure SNS notifications:
```hcl
enable_sns_notifications = true
alert_email = "ops@yourdomain.com"
```

## 🔧 Maintenance and Operations

### Scaling

**Auto Scaling**: Configured for CPU/Memory thresholds
**Manual Scaling**:
```bash
./scripts/deploy.sh scale 5  # Scale to 5 tasks
```

### Updates and Rollbacks

**Deploy New Version**:
```bash
./scripts/deploy.sh deploy
```

**Rollback**:
```bash
./scripts/deploy.sh rollback
```

### Log Access

```bash
# View recent logs
aws logs tail /ecs/moodify-prod --follow

# Search logs
aws logs filter-log-events \
  --log-group-name /ecs/moodify-prod \
  --filter-pattern "ERROR"
```

## 🛡️ Security Considerations

### Network Security
- Private subnets for application containers
- Security groups with minimal required access
- HTTPS enforcement via ALB

### Secret Management
- All sensitive data in AWS Secrets Manager
- IAM roles with least privilege access
- No secrets in container images or code

### Container Security
- Non-root container execution
- Regular image vulnerability scanning
- Resource limits and constraints

## 💰 Cost Optimization

### Resource Management
- **Fargate Spot**: Consider for non-critical environments
- **Reserved Capacity**: For predictable workloads
- **Right-sizing**: Monitor and adjust CPU/memory allocation

### Monitoring Costs
```bash
# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 🆘 Troubleshooting

### Common Issues

1. **Task Startup Failures**
   ```bash
   aws ecs describe-services --cluster moodify-prod-cluster --services moodify-prod-service
   aws logs tail /ecs/moodify-prod --since 1h
   ```

2. **Health Check Failures**
   ```bash
   curl -f http://ALB_DNS_NAME/api/health
   ```

3. **High CPU/Memory**
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/ECS \
     --metric-name CPUUtilization \
     --dimensions Name=ServiceName,Value=moodify-prod-service \
     --start-time 2024-01-01T00:00:00Z \
     --end-time 2024-01-01T23:59:59Z \
     --period 3600 \
     --statistics Average
   ```

### Support Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Project Documentation](../docs/)

---

For detailed deployment instructions, see [`docs/aws-deployment.md`](../docs/aws-deployment.md).