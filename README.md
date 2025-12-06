# 524 Beauty Services Marketplace

Bootstrap workspace for the 524 Korean beauty services marketplace platform described in `ai/context/524-technical-specification.md` and `ai/context/beauty-marketplace-screens (2).md`.

## Monorepo Layout

- `packages/api` – Node.js/Express REST API (TypeScript)
- `packages/web` – Next.js 14 provider dashboard & admin interface
- `packages/mobile` – Expo (React Native) mobile application for customers & artists
- `packages/shared` – Shared utilities, constants, and types
- `packages/database` – Drizzle ORM schema & migrations tooling
- `packages/notifications` – Firebase Cloud Messaging helpers

## Getting Started

```bash
pnpm install

pnpm --filter @524/api dev
pnpm --filter @524/web dev
pnpm --filter @524/mobile start
```

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment Variables
```bash
# Run the setup script to create all .env files
./scripts/setup-env.sh

# Then edit each .env file with your actual API keys
# See ENV_CHECKLIST.md for what you need to set up
```

### 3. Setup Database
```bash
# Make sure PostgreSQL and Redis are running locally
# Then run migrations
pnpm --filter @524/database db:migrate
```

### 4. Start Development Servers
```bash
# Start API server (port 5240)
pnpm --filter @524/api dev

# Start web dashboard (port 5241)
pnpm --filter @524/web dev

# Start mobile app (Expo Metro on port 5242)
pnpm --filter @524/mobile start
```

## Quality checks

- Lint: `pnpm lint`
- Format write: `pnpm format`
- Format check: `pnpm format:check`
- Typecheck: `pnpm typecheck`
- One-off Biome check+fix: `pnpm check:fix`

## Git hooks

- Install hooks (runs automatically via `pnpm install` or manually): `pnpm lefthook install`
- Pre-commit runs Biome on staged files and typechecks
- Pre-push runs lint, format check, and typecheck

## Environment Setup

📝 **See these files for detailed setup instructions:**
- **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - Quick overview of what we've set up
- **[ENV_CHECKLIST.md](./ENV_CHECKLIST.md)** - Interactive checklist to track your progress
- **[docs/ENV_SETUP.md](./docs/ENV_SETUP.md)** - Detailed setup guide with examples

### Required Services
- **Kakao** (OAuth, Maps, Pay)
- **Naver** (OAuth, Maps, Cloud SENS for SMS)
- **Toss** (Payments)
- **PostgreSQL** (Database)
- **Redis** (Cache)
- **AWS S3** (File storage)

### Next Steps

- Complete environment variable setup (see checklist above)
- Implement remaining API routes per technical specification
- Expand Drizzle schemas for all entities
- Integrate React Query/Zustand state management
- Configure testing pipelines (Vitest/Cypress)
- Set up CI/CD (GitHub Actions)



