# Bug Analysis Report

**Date:** 2026-01-03
**Base Ref:** origin/main
**Feature Ref:** jl/refresh-auth (HEAD)
**Analysis Scope:** Authentication, token refresh, API client, repositories, and services

---

## High-Level Summary

**Risk Assessment:** This change introduces refresh token authentication which is a security-critical feature. The primary concerns are around data exfiltration via debug logging to an external endpoint, a variable scoping bug in the mobile API client that would cause runtime errors, and several debug console.log statements that should not be in production code.

**Analysis Scope:** Focus on authentication flows (authService.ts, auth.ts middleware, auth routes), token management (tokenService.ts, mobile API client), repository layer (reviewRepository.ts, artistRepository.ts), and admin panel authentication.

---

## Prioritized Issues

### Critical

- [status:done] File: packages/api/src/repositories/reviewRepository.ts:317-329, 344-358, 362-380, 390-412
  - Issue: **Data exfiltration to external endpoint** - Multiple fetch calls send data to `http://127.0.0.1:7242/ingest/...` including artistId, SQL queries, and error details. While this is localhost, these debug statements send sensitive database information externally and should never be in production code.
  - Fix: Remove all `#region agent log` blocks entirely. These appear to be debug instrumentation that was accidentally left in the code.

- [status:done] File: packages/mobile/src/api/client.ts:152-162
  - Issue: **Variable `response` used before assignment** - The code assigns `response` on line 129-133 inside a try block, but then uses it on line 152 (`await response.json()`) outside the try block. If the fetch fails, the catch block throws an AuthenticationError, but if fetch succeeds and `response.ok` is false, the code falls through and `response` is properly assigned. However, the current structure could be confusing and error-prone. More critically, the `catch` block (lines 143-150) rethrows without reaching line 152, but if an unexpected error occurs between lines 129 and 152, the variable could be in an undefined state.
  - Fix: Move the `const data = (await response.json())` line inside the try block after checking `response.ok`, or restructure to ensure `response` is always defined before use.

### Major

- [status:done] File: packages/api/src/repositories/reviewRepository.ts:297
  - Issue: **Missing closing brace for `createReviewImages` function** - The function starting at line 272 never has a closing brace. The `getReviewImages` function starts at line 298 without `createReviewImages` being closed. This will cause a syntax/compilation error.
  - Fix: Add closing brace `}` after line 296 before the `getReviewImages` function definition.

- [status:done] File: packages/api/src/repositories/reviewRepository.ts:415
  - Issue: **Missing closing brace for `getArtistReviewStats` function** - The function starting at line 314 is missing its closing brace. The `getAllReviewsCount` function starts at line 416 without proper closure.
  - Fix: Add closing brace `}` after line 414 before the `getAllReviewsCount` function definition.

### Minor

- [status:done] File: packages/web/src/lib/adminAuthProvider.ts:44-48, 55, 67-72, 80, 83, 109, 122, 128
  - Issue: **Debug console.log statements in production code** - Multiple console.log statements expose token status and user information to browser console.
  - Fix: Remove or guard these console.log statements with a development environment check.

- [status:done] File: packages/web/src/lib/adminDataProvider.ts:71-76, 110
  - Issue: **Debug console.log statements in production code** - Logging API request details to console.
  - Fix: Remove or guard these console.log statements with a development environment check.

- [status:done] File: packages/api/src/routes/v1/auth.ts:42, 92-93, 145, 178, 214-215, 258, 361
  - Issue: **Console.error/warn statements in auth routes** - While logging errors is acceptable, some of these log sensitive context like email addresses.
  - Fix: Ensure no PII is logged. Consider using structured logging with redaction.

- [status:done] File: packages/mobile/src/api/client.ts:240-243
  - Issue: **Console.warn in production code** - Warning logged when proactive token refresh fails.
  - Fix: Remove or use a proper logging service that can be disabled in production.

- [status:done] File: packages/mobile/src/services/tokenService.ts:22-23, 39-41, 52-53, 65-66, 87-88, 104, 124, 139
  - Issue: **Console.error statements in token service** - Multiple error logging statements that expose token operation failures.
  - Fix: Consider using a structured logging service or removing in production builds.

### Enhancement

- [status:done] File: packages/api/src/services/authService.ts:236-238, 258
  - Issue: **Console.warn logs email during login attempts** - Lines 236 and 258 log the email address when login fails. While useful for debugging, this could be considered PII logging.
  - Fix: Consider redacting email or removing these logs in production.

- [status:done] File: packages/shared/src/artists.d.ts vs packages/shared/src/artists.ts
  - Issue: **Type definition file out of sync** - The `.d.ts` file is missing properties that exist in the `.ts` file (`businessRegistrationNumber`, `portfolioImages`, `services`, `profileImageUrl`). This could cause type errors in consumers.
  - Fix: Regenerate the `.d.ts` file from the source or manually sync the missing properties.

---

## Highlights

**Positive patterns observed:**

- **Token security**: Refresh tokens are properly hashed with SHA-256 before storage in the database, preventing token theft from database compromise.
- **Token rotation**: The refresh token flow properly implements token rotation - old tokens are revoked when new ones are issued, preventing replay attacks.
- **Token family tracking**: Token families are tracked to detect and prevent token reuse attacks. When a revoked token is used, the entire family is invalidated.
- **Secure token storage on mobile**: Refresh tokens use SecureStore (encrypted storage) while access tokens use AsyncStorage, balancing security with performance.
- **Input validation**: UUID validation, rating validation, and pagination parameter validation are consistently applied in the review repository.
- **Proactive token refresh**: The mobile client proactively refreshes tokens before they expire, reducing auth-related request failures.
- **Request queueing during refresh**: Multiple simultaneous requests properly queue and wait for a single refresh operation, preventing race conditions.
- **Banned user checks**: Both the auth middleware and refresh token flow check for banned users and deny access appropriately.
- **Token version checking**: The system supports forced logout across all devices by incrementing a user's token version.

---

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency
- [x] Checked for debug statements (console.log, console.error, debugger)
- [x] Verified that repository mapping functions convert types correctly
- [x] Searched for sensitive data being logged (found email logging issues)
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed
- [x] Confirmed error handling is present and doesn't leak sensitive info
- [x] Looked for type mismatches at serialization boundaries
