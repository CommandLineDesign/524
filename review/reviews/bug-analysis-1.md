# Bug Analysis Report

**Date**: January 5, 2026
**Base Ref**: origin/main
**Feature Ref**: jl/update-artist-onboarding (uncommitted changes)
**Analyzed By**: Bugbot

---

## High-Level Summary

**Risk Assessment**: Medium risk. The changes primarily affect artist onboarding UI, authentication token storage, and email availability checking. Security concerns exist around the token service refactoring which now silently swallows errors during refresh token retrieval. The email availability check has proper abort handling but network errors could leave the UI in a confusing state.

**Analysis Scope**: 10 modified files including onboarding components (MultiSelectButtons, OnboardingLayout, SelectableCard, ArtistOnboardingFlowScreen), authentication screens (ArtistSignupScreen, NewLoginScreen), token service refactoring with new StorageProvider abstraction, Jest configuration updates, and documentation.

---

## Prioritized Issues

### Critical

_No critical issues identified._

### Major

- [status:done] File: `packages/mobile/src/services/tokenService.ts:42-52`
  - Issue: `getRefreshToken` now silently returns `null` on error instead of throwing, which changes the security behavior. Previously, SecureStore failures would throw an error requiring explicit handling. Now failures are silently ignored, which could mask storage configuration issues or security problems.
  - Fix: Consider logging the error or maintaining the previous throw behavior for refresh token retrieval failures to ensure storage issues are not silently ignored. At minimum, add structured logging for observability.
  - Resolution: Added `__DEV__` guarded console.error logging for observability while maintaining graceful degradation.

- [status:done] File: `packages/mobile/src/services/storage/NativeStorageProvider.ts:10-21`
  - Issue: The fallback from SecureStore to AsyncStorage for `get()` operations silently downgrades security. If SecureStore fails, sensitive refresh tokens may be read from insecure storage without any indication to the caller.
  - Fix: Consider returning `null` instead of falling back to AsyncStorage for get operations, or add a flag to indicate the security level of the retrieved value. Alternatively, log at warning level with monitoring for production.
  - Resolution: Removed AsyncStorage fallback for `get()` operations - now returns `null` on SecureStore failure to maintain security guarantees. Added `__DEV__` guarded logging.

### Minor

- [status:done] File: `packages/mobile/src/services/storage/NativeStorageProvider.ts:14,27,41`
  - Issue: Debug `console.error` and `console.warn` statements in production code. These should use a proper logging service or be conditionally enabled.
  - Fix: Replace with a logging service that can be configured per environment, or wrap in `__DEV__` checks.
  - Resolution: Wrapped all console.error/console.warn statements in `__DEV__` checks to prevent logging in production builds.

- [status:done] File: `packages/mobile/src/screens/ArtistSignupScreen.tsx:130-132`
  - Issue: When `checkAvailability` throws a network error, the status is set to `'error'` but no user feedback is shown. Users may be confused about why the availability indicator disappeared.
  - Fix: Consider showing a subtle indicator that availability could not be checked, or retry logic with exponential backoff.
  - Resolution: Added Korean helper text "확인 실패 - 제출 시 다시 확인됩니다" (Check failed - will be verified on submit) with 'neutral' status for error cases.

- [status:done] File: `packages/mobile/src/screens/ArtistSignupScreen.tsx:124-135`
  - Issue: The `emailHelperInfo` returns empty strings for `'error'` status from availability check, which makes sense for not blocking users, but the status is still `'' as const` which may cause TypeScript issues or confusion.
  - Fix: Consider using a more explicit type like `'neutral'` or `undefined` instead of empty string for non-error/non-success states.
  - Resolution: Changed 'checking' status to 'neutral', error status to 'neutral' with helper text, and default case to `undefined` instead of empty string.

- [status:done] File: `packages/mobile/src/screens/ArtistSignupScreen.tsx:176-193`
  - Issue: The submit handler calls `checkAvailability` again even though debounced check may have already confirmed availability. This creates redundant API calls.
  - Fix: Consider using the cached availability status if it's `'available'` and the email hasn't changed since the last check, falling back to the API call only when necessary.
  - Resolution: Added `lastCheckedEmailRef` to track the email for which availability was confirmed. Submit handler now skips API call when `emailAvailabilityStatus === 'available'` and email matches the cached value.

### Enhancement

- [status:ignored] File: `packages/mobile/src/screens/ArtistSignupScreen.tsx:78`
  - Issue: The error message "이미 사용 중인 이메일입니다. 로그인해 주세요." is hardcoded. Consider extracting to i18n constants for consistency.
  - Fix: Extract to a shared i18n constants file for localization support.
  - Rationale: No i18n system exists yet. Should be addressed as part of a broader i18n implementation story rather than creating ad-hoc constants.

- [status:ignored] File: `packages/mobile/src/screens/NewLoginScreen.tsx:185-195`
  - Issue: TODO comment indicates i18n work needed for "아티스트로 가입" button.
  - Fix: Track as story/task to implement i18n for this screen.
  - Rationale: No i18n system exists yet. The existing TODO comment is sufficient to track this. Should be addressed as part of a broader i18n implementation story.

- [status:ignored] File: `packages/mobile/src/components/onboarding/SelectableCard.tsx:2`
  - Issue: `View` is imported but no longer used after refactoring.
  - Fix: Remove unused import. (Minor cleanup, low priority)
  - Rationale: Upon inspection, `View` is not present in the imports. The import statement only includes `Image, StyleSheet, Text, TouchableOpacity`. Issue is not applicable to current code.

---

## Highlights

- **Good abort controller handling**: The `ArtistSignupScreen` properly uses `AbortController` to cancel pending availability checks on component unmount and when new requests are made.

- **Proper ref tracking for mount state**: The component uses `isMountedRef` to prevent state updates after unmount, avoiding React warnings.

- **Clean StorageProvider abstraction**: The new `StorageProvider` interface enables dependency injection for testing and platform-specific implementations. The factory pattern with `createTokenService` improves testability.

- **Defensive coding in token service**: The token service methods properly handle errors with try-catch and return sensible defaults (`null` for missing tokens, `true` for expired checks on error).

- **Accessibility improvements**: The `ArtistOnboardingFlowScreen` now includes proper `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` props on interactive elements.

- **StyleSheet extraction**: Inline styles in `ArtistOnboardingFlowScreen` have been properly extracted to a `StyleSheet.create()` block, improving performance and maintainability.

- **Consistent theme usage**: Components now use theme constants (`borderRadius`, `colors`, `spacing`) consistently instead of hardcoded values.

---

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
