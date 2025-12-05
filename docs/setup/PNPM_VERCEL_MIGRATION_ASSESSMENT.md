# PNPM Migration Assessment for Vercel Deployments

## Executive Summary

**Status**: ✅ **SAFE TO MIGRATE** with proper configuration

Switching from npm to pnpm will **NOT** create deployment issues on Vercel, provided you:
1. Update Vercel project settings (install commands)
2. Update `vercel.json` files in packages
3. Update root `package.json` scripts
4. Add `pnpm-workspace.yaml` configuration
5. Update build scripts that reference npm

**Risk Level**: **LOW** - Vercel fully supports pnpm and monorepos. The main work is updating configuration files.

---

## Current State Analysis

### Package Manager Status
- **Current**: npm@10.9.0 (pinned in `package.json`)
- **Lockfile**: `package-lock.json` exists at root
- **Workspaces**: Configured using npm workspaces (`packages/*`)
- **No pnpm or yarn**: No existing pnpm-lock.yaml or yarn.lock files

### Vercel Project Configuration

#### 524-api (prj_OS1Y3ZykzWL8zHU3GeD9mp7otkHS)
- **Root Directory**: `packages/api`
- **Node Version**: 24.x
- **Framework**: null (custom)
- **Current Install Command**: `npm install --include=dev` (from `vercel.json`)
- **Current Build Command**: `npm run vercel-build` (from `vercel.json`)
- **Build Script**: Uses npm workspace commands:
  ```bash
  cd ../.. && npm run build --workspace @524/shared && npm run build --workspace @524/database && npm run build --workspace @524/notifications && npm run build --workspace @524/api && npm run build:vercel --workspace @524/api
  ```

#### 524-admin-web (prj_PynV9SusfRIiWaRdWQ9DzO7OVF94)
- **Root Directory**: `packages/web`
- **Node Version**: 24.x
- **Framework**: Next.js (auto-detected)
- **Current Install Command**: `npm install` (default from Vercel dashboard)
- **Current Build Command**: `npm run build` (default for Next.js)

#### 524-mobile-web (prj_72taeliMfntkc6xy6boqneSoc0FC)
- **Root Directory**: `packages/mobile`
- **Node Version**: 24.x
- **Framework**: null (custom Expo web)
- **Current Install Command**: `cd ../.. && npm install` (from `vercel.json`)
- **Current Build Command**: `cd ../.. && npm run build -w @524/shared && cd packages/mobile && npx expo export --platform web`

### Scripts Requiring Updates

**Root `package.json` scripts** (all use npm):
- `build`: `npm run --workspaces --if-present build`
- `lint`: `npm run --workspaces --if-present lint`
- `test`: `npm run --workspaces --if-present test`
- `dev`: Uses `npm run` commands
- `dev:api:direct`: `npm run dev --workspace @524/api`
- `dev:web`: `npm run dev --workspace @524/web`
- `dev:mobile`: `npm run start --workspace @524/mobile`

**Package-specific scripts**:
- `packages/api/package.json`: `vercel-build` script uses npm workspace commands
- `scripts/dev-api.sh`: Uses `npm run dev`
- `scripts/bootstrap.mjs`: Uses `npm install`
- `scripts/deploy-vercel.sh`: References npm in error message

---

## Vercel PNPM Support

### Official Support
✅ **Vercel fully supports pnpm** for monorepos:
- Auto-detects pnpm when `pnpm-lock.yaml` is present
- Supports `packageManager` field in `package.json`
- Works seamlessly with monorepo workspaces
- Supports `pnpm-workspace.yaml` configuration

### Key Requirements
1. **Lockfile**: `pnpm-lock.yaml` must exist at monorepo root
2. **Package Manager Field**: `packageManager` in root `package.json` should specify pnpm version
3. **Install Command**: Use `pnpm install --frozen-lockfile` for production builds
4. **Workspace Config**: `pnpm-workspace.yaml` at root (replaces npm workspaces)

### Vercel Auto-Detection
Vercel will automatically:
- Detect pnpm when `pnpm-lock.yaml` is present
- Use pnpm for installs if no explicit `installCommand` is set
- Respect `packageManager` field in `package.json`

---

## Required Configuration Changes

### 1. Root Package Configuration

**File**: `package.json`

**Changes**:
```json
{
  "packageManager": "pnpm@9.0.0",  // Update from npm@10.9.0
  "scripts": {
    "build": "pnpm --filter './packages/*' run build",
    "lint": "pnpm --filter './packages/*' run lint",
    "test": "pnpm --filter './packages/*' run test",
    "dev": "concurrently \"pnpm --filter @524/api dev\" \"pnpm --filter @524/web dev\" \"pnpm --filter @524/mobile start\" --names \"API,WEB,MOBILE\" --prefix-colors \"blue,green,yellow\"",
    "dev:api": "./scripts/dev-api.sh",
    "dev:api:direct": "pnpm --filter @524/api dev",
    "dev:web": "pnpm --filter @524/web dev",
    "dev:mobile": "pnpm --filter @524/mobile start"
  }
}
```

