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
npm install
# or: npm install --workspaces --include-workspace-root

npm run dev --workspace @524/api
npm run dev --workspace @524/web
npm run start --workspace @524/mobile
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
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
npm run db:migrate --workspace @524/database
```

### 4. Start Development Servers
```bash
# Start API server (port 3000)
npm run dev --workspace @524/api

# Start web dashboard (port 3001)
npm run dev --workspace @524/web

# Start mobile app
npm run start --workspace @524/mobile
```

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


