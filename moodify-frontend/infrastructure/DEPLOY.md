# AWS ECS Deployment

## Quick Deploy (3 commands)

```bash
# 1. Setup AWS resources (one time)
./setup-aws.sh

# 2. Deploy infrastructure
cd terraform
terraform init
terraform apply

# 3. Done! Get your URL
terraform output alb_dns_name
```

## Update App

```bash
./deploy.sh
```

## Requirements

- AWS CLI configured
- Docker installed
- Terraform installed
- `.env` file with all secrets

## Cost

~$80-100/month for production setup