**Note**: Remove `workspaces` field (pnpm uses `pnpm-workspace.yaml` instead)

### 2. Create pnpm-workspace.yaml

**File**: `pnpm-workspace.yaml` (new file)

**Content**:
```yaml
packages:
  - 'packages/*'
```

### 3. Update API Vercel Configuration

**File**: `packages/api/vercel.json`

**Current**:
```json
{
  "version": 2,
  "installCommand": "npm install --include=dev",
  "buildCommand": "npm run vercel-build"
}
```

**Updated**:
```json
{
  "version": 2,
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run vercel-build"
}
```

### 4. Update API Build Script

**File**: `packages/api/package.json`

**Current**:
```json
{
  "scripts": {
    "vercel-build": "cd ../.. && npm run build --workspace @524/shared && npm run build --workspace @524/database && npm run build --workspace @524/notifications && npm run build --workspace @524/api && npm run build:vercel --workspace @524/api"
  }
}
```

**Updated**:
```json
{
  "scripts": {
    "vercel-build": "cd ../.. && pnpm --filter @524/shared build && pnpm --filter @524/database build && pnpm --filter @524/notifications build && pnpm --filter @524/api build && pnpm --filter @524/api build:vercel"
  }
}
```

### 5. Update Mobile Web Vercel Configuration

**File**: `packages/mobile/vercel.json`

**Current**:
```json
{
  "installCommand": "cd ../.. && npm install",
  "buildCommand": "cd ../.. && npm run build -w @524/shared && cd packages/mobile && npx expo export --platform web"
}
```

**Updated**:
```json
{
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm --filter @524/shared build && cd packages/mobile && pnpm exec expo export --platform web"
}
```

### 6. Update Admin Web Vercel Settings

**Action**: Update in Vercel Dashboard

**Project**: `524-admin-web`

**Settings to Update**:
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run build` (or leave default, Next.js will auto-detect)

**Note**: Next.js projects can use default build command if install command is set correctly.

### 7. Update Development Scripts

**File**: `scripts/dev-api.sh`

**Change**:
```bash
# Line 28: Change from
npm run dev
# To
pnpm run dev
```

**File**: `scripts/bootstrap.mjs`

**Change**:
```javascript
// Line 16: Change from
run('npm install');
// To
run('pnpm install');
```

**File**: `scripts/deploy-vercel.sh`

**Change**:
```bash
# Update error message to mention pnpm as well
echo "❌ Vercel CLI not found. Install with: npm install -g vercel (or pnpm add -g vercel)"
```

---

## Migration Steps

### Phase 1: Local Setup (No Vercel Changes)

1. **Install pnpm globally** (if not already installed):
   ```bash
   npm install -g pnpm
   # Or using corepack (recommended)
   corepack enable
   corepack prepare pnpm@latest --activate
   ```

2. **Create pnpm-workspace.yaml** at root

3. **Update root package.json**:
   - Change `packageManager` to pnpm
   - Update all scripts to use pnpm
   - Remove `workspaces` field

4. **Update package-specific scripts**:
   - Update `packages/api/package.json` vercel-build script
   - Update `scripts/dev-api.sh`
   - Update `scripts/bootstrap.mjs`

5. **Remove npm lockfile**:
   ```bash
   rm package-lock.json
   ```

6. **Install dependencies with pnpm**:
   ```bash
   pnpm install
   ```

7. **Test locally**:
   ```bash
   pnpm run build
   pnpm run dev
   ```

8. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore: migrate from npm to pnpm"
   ```

### Phase 2: Update Vercel Configuration Files

1. **Update `packages/api/vercel.json`**
2. **Update `packages/mobile/vercel.json`**
3. **Commit vercel.json changes**

### Phase 3: Update Vercel Dashboard Settings

1. **524-admin-web project**:
   - Go to Project Settings → Build & Development Settings
   - Update Install Command: `cd ../.. && pnpm install --frozen-lockfile`
   - Save changes

2. **Verify other projects**:
   - Check that `524-api` and `524-mobile-web` use `vercel.json` (they should)
   - If dashboard settings override `vercel.json`, update them to match

### Phase 4: Test Deployments

1. **Push to a feature branch** (not main):
   ```bash
   git push origin feature/pnpm-migration
   ```

2. **Monitor preview deployments**:
   - Check build logs for all three projects
   - Verify install commands use pnpm
   - Verify builds complete successfully

3. **Test each deployment**:
   - API: Check health endpoint
   - Admin Web: Verify Next.js app loads
   - Mobile Web: Verify Expo web export works

4. **If successful, merge to main**:
   ```bash
   git checkout main
   git merge feature/pnpm-migration
   git push origin main
   ```

### Phase 5: Cleanup

1. **Update `.gitignore`** (already includes pnpm-lock.yaml, but verify):
   - Ensure `pnpm-lock.yaml` is NOT ignored
   - Ensure `package-lock.json` is ignored (if you want to prevent accidental npm usage)

