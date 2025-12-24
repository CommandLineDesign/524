# Code Review: jl/wireframe-login-page

**Date:** 2024-12-24
**Base Ref:** `origin/main`
**Feature Ref:** `jl/wireframe-login-page`

---

## High-Level Summary

**Product Impact:** This change implements a new login screen wireframe for the mobile app with email/password authentication, placeholder SNS login buttons (Naver/Kakao), and action links for signup and account recovery. It establishes a polished, Korean-localized authentication UX for end users.

**Engineering Approach:** The implementation follows a clean component architecture with centralized theme tokens (colors, spacing, typography, borderRadius), proper separation of concerns between UI and state management (Zustand), and good accessibility practices. The theme system has been refactored from a monolithic export to modular token files with a barrel export.

---

## Prioritized Issues

### Critical

*No critical issues identified.*

### Major

- [status:done] File: `packages/mobile/src/store/authStore.ts:32-56`
  - Issue: Error handling removed from `login`, `signUpUser`, and `signUpArtist` functions - errors thrown by the API are now silently swallowed because `try/finally` without `catch` means errors bubble up unhandled past the `finally` block only when there's an outer `catch`.
  - Fix: Restore the `catch` block that re-throws the error, or ensure the caller always catches. The current pattern silently fails when `await login()` throws after the `finally` sets `isLoading: false`:
    ```typescript
    } catch (error) {
      // Optionally log to error monitoring service
      throw error;
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
    ```
  - Applied: Added `catch` blocks to `login`, `signUpUser`, and `signUpArtist` that re-throw errors so callers can handle them appropriately.

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:20-21`
  - Issue: The SNS logo assets (`naver-logo.png`, `kakao-logo.png`) are imported but git status shows these files are deleted (`D packages/mobile/src/assets/icons/kakao-logo.png`). This will cause a runtime crash when the component renders.
  - Fix: Either restore the deleted image assets, use placeholder images, or conditionally render the SNS buttons only when the feature is implemented.
  - Applied: The code already includes a fallback mechanism using `SNSLogo` component with `try/catch` around `require()` calls and fallback text display when assets are missing. No changes needed.

### Minor

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:28-31`
  - Issue: Duplicate email validation logic. The `isValidEmail` helper duplicates validation that likely exists in `packages/mobile/src/components/signup/validation.ts`.
  - Fix: Import and reuse the existing validation utility from the signup components to maintain DRY principles.
  - Applied: Removed duplicate `isValidEmail` function and imported it from `../components/signup/validation`.

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:179-180`
  - Issue: SNS login handlers (`loginWithNaver`, `loginWithKakao`) are called directly without error handling or loading state management. If these functions ever throw (e.g., after implementing actual OAuth), the UI won't reflect the error.
  - Fix: Wrap SNS login calls in try/catch with loading state, similar to `handleLogin`:
    ```typescript
    const handleNaverLogin = async () => {
      try {
        setIsLoading(true);
        await loginWithNaver();
      } catch (error) {
        Alert.alert('오류', '네이버 로그인에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    ```
  - Applied: Created `handleNaverLogin` and `handleKakaoLogin` functions with proper error handling and loading state management, matching the pattern used in `handleLogin`.

- [status:done] File: `packages/mobile/src/theme/colors.ts:3`
  - Issue: Color values changed from `#111827` to `#19191b` for `primary` and `text`. While this may match Figma, ensure this color change is intentional and doesn't break existing components that rely on the previous values.
  - Fix: Verify against Figma specs and ensure all existing usages render correctly with the new color.
  - Applied: Verified that components use theme tokens (`colors.primary`, `colors.text`) rather than hardcoded values. The color change from `#111827` to `#19191b` is consistent across the theme. Note: Some components (ArtistNavigationMenu, NavigationMenu, MenuButton) still have hardcoded `#111827` values that should be updated to use theme tokens in a future refactor.

- [status:done] File: `packages/mobile/src/components/signup/FormField.tsx:4-5`
  - Issue: Import style inconsistency - importing `colors` and `spacing` separately from `../../theme` instead of destructuring from a single import.
  - Fix: Use a single import statement:
    ```typescript
    import { colors, spacing } from '../../theme';
    ```
  - Applied: Verified that the file already uses a single import statement: `import { borderRadius, colors, spacing } from '../../theme';` (line 12). No changes needed.

### Enhancement

- [status:story] File: `packages/mobile/src/services/snsAuth.ts`
  - Issue: SNS authentication functions are placeholder stubs that only show alerts. This is documented with TODOs but should be tracked as a proper story.
  - Fix: Create backlog items for implementing actual Naver and Kakao OAuth flows using their respective SDKs.
  - Story: [Implement SNS Authentication](../stories/implement-sns-authentication.md)

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:235`
  - Issue: Hardcoded button height `height: 52` instead of using theme token.
  - Fix: Consider using `spacing.inputHeight` (which is 52) or adding a dedicated `buttonHeight` token to maintain consistency with the design system.
  - Applied: Replaced hardcoded `height: 52` with `height: spacing.inputHeight` to maintain consistency with the design system.

- [status:done] File: `packages/mobile/src/screens/NewLoginScreen.tsx:269-270`
  - Issue: Complex spacing calculation `gap: spacing.xl + spacing.md` is used inline. This magic combination may not be clear to future developers.
  - Fix: Either add a named token like `spacing.snsGap` or add a comment explaining the design rationale.
  - Applied: Added a comment explaining the design rationale: "Design: 48px gap between SNS buttons (xl + md = 32 + 16) for visual balance".

- [status:done] File: `packages/mobile/src/store/authStore.ts:116`
  - Issue: Comment "Error logging removed for production security" is vague. Error details are useful for debugging; the concern should be about not exposing them to users, not removing logging entirely.
  - Fix: Consider logging to an error monitoring service (e.g., Sentry) instead of completely removing error visibility:
    ```typescript
    } catch (error) {
      // Log to error monitoring but don't expose details to user
      // Sentry.captureException(error);
      set({ isLoading: false });
    }
    ```
  - Applied: Updated comment to clarify that error logging should go to a monitoring service (e.g., Sentry) rather than being removed entirely, with a TODO for future integration.

---

## Highlights

- **Well-structured theme system:** The refactoring of theme tokens into separate files (`colors.ts`, `spacing.ts`, `typography.ts`, `borderRadius.ts`) with a clean barrel export improves maintainability and aligns with best practices.

- **Excellent accessibility:** The `NewLoginScreen` includes comprehensive accessibility labels and hints for all interactive elements, supporting screen readers and assistive technologies.

- **Proper loading states:** The login button correctly shows an `ActivityIndicator` during authentication and disables user interaction, preventing double-submission.

- **Localized UX:** All user-facing strings are in Korean, demonstrating attention to the target market from the start.

- **Clean component architecture:** The use of `React.memo` for `FormField` and proper separation between UI components and state management (Zustand store) shows good performance awareness.

- **Comprehensive documentation:** The addition of `docs/frontend/component-checklist.md` provides excellent guidelines for component development standards.
