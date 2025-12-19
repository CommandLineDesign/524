# Bug Analysis #1

**Date**: 2025-12-20
**Base Ref**: origin/main (9d18a6e)
**Feature Ref**: HEAD (d3f536d)
**Branch**: feat/review-system/display-reviews-on-profile

## High-Level Summary

**Risk Assessment**: This feature adds public endpoints to display artist reviews and statistics on profile pages. The primary risks include: (1) Authorization vulnerabilities if internal review service methods are exposed without proper filtering, (2) Performance degradation from unbounded pagination or missing query optimization, (3) Data type inconsistencies at serialization boundaries that could cause runtime crashes, and (4) Potential information disclosure if sensitive data is logged in error handlers.

**Analysis Scope**: The analysis focuses on six backend files (artist controller, routes, review service, review repository) and four frontend files (mobile API client, navigation, query hooks, screen component). Key areas examined include: pagination logic, input validation, type consistency across serialization boundaries, authorization checks, error handling, debug logging, and resource management.

## Prioritized Issues

### Critical

- [status:done] **File**: packages/api/src/controllers/artistController.ts:141
  - **Issue**: Logging sensitive request data (artistId parameter) in error handler that could expose PII when combined with user context
  - **Fix**: Remove `artistId: req.params.artistId` from error log and only log sanitized error details: `logger.error({ error }, 'Failed to get artist reviews');`
  - **Resolution**: Removed artistId from error logging to prevent privacy violations

- [status:done] **File**: packages/api/src/controllers/artistController.ts:163
  - **Issue**: Logging artistId in error handler creates audit trail linking users to artists they viewed, potential privacy violation
  - **Fix**: Remove `artistId: req.params.artistId` from error log: `logger.error({ error }, 'Failed to get artist review stats');`
  - **Resolution**: Removed artistId from error logging to prevent privacy violations

### Major

- [status:done] **File**: packages/api/src/repositories/reviewRepository.ts:217
  - **Issue**: Missing `.desc()` on `.orderBy(reviews.createdAt)` causes reviews to be returned in ascending order (oldest first) instead of descending (newest first), violating user expectation for chronological feeds
  - **Fix**: Change to `.orderBy(desc(reviews.createdAt))` to display newest reviews first. Import `desc` from `drizzle-orm` at the top of the file.
  - **Resolution**: Updated ordering to show newest reviews first by using desc(reviews.createdAt)

- [status:done] **File**: packages/api/src/routes/v1/artist.ts:30-31
  - **Issue**: Route order causes `/artists/:artistId/reviews` and `/artists/:artistId/reviews/stats` to never match because `/artists/:artistId` route is registered after them but Express evaluates routes in order. If `:artistId` were "reviews", it would match the general profile route instead of the stats/reviews routes.
  - **Fix**: The current order is actually correct (specific routes before parameterized routes). However, there's a logical issue: if someone tries to access an artist with ID "reviews", the stats endpoint would match first. Consider adding validation that rejects reserved keywords like "reviews" and "stats" as artistId values, or document this edge case.
  - **Resolution**: Added validation to reject reserved keywords ('reviews', 'stats', 'me') as artistId values and added null check for artistId parameter

- [status:done] **File**: packages/mobile/src/query/reviews.ts:72
  - **Issue**: `getNextPageParam` will return `undefined` when `hasMore` is false, but it calculates next offset even when the API didn't return the `hasMore` field (e.g., due to API error or version mismatch), causing infinite loading states
  - **Fix**: Add defensive check: `getNextPageParam: (lastPage) => lastPage?.pagination?.hasMore === true ? lastPage.pagination.offset + lastPage.pagination.limit : undefined`
  - **Resolution**: Added defensive check with optional chaining to prevent infinite loading states

### Minor

- [status:done] **File**: packages/api/src/controllers/artistController.ts:141
  - **Issue**: Debug statement `logger.debug({ artistId, limit, offset }, 'Getting artist reviews')` logs production traffic data that should not be in production
  - **Fix**: Remove the debug log or wrap it in a development-only conditional check
  - **Resolution**: Removed debug logging to prevent logging production traffic data

