output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Route53 name servers"
  value       = data.aws_route53_zone.main.name_servers
}

output "record_fqdn" {
  description = "FQDN of the main A record"
  value       = aws_route53_record.main.fqdn
}

output "www_record_fqdn" {
  description = "FQDN of the www A record"
  value       = var.enable_www_redirect ? aws_route53_record.www[0].fqdn : null
}