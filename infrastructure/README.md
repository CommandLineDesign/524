# Infrastructure Overview

This directory houses deployment automation, environment configuration, and cloud infrastructure definitions for the 524 platform.

## Suggested Layout

- `terraform/` – IaC for AWS/Naver Cloud (VPC, RDS, ECS/EKS, CloudFront)
- `docker/` – Base images and multi-stage Dockerfiles for each package
- `ci/` – GitHub Actions workflows and reusable jobs
- `k8s/` – Kubernetes manifests or Helm charts (if applicable)

Populate each folder as infrastructure work begins. Reference the technical specification for required services (PostgreSQL, Redis, S3, FCM, Kafka, etc.).

