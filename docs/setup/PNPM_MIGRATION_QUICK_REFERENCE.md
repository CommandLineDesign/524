# PNPM Migration Quick Reference

## TL;DR

✅ **Safe to migrate** - Vercel fully supports pnpm. Main work is updating config files.

## Key Changes Required

### 1. Root Configuration
- Update `package.json`: Change `packageManager` to `pnpm@9.0.0`
- Create `pnpm-workspace.yaml` with `packages: ['packages/*']`
- Update all root scripts to use `pnpm --filter` instead of `npm run --workspace`

### 2. Vercel Configuration Files
- **`packages/api/vercel.json`**: Change install/build commands to pnpm
- **`packages/mobile/vercel.json`**: Change install/build commands to pnpm
- **Vercel Dashboard** (`524-admin-web`): Update install command to pnpm

### 3. Build Scripts
- **`packages/api/package.json`**: Update `vercel-build` script to use pnpm filters
- **`scripts/dev-api.sh`**: Change `npm run dev` to `pnpm run dev`
- **`scripts/bootstrap.mjs`**: Change `npm install` to `pnpm install`

## Migration Command Sequence

```bash
# 1. Install pnpm
corepack enable
corepack prepare pnpm@latest --activate

# 2. Create workspace config
echo "packages:\n  - 'packages/*'" > pnpm-workspace.yaml

# 3. Update package.json (see full assessment for details)
# ... edit package.json ...

# 4. Remove npm lockfile
rm package-lock.json

# 5. Install with pnpm
pnpm install

# 6. Test locally
pnpm run build
pnpm run dev

# 7. Commit and push to feature branch
git add .
git commit -m "chore: migrate from npm to pnpm"
git push origin feature/pnpm-migration
```

## Vercel Install Commands

| Project | Install Command |
|---------|----------------|
| 524-api | `cd ../.. && pnpm install --frozen-lockfile` |
| 524-admin-web | `cd ../.. && pnpm install --frozen-lockfile` |
| 524-mobile-web | `cd ../.. && pnpm install --frozen-lockfile` |

## Script Translation Guide

| npm | pnpm |
|-----|------|
| `npm run build --workspace @524/api` | `pnpm --filter @524/api build` |
| `npm run --workspaces --if-present build` | `pnpm --filter './packages/*' run build` |
| `npx expo` | `pnpm exec expo` |
| `npm install` | `pnpm install` |
| `npm install --frozen-lockfile` | `pnpm install --frozen-lockfile` |

## Risk Level: LOW ✅

- Vercel has native pnpm support
- All three projects are compatible
- Main risk is configuration errors (mitigated by testing in preview)

## Full Details

See **[PNPM_VERCEL_MIGRATION_ASSESSMENT.md](./PNPM_VERCEL_MIGRATION_ASSESSMENT.md)** for complete analysis, step-by-step migration guide, rollback plan, and verification checklist.
