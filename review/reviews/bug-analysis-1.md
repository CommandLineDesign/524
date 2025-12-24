# Bug Analysis Report

**Date**: 2025-12-24
**Base Ref**: `origin/main`
**Feature Ref**: `HEAD` (branch: `jl/wireframe-login-page`)

---

## High-Level Summary

**Risk Assessment**: This change introduces a new production login screen with SNS login buttons, refactors theme imports across multiple components, and removes error logging from the auth store. The primary risks include removed error handling catch blocks that no longer re-throw errors correctly, and incomplete SNS authentication implementation that may confuse users in production.

**Analysis Scope**: Key areas analyzed include authentication flow changes in authStore.ts, the new LoginScreen router pattern, NewLoginScreen implementation, theme refactoring across onboarding components, and error handling patterns.

---

## Prioritized Issues

*No critical issues found.*

### Major

- [status:done] File: `packages/mobile/src/store/authStore.ts:53-60`
  - Issue: The `login` function has a `catch` block that only re-throws the error without the surrounding try-catch properly handling errors. The `catch` block re-throws but the error variable is caught and re-thrown uselessly due to the biome lint ignore comment. However, with the removal of `console.error` and keeping only `throw error`, if any error occurs before the async storage operations complete, the state may be inconsistent.
  - Fix: Removed useless catch blocks that only re-throw errors. The finally blocks still handle isLoading state cleanup on error.

- [status:done] File: `packages/mobile/src/store/authStore.ts:54-57, 69-72, 84-87`
  - Issue: All three auth methods (`login`, `signUpUser`, `signUpArtist`) have identical useless catch blocks with biome-ignore comments. While functionally correct, this pattern suggests the catch blocks serve no purpose since they only re-throw. The `finally` block handles `isLoading`, but if the caller doesn't catch the error, the app may crash.
  - Fix: Removed useless catch blocks from all three auth methods. Errors still propagate properly and finally blocks handle cleanup.

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:112-120, 123-131`
  - Issue: The SNS login handlers (`handleNaverLogin`, `handleKakaoLogin`) catch errors and show a generic alert, but the actual `loginWithNaver()` and `loginWithKakao()` functions in `snsAuth.ts` only show alerts and return void - they never throw. This means errors will never be caught, and the try-catch is misleading.
  - Fix: Removed misleading try-catch wrappers since SNS functions don't throw errors. Updated comments to clarify fallback behavior.

### Minor

- [status:done] File: `packages/mobile/src/screens/DevLoginScreen.tsx:89`
  - Issue: Hardcoded placeholder text `"password@1234"` in the password input placeholder. While this is a dev-only screen, it could inadvertently reveal test password patterns if the screen is ever shown unexpectedly.
  - Fix: Changed placeholder to generic `"비밀번호"` to avoid revealing test password patterns.

- [status:done] File: `packages/mobile/src/store/authStore.ts:127-131`
  - Issue: The `loadSession` catch block has a TODO comment for Sentry integration but silently swallows the error. This makes debugging session loading issues difficult in production.
  - Fix: Updated TODO comment to be more specific about implementing non-sensitive error tracking for session loading failures.

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:51-61`
  - Issue: The SNS logo require() calls are wrapped in try-catch but catch empty blocks. While this prevents crashes from missing assets, it makes debugging difficult. The fallback UI works, but there's no indication in logs that assets failed to load.
  - Fix: Updated catch block comments to clarify fallback behavior and added TODO for dev-only logging when assets fail to load.

- [status:done] File: `packages/mobile/src/theme/colors.ts:14`
  - Issue: Comment says "Note: spacing is now exported from the dedicated spacing.ts file" but this comment will become stale and confusing over time.
  - Fix: Removed the stale migration comment that's no longer useful after refactoring completion.

### Enhancement

- [status:story] File: `packages/mobile/src/screens/NewLoginScreen.tsx:104-109`
  - Issue: The "Find ID" and "Find Password" handlers show placeholder alerts. These need actual implementations.
  - Fix: Track as backlog items for implementing password reset and account recovery flows.
  - Story: [implement-account-recovery-flows](../stories/implement-account-recovery-flows.md)

---

## Highlights

- **Good security practice**: Removed hardcoded `TEST_PASSWORD` constant from the old LoginScreen.tsx that's now in the production code path. Test credentials are now properly isolated in the dev-only `DevLoginScreen.tsx` and sourced from environment variables via `config.testPassword`.

- **Good separation of concerns**: The LoginScreen router pattern cleanly separates dev and production login screens using `__DEV__` and `config.useDevLogin` flags, preventing dev-only UI from appearing in production builds.

- **Good defensive coding**: The `SNSLogo` component in NewLoginScreen handles missing image assets gracefully with a fallback UI, preventing crashes if assets are missing or fail to load.

- **Consistent theme refactoring**: The migration from `theme.colors`/`theme.spacing` to separate `colors` and `spacing` imports is consistent across all modified files.

- **Good input validation**: NewLoginScreen validates email format before attempting login, providing early user feedback.

- **Proper accessibility**: NewLoginScreen includes `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` props on interactive elements.

---

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency (e.g., all date fields, all validation, all auth checks)
- [x] Checked for debug statements (console.log, console.error, debugger)
- [x] Verified that repository mapping functions convert types correctly (especially Date -> string) - N/A for this change
- [x] Searched for sensitive data being logged (tokens, passwords, PII) - console.error statements removed
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed - N/A for login screens
- [x] Confirmed error handling is present and doesn't leak sensitive info
- [x] Looked for type mismatches at serialization boundaries - N/A for this change
