## Vercel build: API type errors (Express & Drizzle)

Context: `vercel-build` for `@524/api` emitted large TS error list on Vercel, but local builds passed.

### Symptoms
- `Express` "not callable"; `Request` lacks `query/body/params`; `Response` lacks `status/json`; `NextFunction` not callable.
- Drizzle errors about incompatible `PgColumn` types and private `shouldInlineParams` differences:
  ```
  Type 'import("/vercel/path0/packages/api/node_modules/@524/database/node_modules/drizzle-orm/sql/sql").SQL<unknown>' 
  is not assignable to type 'import("/vercel/path0/packages/api/node_modules/drizzle-orm/sql/sql").SQL<unknown>'.
  ```

### Root causes
- The Vercel handler (`packages/api/api/index.ts`) types `req`/`res` as `VercelRequest`/`VercelResponse`, so the compiler does not see Express `Request`/`Response` when doing `app(req, res)`. That cascades into "not callable" and missing property errors.
- Two copies of `drizzle-orm` are in the build graph (`packages/api/node_modules` and `packages/api/node_modules/@524/database/node_modules`), so TS treats Drizzle types as distinct and rejects selections/joins.
- Using `file:../package` protocol in package.json dependencies causes pnpm to create separate node_modules for each workspace package, leading to duplicate installations of shared dependencies.

### Solution (APPLIED - Jan 2026)

#### 1. Use pnpm workspace protocol for all internal dependencies

Changed all internal package references from `file:../package` to `workspace:*`:

**packages/api/package.json:**
```json
{
  "dependencies": {
    "@524/database": "workspace:*",
    "@524/notifications": "workspace:*",
    "@524/shared": "workspace:*"
  }
}
```

**packages/database/package.json:**
```json
{
  "dependencies": {
    "@524/shared": "workspace:*"
  }
}
```

**packages/mobile/package.json & packages/web/package.json:**
```json
{
  "dependencies": {
    "@524/shared": "workspace:*"
  }
}
```

This ensures pnpm properly hoists shared dependencies and prevents duplicate installations.

#### 2. Root package.json already has drizzle-orm override

The root `package.json` already has the correct override:
```json
{
  "pnpm": {
    "overrides": {
      "drizzle-orm": "^0.44.7"
    }
  }
}
```

Combined with the workspace protocol, this ensures a single drizzle-orm installation.

#### 3. Updated Vercel install command

**packages/api/vercel.json:**
```json
{
  "version": 2,
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile --prod=false --no-optional",
  "buildCommand": "pnpm run vercel-build"
}
```

Removed `--config.ignore-workspace-root-check=true` which was interfering with proper workspace resolution.

### Verification

After applying these fixes:

1. **Clean install test:**
   ```bash
   rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Verify single drizzle-orm:**
   ```bash
   find packages/*/node_modules -name "drizzle-orm" -type d
   # Should return empty (no nested installations)
   
   ls node_modules/.pnpm | grep drizzle
   # Should show only one drizzle-orm entry
   ```

3. **Build test:**
   ```bash
   pnpm run build
   pnpm run typecheck
   # Both should pass without errors
   ```

### Prevention

1. **Always use `workspace:*` protocol** for internal dependencies in monorepo
2. **Never use `file:../package`** - it bypasses pnpm's workspace dependency resolution
3. **Verify after dependency changes:**
   ```bash
   pnpm why drizzle-orm
   # Should show single installation path
   ```

### Status
- ✅ Fixed (Jan 2026): Using workspace protocol eliminates duplicate drizzle-orm installations
- ✅ Local builds pass
- ⏳ Awaiting Vercel deployment to confirm fix
