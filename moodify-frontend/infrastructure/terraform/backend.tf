terraform {
  backend "s3" {
    bucket         = "moodify-terraform-state-539247485597"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "moodify-terraform-locks"
    encrypt        = true
  }
}
