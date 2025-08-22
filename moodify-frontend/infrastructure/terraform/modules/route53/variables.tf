variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB zone ID"
  type        = string
}

variable "enable_ipv6" {
  description = "Enable IPv6 AAAA record"
  type        = bool
  default     = false
}

variable "enable_www_redirect" {
  description = "Enable www subdomain"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}