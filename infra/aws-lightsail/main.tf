locals {
  instance_name = "${var.name_prefix}-app"
  key_pair_name = "${var.name_prefix}-deploy"

  ssh_port = [{
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = var.ssh_allowed_cidrs
  }]

  http_port = var.enable_http ? [{
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]
  }] : []

  https_port = var.enable_https ? [{
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]
  }] : []

  public_ports = concat(local.ssh_port, local.http_port, local.https_port)
}

resource "aws_lightsail_key_pair" "deploy" {
  name       = local.key_pair_name
  public_key = var.ssh_public_key
}

resource "aws_lightsail_instance" "app" {
  name              = local.instance_name
  availability_zone = var.availability_zone
  blueprint_id      = var.blueprint_id
  bundle_id         = var.bundle_id
  key_pair_name     = aws_lightsail_key_pair.deploy.name
  user_data = templatefile("${path.module}/cloud-init.sh.tftpl", {
    enable_http  = var.enable_http
    enable_https = var.enable_https
  })
}

resource "aws_lightsail_instance_public_ports" "app" {
  instance_name = aws_lightsail_instance.app.name

  dynamic "port_info" {
    for_each = local.public_ports

    content {
      protocol  = port_info.value.protocol
      from_port = port_info.value.from_port
      to_port   = port_info.value.to_port
      cidrs     = port_info.value.cidrs
    }
  }
}

resource "aws_lightsail_static_ip" "app" {
  count = var.attach_static_ip ? 1 : 0

  name = "${var.name_prefix}-static-ip"
}

resource "aws_lightsail_static_ip_attachment" "app" {
  count = var.attach_static_ip ? 1 : 0

  static_ip_name = aws_lightsail_static_ip.app[0].name
  instance_name  = aws_lightsail_instance.app.name
}
