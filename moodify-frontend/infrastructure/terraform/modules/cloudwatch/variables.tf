variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "enable_sns_notifications" {
  description = "Enable SNS notifications for alarms"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

variable "enable_dashboard" {
  description = "Enable CloudWatch dashboard"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}