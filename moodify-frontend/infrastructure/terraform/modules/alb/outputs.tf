output "arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "target_group_arn" {
  description = "Target group ARN"
  value       = aws_lb_target_group.main.arn
}

output "target_group_name" {
  description = "Target group name"
  value       = aws_lb_target_group.main.name
}

output "listener_http_arn" {
  description = "HTTP listener ARN"
  value       = aws_lb_listener.http.arn
}

output "listener_https_arn" {
  description = "HTTPS listener ARN (if certificate provided)"
  value       = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}