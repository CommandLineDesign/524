# Bug Analysis Report

**Date:** 2025-12-20
**Base Ref:** origin/main
**Feature Ref:** feat/review-system/view-customer-review-history
**Analysis Scope:** Customer review history feature implementation

## High-Level Summary

**Risk Assessment:** This change introduces a new customer-facing review history feature with moderate security and data integrity risks. The primary concerns are around type safety at serialization boundaries (database → API → mobile client), inconsistent date/time handling, and production debug statements. While no critical security vulnerabilities were found, there are several type mismatches that could cause runtime errors on the client.

**Analysis Scope:** The analysis focused on the new GET `/api/v1/reviews` endpoint, the mobile client integration, and cross-boundary type consistency between the API layer (returning database Date objects) and the mobile client (expecting ISO string representations). Special attention was paid to repository mapping functions, pagination logic, authorization checks, and pattern consistency with existing booking-related code.

## Prioritized Issues

### Critical

- [status:done] **File:** [packages/api/src/controllers/reviewController.ts:73-74](packages/api/src/controllers/reviewController.ts#L73-L74)
  - **Issue:** Type mismatch at serialization boundary - Review type from database has `createdAt` and `updatedAt` as Date objects, but client expects ISO strings. When Express serializes the response via `res.json()`, Date objects become ISO strings at runtime, but TypeScript types don't reflect this transformation. This pattern is inconsistent with the booking repository which explicitly converts dates to ISO strings.
  - **Fix:** Added `mapReviewToResponse` function in reviewRepository.ts that explicitly converts Date objects to ISO strings. Applied this mapping to `getReviewsForCustomer`, `getReviewsForArtist`, and `getReviewById` methods.
    ```typescript
    // In reviewRepository.ts - add mapping function
    function mapReviewToResponse(review: Review) {
      return {
        ...review,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      };
    }

    // Apply in getReviewsForCustomer, getReviewsForArtist, getReviewById
    async getReviewsForCustomer(customerId: string, limit = 20, offset = 0) {
      const rows = await db.select()...;
      return rows.map(mapReviewToResponse);
    }
    ```

### Major

- [status:done] **File:** [packages/api/src/controllers/reviewController.ts:44](packages/api/src/controllers/reviewController.ts#L44)
  - **Issue:** Debug logging statement logging user IDs and pagination parameters in production. While user IDs are not PII themselves, excessive debug logging in production can impact performance and potentially leak system behavior patterns. Inconsistent with other controllers that use logger.info or logger.debug more selectively.
  - **Fix:** Changed debug logging to be conditional on NODE_ENV === 'development' for customer reviews, artist reviews, and dual-role user scenarios.
    ```typescript
    if (process.env.NODE_ENV === 'development') {
      logger.debug({ userId: req.user.id, limit, offset }, 'Getting customer reviews');
    }
    ```
    Or promote to info level only for significant events, not every query.

- [status:todo] **File:** [packages/mobile/src/screens/MyReviewsScreen.tsx:37-38](packages/mobile/src/screens/MyReviewsScreen.tsx#L37-L38)
  - **Issue:** Incorrect use of `useInfiniteQuery` return values - `useCustomerReviews` returns an infinite query with `data.pages`, but the code destructures properties like `data`, `hasNextPage`, and `fetchNextPage` that are appropriate for infinite queries, yet only passes `limit` without proper infinite query setup. The `useCustomerReviews` hook in [reviews.ts:24-35](packages/mobile/src/query/reviews.ts#L24-L35) correctly uses `useInfiniteQuery`, but the screen implementation doesn't handle the `data.pages` structure correctly - it assumes a single-page structure.
  - **Fix:** Fix the data access pattern to properly flatten pages:
    ```typescript
    const reviews = data?.pages.flatMap(page => page.reviews) ?? [];
    ```
    This is already correctly implemented on line 41, so this is actually not a bug - the destructuring on lines 37-38 is correct for `useInfiniteQuery`. **Retract this issue.**

- [status:ignored] **File:** [packages/mobile/src/screens/MyReviewsScreen.tsx:37-38](packages/mobile/src/screens/MyReviewsScreen.tsx#L37-L38)
  - **Issue:** (RETRACTED - code is correct) See analysis above.
  - **Fix:** N/A

### Minor

- [status:todo] **File:** [packages/api/src/controllers/reviewController.ts:49](packages/api/src/controllers/reviewController.ts#L49)
  - **Issue:** Debug logging statement at line 49 and similar at lines 50, 57. Same issue as major item above but for artist reviews.
  - **Fix:** Same fix as above - conditional logging or removal.

- [status:done] **File:** [packages/api/src/controllers/reviewController.ts:26](packages/api/src/controllers/reviewController.ts#L26)
  - **Issue:** Type casting `req.user as { roles?: string[] }` is used multiple times (lines 26, 107) without a type guard. While this works, it's a pattern that could fail silently if the user object structure changes. The auth middleware should provide stronger typing guarantees.
  - **Fix:** Removed type casting since AuthRequest interface already guarantees req.user.roles exists as string[].
    ```typescript
    // In middleware/auth.ts
    export interface AuthRequest extends Request {
      user?: {
        id: string;
        roles: string[];
      };
    }
    ```

- [status:done] **File:** [packages/mobile/src/api/client.ts:254-266](packages/mobile/src/api/client.ts#L254-L266)
  - **Issue:** The `Review` interface defines `createdAt` and `updatedAt` as `string`, which is correct for the serialized JSON response. However, there's no runtime validation that the API actually returns strings vs Date objects. If the API bug (Critical issue above) is not fixed, this could cause subtle bugs when the client tries to use these as strings.
  - **Fix:** Resolved by Critical issue fix - API now properly serializes dates to ISO strings via mapReviewToResponse function.
    ```typescript
    const ReviewSchema = z.object({
      createdAt: z.string(),
      updatedAt: z.string(),
      // ... other fields
    });
    ```

- [status:done] **File:** [packages/mobile/src/query/reviews.ts:33](packages/mobile/src/query/reviews.ts#L33)
  - **Issue:** `staleTime` is set to 300000ms (5 minutes) with comment "reviews rarely change", but reviews can be edited within 24 hours per [reviewService.ts:166-169](packages/api/src/services/reviewService.ts#L166-169). If a user edits a review and then navigates back to MyReviews, they might see stale data for up to 5 minutes. This is inconsistent with user expectations for their own content.
  - **Fix:** Reduced staleTime from 5 minutes to 30 seconds to balance performance with user expectations for their own content freshness.
    ```typescript
    staleTime: 30000, // 30 seconds - balance between performance and freshness
    ```
    The `useSubmitReviewMutation` already invalidates the `['reviews']` query key on line 19, which should help, but editing functionality isn't in this PR.

### Enhancement

- [status:done] **File:** [packages/api/src/controllers/reviewController.ts:30-38](packages/api/src/controllers/reviewController.ts#L30-L38)
  - **Issue:** Pagination parameter parsing is duplicated logic that could be extracted to a utility function. The same pattern appears in multiple controllers (admin, messaging, etc.). Not a bug, but a code quality improvement opportunity.
  - **Fix:** Created shared pagination utility in utils/pagination.ts and updated reviewController to use parsePaginationParams function.

- [status:done] **File:** [packages/api/src/controllers/reviewController.ts:42-68](packages/api/src/controllers/reviewController.ts#L42-L68)
  - **Issue:** Role-based routing logic is complex with nested if/else. While functionally correct, this could be simplified for readability using a role resolution pattern.
  - **Fix:** Added determineRole helper function and refactored logic to use ternary operator instead of nested if/else, making the code more concise and readable.

- [status:story] **File:** [packages/mobile/src/screens/MyReviewsScreen.tsx:44-47](packages/mobile/src/screens/MyReviewsScreen.tsx#L44-L47)
  - **Issue:** When a user taps a review, they navigate to the booking detail screen. There's no direct way to edit or delete the review from this screen, which means the user has to navigate to the booking, then back. Consider adding review detail/edit functionality directly from MyReviews.
  - **Fix:** Add a new `ReviewDetail` screen or add quick actions to the `ReviewCard` component. This should be a separate story/feature.
  - **Story:** [Add Review Detail Screen with Edit/Delete Actions](../stories/add-review-detail-screen-with-edit-delete-actions.md)

- [status:story] **File:** [packages/mobile/src/query/reviews.ts:27](packages/mobile/src/query/reviews.ts#L27)
  - **Issue:** The `getReviews` API client function always sends `role: 'customer'` hardcoded in the `useCustomerReviews` hook. If the app later needs to show artist reviews, this would require duplicating the hook logic. Not a bug, but could be more flexible.
  - **Fix:** Consider making the hook more generic:
    ```typescript
    export function useReviews(role: 'customer' | 'artist', params: Omit<GetReviewsParams, 'offset' | 'role'> = {}) {
      return useInfiniteQuery<GetReviewsResponse>({
        queryKey: ['reviews', role, params],
        queryFn: ({ pageParam }) => getReviews({ ...params, role, offset: pageParam as number }),
        // ... rest
      });
    }

    // Then: useReviews('customer', { limit: 20 })
    ```
  - **Story:** [Make Reviews Hook More Flexible for Different Roles](../stories/make-reviews-hook-more-flexible-for-different-roles.md)

## Highlights

- **Strong authorization checks:** The controller properly checks user roles and ownership at lines 21-24, 42-68, and 106-115. The dual-role user handling (lines 52-64) is particularly well thought out.
- **Proper pagination implementation:** The "limit + 1" pattern (lines 45, 50, 61) combined with `hasMore` calculation (line 70) is a clean way to determine if there are more results without an extra count query.
- **Input validation:** The repository layer has comprehensive UUID and rating validation functions (lines 30-56 in reviewRepository.ts), which prevents malformed data from reaching the database.
- **Defensive error handling:** The controller uses try/catch with structured logging (lines 81-84, 118-121), and the error messages don't leak sensitive information.
- **Idempotent mutations:** The review submission logic handles the case where a review already exists gracefully (reviewService.ts:78-86), returning the existing review rather than throwing an error.
- **Cache invalidation:** The `useSubmitReviewMutation` properly invalidates both bookings and reviews query keys (lines 18-19), ensuring the UI stays fresh after mutations.
- **Consistent query patterns:** The `useInfiniteQuery` implementation follows React Query best practices with proper `initialPageParam` and `getNextPageParam` (lines 28-32).
- **Good separation of concerns:** The review feature properly separates controller (routing/auth), service (business logic), and repository (data access) layers.

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency (e.g., all date fields, all validation, all auth checks)
- [x] Checked for debug statements (console.log, console.error, debugger) - Found in reviewController.ts
- [x] Verified that repository mapping functions convert types correctly (especially Date → string) - **ISSUE FOUND**
- [x] Searched for sensitive data being logged (tokens, passwords, PII) - User IDs logged but not considered PII
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed - Excellent coverage
- [x] Confirmed error handling is present and doesn't leak sensitive info - Good implementation
- [x] Looked for type mismatches at serialization boundaries - **ISSUE FOUND**
