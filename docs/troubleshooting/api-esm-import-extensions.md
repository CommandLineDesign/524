## API ESM import extensions (NodeNext)

Context: the `@524/api` package is ESM (`type: "module"` with `module: "NodeNext"`). When we briefly flipped to CommonJS to “fix” missing extensions, Vercel deploys broke; we later fixed by adding `.js` extensions to every relative import.

### Symptoms
- Vercel/serverless runtime errors: `ERR_MODULE_NOT_FOUND` or “Cannot find module” for local files.
- Bundled handler fails to start even though `tsc` passes.
- Import paths without extensions (`'./foo'`) inside the API source.

### Root causes
- Node ESM requires explicit file extensions for relative imports; it does not auto-append `.js`.
- Switching `package.json` `type` or `tsconfig` `module`/`moduleResolution` without updating imports leaves runtime resolution inconsistent with emitted JS.
- Mixing CJS/ESM entrypoints (e.g., Vercel handler vs compiled output) causes loader mismatch.

### Steady-state rules (do this)
- Keep `@524/api` ESM-only: `package.json` `type: "module"`, `tsconfig` `module/moduleResolution: "NodeNext"`.
- Always use `.js` on relative imports in TypeScript:
  ```ts
  // ✅ correct under NodeNext
  import { env } from './config/env.js';
  import { createApp } from './app.js';
  ```
- Avoid `require`, `__dirname`, `__filename`; use `import.meta.url` helpers in ESM when needed.
- Build/deploy using `pnpm --filter @524/api build` and `pnpm --filter @524/api build:vercel` to catch resolution errors locally.

### Recovery if broken
1) Add `.js` to every relative import in `packages/api/src` and `packages/api/api`.
2) Confirm `package.json` still has `type: "module"` and `tsconfig` keeps `module: "NodeNext"` / `moduleResolution: "NodeNext"`.
3) Re-run `pnpm --filter @524/api build` (and `build:vercel`) to verify.

### Guardrails to prevent regressions
- Do not flip the package between CJS/ESM to “fix” imports; fix the imports instead.
- Consider a lint rule (`import/extensions` / `no-import-module-extensions`) scoped to `packages/api` to require `.js` on relative paths.
- When adding new files, add the `.js` extension in the import at creation time.

