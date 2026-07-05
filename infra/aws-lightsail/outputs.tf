output "instance_name" {
  description = "Lightsail instance name."
  value       = aws_lightsail_instance.app.name
}

output "public_ip" {
  description = "Static IP when enabled, otherwise the instance public IP."
  value       = var.attach_static_ip ? aws_lightsail_static_ip.app[0].ip_address : aws_lightsail_instance.app.public_ip_address
}

output "ssh_command" {
  description = "Operator SSH command."
  value       = "ssh ubuntu@${var.attach_static_ip ? aws_lightsail_static_ip.app[0].ip_address : aws_lightsail_instance.app.public_ip_address}"
}

output "local_health_check" {
  description = "Health check to run from the instance after Docker Compose is started."
  value       = "curl -fsS http://127.0.0.1:4000/health/ready"
}

output "public_api_note" {
  description = "Reminder for public exposure."
  value       = var.enable_https ? "Point api.demo.anlan.store only after reverse proxy, TLS, rollback, and budget checks pass." : "Public HTTPS is disabled. Keep verification local-on-server or through an SSH tunnel."
}
