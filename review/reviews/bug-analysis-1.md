# Bug Analysis Report

**Date:** 2023-12-23
**Branch:** jl/wireframe-login-page
**Base:** origin/main

## High-Level Summary

**Risk Assessment:** This change introduces a login screen router that conditionally displays dev vs. production login screens based on environment variables. The primary risks involve hardcoded test credentials that could leak into production builds, potential runtime failures if theme imports are inconsistent between staged and unstaged changes, and missing email validation on the dev login screen. The SNS authentication placeholders present minimal security risk as they are stub implementations.

**Analysis Scope:** Login screen refactoring (LoginScreen, NewLoginScreen, DevLoginScreen), environment configuration (environment.ts), SNS authentication stubs (snsAuth.ts), theme system refactoring (colors, spacing, typography, borderRadius), and component updates to use the new theme structure.

## Prioritized Issues

### Critical

- [status:todo] File: packages/mobile/src/config/environment.ts:22-23
  - Issue: Hardcoded test password `password@1234` exposed in source code with default fallback. This password could be included in production builds if the environment variable isn't set.
  - Fix: Remove default password value, require explicit environment variable, and ensure this file is excluded from production builds via bundler configuration.

- [status:todo] File: packages/mobile/src/screens/DevLoginScreen.tsx:137-140
  - Issue: Test password displayed in UI info box via `{config.testPassword}` - if DevLoginScreen is accidentally rendered in production, it exposes the test password to users.
  - Fix: Remove the password display from UI or add runtime check to prevent DevLoginScreen from rendering in production builds entirely.

### Major

- [status:todo] File: packages/mobile/src/screens/LoginScreen.tsx:11-18
  - Issue: No safeguard preventing DevLoginScreen from being accidentally enabled in production. The `config.useDevLogin` check relies solely on environment variable which could be misconfigured.
  - Fix: Add build-time or runtime safeguard such as `if (__DEV__ && config.useDevLogin)` to ensure DevLoginScreen is only available in development mode.

- [status:todo] File: packages/mobile/src/screens/NewLoginScreen.tsx (staged version):21-22
  - Issue: SNS logo URLs reference Figma API endpoints (`https://www.figma.com/api/mcp/asset/...`) which are not valid image URLs and will fail to load at runtime, showing broken images.
  - Fix: Use local asset files as shown in the unstaged version with `require('../assets/icons/naver-logo.png')` pattern.

- [status:todo] File: packages/mobile/src/screens/DevLoginScreen.tsx:41-55
  - Issue: Missing email validation in handleLogin - the production NewLoginScreen validates email format but DevLoginScreen does not, creating inconsistent validation behavior.
  - Fix: Add email validation using the same `isValidEmail` helper function from NewLoginScreen.

- [status:todo] File: packages/mobile/src/store/authStore.ts:54
  - Issue: `console.error('Login error:', error)` logs potentially sensitive error information. While errors may not contain PII directly, stack traces or error messages could leak implementation details.
  - Fix: Remove console.error in production or use a proper logging service that sanitizes output.

### Minor

- [status:todo] File: packages/mobile/src/store/authStore.ts:54,69,83,124
  - Issue: Multiple `console.error` statements throughout authStore that should not be in production code.
  - Fix: Remove or replace with production-safe logging mechanism.

- [status:todo] File: packages/mobile/src/screens/DevLoginScreen.tsx (staged vs unstaged inconsistency)
  - Issue: Staged version imports `{ theme }` from '../theme/colors' but unstaged version imports `{ colors, spacing }` from '../theme'. This import inconsistency will cause build errors.
  - Fix: Ensure consistent imports across staged and unstaged changes - use `{ colors, spacing }` from '../theme' to match the new theme structure.

- [status:todo] File: packages/mobile/src/theme/borderRadius.ts (staged vs unstaged inconsistency)
  - Issue: Staged version has different values for `xl` (100 vs 24) and includes extra `xxl` property. This inconsistency could cause UI rendering differences.
  - Fix: Resolve the conflict and use consistent values across all staged changes.

- [status:todo] File: packages/mobile/src/screens/NewLoginScreen.tsx:28-30
  - Issue: Missing `inputHeight` property used in styles (`height: spacing.inputHeight`) but this property doesn't exist in the spacing.ts file.
  - Fix: Either add `inputHeight: 52` to spacing.ts or use a hardcoded value of 52 (as shown in the staged version input style).

### Enhancement

- [status:story] File: packages/mobile/src/services/snsAuth.ts:11,17
  - Issue: TODO comments indicate unfinished implementation for Naver and Kakao OAuth flows.
  - Fix: Track implementation of actual OAuth flows in backlog.

- [status:todo] File: packages/mobile/src/screens/NewLoginScreen.tsx:71-75
  - Issue: Missing loading state handling for SNS login buttons - when `isLoading` is true from email login, SNS buttons are disabled but there's no visual feedback if SNS login itself triggers loading.
  - Fix: Consider adding separate loading states for SNS authentication or unified loading state management.

## Highlights

- Good use of accessibility attributes (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`) on interactive elements in NewLoginScreen
- Proper error handling with user-friendly Korean error messages and Alert dialogs
- Clean separation of concerns with dedicated theme files (colors, spacing, typography, borderRadius)
- Consistent use of `SafeAreaView` for safe area handling
- Appropriate use of `secureTextEntry` for password fields
- Good pattern of disabling form inputs during loading state
- Email validation regex in NewLoginScreen follows standard email pattern
- Proper async/await pattern with try/catch/finally for error handling in login flows

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency
- [x] Checked for debug statements (console.log, console.error, debugger)
- [x] Verified that repository mapping functions convert types correctly
- [x] Searched for sensitive data being logged (tokens, passwords, PII)
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed
- [x] Confirmed error handling is present and doesn't leak sensitive info
- [x] Looked for type mismatches at serialization boundaries
