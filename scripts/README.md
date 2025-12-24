# Repository Scripts

Utility scripts for bootstrapping and maintaining the 524 monorepo.

## Available Scripts

### Deployment Scripts

- `deploy-vercel.sh` – Check Vercel deployment status and provide setup guidance

### Development Scripts

- `bootstrap.mjs` – Bootstrap the monorepo with dependencies and environment setup
- `dev-api.sh` – Start the API server in development mode
- `setup-env.sh` – Set up environment variables for local development
- `generate-secrets.sh` – Generate secure secrets for JWT and encryption

> **Note**: For database inspection and debugging, use the Neon MCP tools available in Cursor instead of creating ad-hoc scripts.

### Suggested Future Scripts

- `setup.mjs` – install dependencies, generate env files, and prepare local dev services
- `db-migrate.mjs` – run Drizzle migrations across environments
- `lint-all.mjs` – orchestrate formatting/linting across packages
- `release.mjs` – coordinate version bumps and changelog generation

Add scripts as `.mjs` or `.ts` modules and document usage within this directory.

