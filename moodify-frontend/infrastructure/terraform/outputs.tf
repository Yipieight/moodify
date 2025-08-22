# Outputs for MOODIFY Terraform configuration

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.zone_id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.arn
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = module.ecs.task_definition_arn
}

output "application_url" {
  description = "URL to access the application"
  value       = var.domain_name != "" && length(module.route53) > 0 ? "https://${var.domain_name}" : "http://${module.alb.dns_name}"
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = module.cloudwatch.log_group_name
}

output "security_group_ids" {
  description = "Security group IDs"
  value = {
    alb = module.security_groups.alb_security_group_id
    ecs = module.security_groups.ecs_security_group_id
  }
}