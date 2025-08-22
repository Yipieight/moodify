# AWS Deployment Guide for MOODIFY

This guide provides comprehensive instructions for deploying MOODIFY to AWS using containerized infrastructure.

## Architecture Overview

The deployment uses the following AWS services:
- **ECS Fargate**: Serverless container hosting
- **Application Load Balancer (ALB)**: Load balancing and HTTPS termination
- **ECR**: Docker image registry
- **VPC**: Network isolation with public/private subnets
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Secure secret storage
- **Route53**: DNS management (optional)
- **ACM**: SSL/TLS certificates (optional)

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured
3. **Docker**: For building container images
4. **Terraform**: For infrastructure as code (optional but recommended)
5. **Git**: For version control and CI/CD

### Required AWS Permissions

Ensure your AWS user/role has the following permissions:
- ECS full access
- ECR full access
- VPC management
- Application Load Balancer management
- CloudWatch logs
- Secrets Manager
- IAM role creation

## Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Full deployment (infrastructure + application)
./scripts/deploy.sh full

# Or deploy in stages
./scripts/deploy.sh build
./scripts/deploy.sh infrastructure
./scripts/deploy.sh deploy
```

### Option 2: Manual Step-by-Step

#### Step 1: Set Up Environment Variables

```bash
# Copy environment template
cp .env.example .env.production

# Edit with your values
vim .env.production
```

#### Step 2: Create ECR Repository

```bash
aws ecr create-repository --repository-name moodify --region us-east-1
```

#### Step 3: Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t moodify .

# Tag and push
docker tag moodify:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/moodify:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/moodify:latest
```

#### Step 4: Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region = "us-east-1"
environment = "prod"
project_name = "moodify"
container_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/moodify:latest"
domain_name = "yourdomain.com"  # Optional
certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"  # Optional
EOF

# Plan and apply
terraform plan
terraform apply
```

#### Step 5: Store Secrets in AWS Secrets Manager

```bash
# NextAuth secret
aws secretsmanager create-secret \
  --name "moodify/nextauth-secret" \
  --secret-string "your-nextauth-secret"

# Spotify credentials
aws secretsmanager create-secret \
  --name "moodify/spotify-client-id" \
  --secret-string "your-spotify-client-id"

aws secretsmanager create-secret \
  --name "moodify/spotify-client-secret" \
  --secret-string "your-spotify-client-secret"
```

## CI/CD with GitHub Actions

### Setup

1. **Fork/Clone the repository**
2. **Set GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `ECR_REGISTRY`

3. **Push to main branch** to trigger deployment

### Workflow Features

- **Automated testing**: Runs linting, type checking, and unit tests
- **Security scanning**: Uses Trivy for vulnerability scanning
- **Infrastructure deployment**: Manages AWS resources with Terraform
- **Container deployment**: Builds and deploys to ECS
- **Health checks**: Verifies deployment success

## Monitoring and Logging

### CloudWatch Logs

Application logs are available in CloudWatch:
```bash
aws logs tail /ecs/moodify-prod --follow
```

### CloudWatch Metrics

Monitor key metrics:
- CPU utilization
- Memory utilization
- Request count
- Response time
- Error rates

### Alerts

Set up CloudWatch alarms for:
- High CPU/Memory usage
- Application errors
- Service unavailability

## Scaling Configuration

### Auto Scaling

The ECS service includes auto-scaling based on:
- **CPU utilization**: Target 70%
- **Memory utilization**: Target 80%
- **Custom metrics**: Request count, response time

### Manual Scaling

```bash
# Scale to 5 tasks
aws ecs update-service \
  --cluster moodify-prod-cluster \
  --service moodify-prod-service \
  --desired-count 5
```

## Security Best Practices

### Network Security

- **VPC**: Application runs in private subnets
- **Security Groups**: Restrictive ingress/egress rules
- **ALB**: Public internet access only through load balancer

### Secret Management

- **AWS Secrets Manager**: All sensitive data stored securely
- **IAM Roles**: Least privilege access
- **Encryption**: At rest and in transit

### Container Security

- **Image scanning**: Trivy security scanning in CI/CD
- **Non-root user**: Container runs as non-privileged user
- **Resource limits**: CPU and memory constraints

## Backup and Disaster Recovery

### Application Data

Since MOODIFY uses client-side storage:
- No database backups required
- User data stored locally in browsers
- Stateless application design

### Infrastructure

- **Terraform state**: Store in S3 with versioning
- **Container images**: ECR provides high availability
- **Multi-AZ deployment**: Load balancer and tasks across AZs

## Troubleshooting

### Common Issues

1. **Task won't start**:
   ```bash
   aws ecs describe-services --cluster moodify-prod-cluster --services moodify-prod-service
   aws logs tail /ecs/moodify-prod --since 1h
   ```

2. **Health check failures**:
   ```bash
   curl -f http://ALB_DNS_NAME/api/health
   ```

3. **Secret access issues**:
   ```bash
   aws secretsmanager get-secret-value --secret-id moodify/nextauth-secret
   ```

### Rollback Procedure

```bash
# Using deployment script
./scripts/deploy.sh rollback

# Manual rollback
aws ecs update-service \
  --cluster moodify-prod-cluster \
  --service moodify-prod-service \
  --task-definition moodify-prod-task:PREVIOUS_REVISION
```

## Cost Optimization

### Resource Sizing

- **Fargate**: Right-size CPU/memory based on usage
- **Load Balancer**: Consider Application vs Network Load Balancer
- **NAT Gateway**: Monitor data transfer costs

### Monitoring Costs

- Set up billing alerts
- Use AWS Cost Explorer
- Consider Reserved Instances for predictable workloads

## Maintenance

### Regular Tasks

1. **Security Updates**: Update base Docker image monthly
2. **Dependency Updates**: Keep Node.js dependencies current
3. **Infrastructure Updates**: Update Terraform providers
4. **Log Cleanup**: Manage CloudWatch log retention

### Scheduled Maintenance

- **Certificate Renewal**: ACM handles automatic renewal
- **Image Updates**: Regular security patches
- **Infrastructure Review**: Quarterly architecture review

## Support and Monitoring

### Health Endpoints

- **Application Health**: `https://yourdomain.com/api/health`
- **Load Balancer Health**: Check target group health in AWS Console

### Performance Monitoring

Consider integrating:
- AWS X-Ray for distributed tracing
- CloudWatch Synthetics for uptime monitoring
- Third-party APM tools (New Relic, Datadog)

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/fargate/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

For questions or issues, please refer to the project documentation or create an issue in the repository.