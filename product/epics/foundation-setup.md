# Foundation Setup

**Category**: Foundation

**Priority**: Critical

**Status**: 📝 In Progress

**Dependencies**:

- None

**Estimated Effort**: Small (1-2 sprints)

## Description

This epic establishes the core technical foundation for the 524 Beauty Marketplace. It includes setting up the monorepo structure, configuring the development environment, establishing CI/CD pipelines, and preparing the base infrastructure for deployment. A solid foundation is crucial for enabling parallel development across mobile, web, and backend teams while ensuring code quality and consistency.

## Key Components

- **Monorepo Structure**: Workspace configuration for managing mobile, web, api, and shared packages.
- **Development Environment**: Docker Compose setup for local development (PostgreSQL, Redis).
- **CI/CD Pipelines**: Automated testing, linting, and build workflows.
- **Infrastructure as Code**: Terraform or similar configuration for AWS/Naver Cloud resources.
- **Base Shared Libraries**: Common types, constants, and utilities used across the platform.

## Acceptance Criteria

- [x] Monorepo initialized with `mobile`, `web`, `api`, `shared`, `database` packages.
- [ ] Docker Compose file created and verified to spin up local database and cache.
- [x] CI pipeline configured to run linting and tests on pull requests.
- [x] Base TypeScript configuration (`tsconfig.base.json`) established and extended by all packages.
- [x] Pre-commit hooks (Husky) configured for linting and formatting.
- [ ] Cloud infrastructure provisioning scripts prepared for staging environment.

## Technical Requirements

- **Monorepo Tooling**: Turborepo or similar for efficient build caching.
- **Package Management**: pnpm or yarn workspaces.
- **Database**: PostgreSQL 15+ with PostGIS extension.
- **Cache**: Redis 7+.
- **Node Version**: Node.js 20 LTS.

## User Stories

- [Navigation Reconsideration](../stories/navigation-reconsideration.md): Evaluate whether to re-build or remove the current navigation system

## Risks and Assumptions

- **Risk**: CI build times may increase as the repository grows.
- **Assumption**: Team is familiar with the chosen monorepo tooling.
- **Assumption**: AWS/Naver Cloud credentials and permissions are available.

## Notes

- The project structure currently exists but needs verification of CI/CD and Docker setups.
- Ensure `shared` package is properly linked and watched during development.
