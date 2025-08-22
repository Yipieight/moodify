# Main Terraform configuration for MOODIFY deployment on AWS

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "MOODIFY"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  name_prefix        = local.name_prefix
  cidr_block        = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
  
  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "./modules/security"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  
  tags = local.common_tags
}

# ALB Module
module "alb" {
  source = "./modules/alb"
  
  name_prefix         = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  security_group_ids = [module.security_groups.alb_security_group_id]
  
  tags = local.common_tags
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  
  name_prefix              = local.name_prefix
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  security_group_ids      = [module.security_groups.ecs_security_group_id]
  target_group_arn        = module.alb.target_group_arn
  
  # Container configuration
  container_image = var.container_image
  container_port  = var.container_port
  
  # Environment variables
  environment_variables = var.environment_variables
  secrets = var.secrets
  
  # Scaling
  desired_count = var.desired_count
  min_capacity  = var.min_capacity
  max_capacity  = var.max_capacity
  
  tags = local.common_tags
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  name_prefix      = local.name_prefix
  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_name = module.ecs.service_name
  
  tags = local.common_tags
}

# Route53 Module (Optional)
module "route53" {
  source = "./modules/route53"
  count  = var.domain_name != "" ? 1 : 0
  
  domain_name    = var.domain_name
  alb_dns_name   = module.alb.dns_name
  alb_zone_id    = module.alb.zone_id
  
  tags = local.common_tags
}