2. **Update documentation**:
   - Update `VERCEL_DEPLOYMENT_GUIDE.md` with pnpm commands
   - Update `README.md` if it mentions npm

---

## Risk Assessment

### Low Risk Items ✅

1. **Vercel Compatibility**: Vercel has native pnpm support
2. **Monorepo Support**: pnpm workspaces are well-supported
3. **Next.js Compatibility**: Next.js works seamlessly with pnpm
4. **Expo Compatibility**: Expo supports pnpm (use `pnpm exec` instead of `npx`)

### Medium Risk Items ⚠️

1. **Build Script Dependencies**: The `vercel-build` script in API package has complex npm workspace commands that need careful translation to pnpm
   - **Mitigation**: Test thoroughly in preview deployment before merging

2. **Metro Config**: Mobile package uses Metro bundler which resolves node_modules differently
   - **Mitigation**: pnpm's node_modules structure is compatible, but verify Metro resolution works

3. **Team Adoption**: Team members need to switch to pnpm locally
   - **Mitigation**: Document the change, provide migration guide

### Potential Issues & Solutions

#### Issue 1: Workspace Dependency Resolution
**Problem**: pnpm uses a different node_modules structure (symlinks vs hoisting)

**Solution**: pnpm's workspace protocol (`workspace:*`) handles this automatically. File dependencies (`file:../database`) work the same way.

#### Issue 2: Build Order Dependencies
**Problem**: API build depends on shared, database, and notifications packages being built first

**Solution**: pnpm's `--filter` flag with dependency order works similarly to npm workspaces. The build script explicitly lists build order.

#### Issue 3: Expo CLI Commands
**Problem**: `npx expo` might not work with pnpm's node_modules structure

**Solution**: Use `pnpm exec expo` instead of `npx expo`

#### Issue 4: Vercel Dashboard Overrides
**Problem**: Dashboard settings might override `vercel.json` install commands

**Solution**: Ensure dashboard settings match `vercel.json`, or remove dashboard overrides to use `vercel.json`

---

## Rollback Plan

If deployment issues occur:

### Immediate Rollback (Before Merge)

1. **Revert git changes**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Restore npm lockfile**:
   ```bash
   git checkout main -- package-lock.json
   pnpm install  # Will fail, then:
   npm install
   ```

### Post-Deployment Rollback

1. **Revert Vercel Dashboard Settings**:
   - `524-admin-web`: Change install command back to `npm install`
   - Other projects: Revert `vercel.json` changes

2. **Revert package.json scripts**:
   - Restore npm-based scripts
   - Restore `workspaces` field
   - Change `packageManager` back to npm

3. **Remove pnpm files**:
   ```bash
   rm pnpm-lock.yaml
   rm pnpm-workspace.yaml
   ```

4. **Reinstall with npm**:
   ```bash
   npm install
   ```

5. **Redeploy**:
   - Push changes
   - Trigger manual redeploy in Vercel dashboard

---

## Verification Checklist

Before considering migration complete:

### Local Verification
- [ ] `pnpm install` completes without errors
- [ ] `pnpm run build` builds all packages successfully
- [ ] `pnpm run dev` starts all services
- [ ] API dev server runs and responds
- [ ] Web dev server runs and loads
- [ ] Mobile dev server runs (Expo)

### Vercel Preview Deployment
- [ ] API preview deployment builds successfully
- [ ] Admin Web preview deployment builds successfully
- [ ] Mobile Web preview deployment builds successfully
- [ ] All three deployments use pnpm (check build logs)
- [ ] API health endpoint responds
- [ ] Admin Web loads correctly
- [ ] Mobile Web loads correctly

### Production Deployment
- [ ] All three production deployments succeed
- [ ] No increase in build times
- [ ] No increase in bundle sizes
- [ ] All functionality works as before

---

## Additional Considerations

### CI/CD Pipeline (Future)

When setting up GitHub Actions:

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 9

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build
  run: pnpm run build
```

### Pre-commit Hooks (Future)

When setting up lint-staged and husky:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "pnpm exec eslint --fix",
      "pnpm exec prettier --write"
    ]
  }
}
```

### Performance Benefits

PNPM advantages:
- **Faster installs**: Typically 2-3x faster than npm
- **Disk space**: Shared store reduces duplicate packages
- **Strict dependency resolution**: Prevents phantom dependencies
- **Better monorepo support**: More efficient workspace handling

---

## Conclusion

**Migration is safe and recommended**. Vercel's native pnpm support, combined with proper configuration updates, ensures a smooth transition. The main work is updating configuration files and scripts, which is straightforward and low-risk.

**Estimated Migration Time**: 2-4 hours (including testing)

**Recommended Approach**: 
1. Test locally first
2. Deploy to preview branch
3. Verify all three projects
4. Merge to main

**Next Steps**: Proceed with Phase 1 (Local Setup) when ready.
