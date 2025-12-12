Date: 2025-12-11
Base: origin/main
Feature: jl/artist-booking-view (working tree)

## High-Level Summary
New booking flows add artist-facing list/detail views and accept/decline/cancel actions, expanding both API endpoints and mobile UI to support artist triage plus status history display. Changes reuse shared booking UI components, add status filtering/query hooks, and extend server-side status handling and notifications.

## Prioritized Issues
### Critical

### Major
- [status:story] File: packages/api/src/services/bookingService.ts:56-76
  - Issue: Decline/cancel flows update booking status/history but never void or refund the original payment authorization, leaving paymentStatus unchanged and potential holds in place when a request is rejected.
  - Fix: Invoke PaymentService to void/refund on decline/cancel and persist the resulting paymentStatus (and timestamps) alongside the status change.
- [status:story] File: packages/api/src/controllers/bookingController.ts:132-160
  - Issue: PATCH /api/v1/bookings/:bookingId/status now only accepts confirmed/declined, returning 400 for any other status; existing callers that set paid/completed/cancelled via this endpoint will regress.
  - Fix: Either retain the generic status update path (with validation) or introduce a new endpoint for artist-only transitions while keeping the existing contract for other status updates.

### Minor
- [status:todo] File: packages/api/src/controllers/bookingController.ts:10-209
  - Issue: Newly added artist list/detail/accept/decline/cancel endpoints and mobile artist booking screens lack automated tests, so the new flows aren’t guarded against regressions or auth/role edge cases.
  - Fix: Add API tests covering authZ, allowed transitions, payment side-effects, and React Native component/query tests for the artist list/detail flows (happy and failure states).

### Enhancement

## Highlights
- Consolidated booking status UI into reusable components (badge/history) and shared booking card, reducing duplication across customer and artist screens.
- Added status filtering and query invalidation for bookings, keeping detail and list views consistent after accept/decline/cancel actions.
- API now supports artist-specific booking listing with pagination and status filters while preserving status history entries during transitions.