- [status:done] **File**: packages/api/src/controllers/artistController.ts:156
  - **Issue**: Debug statement `logger.debug({ artistId }, 'Getting artist review stats')` logs production traffic that should not be in production
  - **Fix**: Remove the debug log or wrap it in a development-only conditional check
  - **Resolution**: Removed debug logging to prevent logging production traffic data

- [status:done] **File**: packages/api/src/routes/v1/artist.ts:13-24
  - **Issue**: Missing validation for `req.params.artistId` being undefined/null before passing to `validateUUIDParam`. While Express should guarantee params exist, defensive programming suggests checking for undefined.
  - **Fix**: Add null check: `if (!artistId) { return res.status(400).json({ error: 'artistId parameter is required' }); }`
  - **Resolution**: Added null check for artistId parameter before validation

- [status:done] **File**: packages/mobile/src/api/client.ts:399
  - **Issue**: Query string construction uses `query.size` which returns the number of entries, not a boolean. While this works (0 is falsy), it's less readable than an explicit boolean check.
  - **Fix**: Use explicit check: `const path = query.size > 0 ? ...` for clarity
  - **Resolution**: Changed to explicit boolean check for better readability

### Enhancement

- [status:done] **File**: packages/api/src/services/reviewService.ts:201-214
  - **Issue**: The pagination method `getReviewsForArtistWithPagination` doesn't return total count, making it impossible for clients to calculate "page X of Y" or show a progress indicator
  - **Fix**: Consider adding optional total count to the return value: `{ reviews, hasMore, totalCount?: number }`. This would require an additional COUNT query, so document the performance tradeoff.
  - **Resolution**: Enhancement documented but not implemented due to performance tradeoffs (additional COUNT query required)

- [status:done] **File**: packages/mobile/src/screens/ArtistProfileScreen.tsx:44-45
  - **Issue**: Reviews are flattened from pages with `.flatMap()` every render when `reviewsData` changes. For large datasets (100+ reviews), this creates unnecessary array operations on every render.
  - **Fix**: Memoize the flattened array: `const reviews = useMemo(() => reviewsData?.pages.flatMap((page) => page.reviews) ?? [], [reviewsData]);`
  - **Resolution**: Added useMemo to prevent unnecessary array operations on every render

- [status:done] **File**: packages/api/src/controllers/artistController.ts:125
  - **Issue**: Cache-Control header `public, max-age=60, s-maxage=300` allows CDN to serve stale reviews for 5 minutes, but clients only cache for 1 minute, creating inconsistent data freshness across clients
  - **Fix**: Consider aligning cache durations or adding `stale-while-revalidate` directive for better consistency: `public, max-age=60, s-maxage=300, stale-while-revalidate=60`
  - **Resolution**: Added stale-while-revalidate directive for better cache consistency between client and CDN

## Highlights

- **Excellent input validation**: The `validateArtistId` middleware properly validates UUID format before processing requests, preventing injection attacks and providing clear error messages
- **Defensive pagination**: The `parsePaginationParams` utility enforces min/max bounds and provides sensible defaults, preventing resource exhaustion from unbounded queries
- **Good type safety at boundaries**: The `mapReviewToResponse` function in the repository consistently converts Date objects to ISO strings, maintaining type safety across the serialization boundary
- **Proper error handling**: Error handlers in the controller properly delegate to Express error middleware using `next(error)`, ensuring centralized error processing
- **Cache strategy**: Cache-Control headers are thoughtfully applied to public endpoints to reduce backend load while balancing data freshness
- **Idempotent review submission**: The review service handles duplicate submission attempts gracefully by returning the existing review, preventing double-posts from UI glitches

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency (e.g., all date fields, all validation, all auth checks)
- [x] Checked for debug statements (console.log, console.error, debugger)
- [x] Verified that repository mapping functions convert types correctly (especially Date → string)
- [x] Searched for sensitive data being logged (tokens, passwords, PII)
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed
- [x] Confirmed error handling is present and doesn't leak sensitive info
- [x] Looked for type mismatches at serialization boundaries
