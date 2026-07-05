variable "aws_region" {
  description = "AWS region for the demo host."
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Lightsail availability zone. Confirm it exists in aws_region before applying."
  type        = string
  default     = "us-east-1a"
}

variable "name_prefix" {
  description = "Short prefix used for Lightsail resource names."
  type        = string
  default     = "pulseboard-demo"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{2,40}$", var.name_prefix))
    error_message = "name_prefix must be 3-41 lowercase letters, numbers, or hyphens, starting with a letter or number."
  }
}

variable "blueprint_id" {
  description = "Lightsail OS blueprint. Check with: aws lightsail get-blueprints --region <region>."
  type        = string
  default     = "ubuntu_22_04"
}

variable "bundle_id" {
  description = "Lightsail instance bundle. Keep this small for the portfolio demo."
  type        = string
  default     = "nano_3_0"
}

variable "ssh_public_key" {
  description = "Public SSH key material for the deploy operator. Never put a private key here."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^ssh-(rsa|ed25519) ", var.ssh_public_key))
    error_message = "ssh_public_key must be an OpenSSH public key such as ssh-ed25519 ... or ssh-rsa ...."
  }
}

variable "ssh_allowed_cidrs" {
  description = "CIDR ranges allowed to reach SSH. Replace the example with your current public IP /32 before applying."
  type        = list(string)
}

variable "enable_http" {
  description = "Open port 80 after reverse proxy configuration is ready."
  type        = bool
  default     = false
}

variable "enable_https" {
  description = "Open port 443 after TLS configuration is ready."
  type        = bool
  default     = false
}

variable "attach_static_ip" {
  description = "Attach a Lightsail static IP for a stable DNS target. Disable until DNS/TLS rehearsal is approved."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags applied to AWS resources."
  type        = map(string)
  default = {
    Project     = "PulseBoard"
    Environment = "demo"
    ManagedBy   = "Terraform"
  }
}
