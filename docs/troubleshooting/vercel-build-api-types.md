## Vercel build: API type errors (Express & Drizzle)

Context: `vercel-build` for `@524/api` emitted large TS error list on Vercel, but local builds passed.

### Symptoms
- `Express` “not callable”; `Request` lacks `query/body/params`; `Response` lacks `status/json`; `NextFunction` not callable.
- Drizzle errors about incompatible `PgColumn` types and private `shouldInlineParams` differences.

### Root causes
- The Vercel handler (`packages/api/api/index.ts`) types `req`/`res` as `VercelRequest`/`VercelResponse`, so the compiler does not see Express `Request`/`Response` when doing `app(req, res)`. That cascades into “not callable” and missing property errors.
- Two copies of `drizzle-orm` are in the build graph (`packages/api/node_modules` and `packages/api/node_modules/@524/database/node_modules`), so TS treats Drizzle types as distinct and rejects selections/joins.

### Suggested fixes
1) Express typing
- Change the Vercel handler signature to use Express types (e.g., `import { type Request, type Response } from 'express'` and annotate the handler) or wrap with `app(req as any, res as any)` to avoid having `VercelRequest/Response` drive the call signature.

2) Drizzle single instance
- Ensure one `drizzle-orm` version is used: add a root `overrides` entry for `drizzle-orm` and keep only the workspace copy, or hoist by removing nested installs.
- Point API typechecking to the database source types (e.g., `paths` to `packages/database/src`) so both packages share the same Drizzle type declarations during build.

### Status
- Local `tsc` (TS 5.4.5 and 5.9.3) passes; the Vercel errors are environmental/type-resolution, not runtime regressions.
