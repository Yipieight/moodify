# Variables for MOODIFY Terraform configuration

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "moodify"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Container Configuration
variable "container_image" {
  description = "Docker image URI for the application"
  type        = string
  default     = "moodify:latest"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

# ECS Configuration
variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU units for ECS task (256, 512, 1024, etc.)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory for ECS task in MB"
  type        = number
  default     = 1024
}

# Environment Variables
variable "environment_variables" {
  description = "Environment variables for the container"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "NODE_ENV"
      value = "production"
    },
    {
      name  = "PORT"
      value = "3000"
    }
  ]
}

# Secrets (stored in AWS Secrets Manager)
variable "secrets" {
  description = "Secrets for the container"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (optional)"
  type        = string
  default     = ""
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring and alerting"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}