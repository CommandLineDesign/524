# Code Review: Artist Booking Management System

**Date:** Thursday Dec 11, 2025
**Base Ref:** origin/main
**Feature Ref:** jl/artist-booking-view

## High-Level Summary

This change implements a comprehensive artist booking management system that enables artists to view, accept, and decline customer booking requests. The implementation spans both backend API enhancements and mobile app UI/UX improvements, delivering a complete workflow for artist-side booking management that complements the existing customer booking flow.

**Product impact**: Artists can now efficiently manage incoming booking requests through a dedicated interface, improving response times and user experience for both artists and customers waiting for booking confirmations.

**Engineering approach**: The implementation follows established patterns with proper separation of concerns, using a layered architecture (controllers → services → repositories) and reusable React components. The mobile app leverages React Query for state management and maintains consistent design patterns.

## Prioritized Issues

### Critical
- [status:done] **File:** `packages/api/src/controllers/bookingController.ts:105-113`
  **Issue:** The `updateBookingStatus` endpoint accepts any status change without business logic validation
  **Fix:** Restructure to use specific accept/decline endpoints instead of generic status updates, as implemented correctly in the new endpoints  
  **Notes:** Added role-checked accept/decline handling plus validated transitions for other statuses and broadened status endpoint auth to support admin/artist with safeguards.

### Major
- [status:story] **File:** `packages/api/src/services/bookingService.ts:56-76`
  **Issue:** Decline/cancel flows update booking status/history but never void or refund the original payment authorization, leaving paymentStatus unchanged and potential holds in place when a request is rejected
  **Fix:** Invoke PaymentService to void/refund on decline/cancel and persist the resulting paymentStatus (and timestamps) alongside the status change  
  **Story:** [release-payment-holds-on-booking-declines](../stories/release-payment-holds-on-booking-declines.md)

- [status:done] **File:** `packages/api/src/controllers/bookingController.ts:132-160`
  **Issue:** PATCH /api/v1/bookings/:bookingId/status now only accepts confirmed/declined, returning 400 for any other status; existing callers that set paid/completed/cancelled via this endpoint will regress
  **Fix:** Either retain the generic status update path (with validation) or introduce a new endpoint for artist-only transitions while keeping the existing contract for other status updates  
  **Notes:** Expanded status endpoint to allow admin or artist with validated transitions so paid/completed/cancelled remain supported while artist accept/decline keep business logic.

- [status:done] **File:** `packages/api/src/repositories/bookingRepository.ts:264-282`
  **Issue:** The `cancelPendingBooking` method lacks a notification trigger in its service layer
  **Fix:** Add notification call in `bookingService.cancelPendingBooking` method similar to other status change operations  
  **Notes:** Cancellation flow now routes through validated paths that trigger `notifyBookingStatusChanged`, covering customer and admin-driven cancellations.

- [status:done] **File:** `packages/mobile/src/navigation/AppNavigator.tsx:85-95`
  **Issue:** Artist navigation logic assumes artist status but doesn't handle edge cases where user might lose artist privileges
  **Fix:** Add proper error boundaries and fallback navigation for users who lose artist status during session  
  **Notes:** Detect artist profile 403s and fall back to customer flows to avoid broken artist routes when privileges are revoked mid-session.

### Minor
- [status:done] **File:** `packages/api/src/routes/v1/booking.ts:13`
  **Issue:** Admin role access to booking details lacks corresponding controller logic
  **Fix:** Implement admin authorization checks in `getBookingById` controller method to match route permissions  
  **Notes:** Added explicit admin bypass in controller and kept admin access on the route to align with permissions.

- [status:done] **File:** `packages/mobile/src/components/bookings/BookingStatusBadge.tsx:15-19`
  **Issue:** Status badge styling logic treats 'declined' same as 'cancelled' but they have different semantic meanings
  **Fix:** Add distinct styling for 'declined' status to differentiate from 'cancelled' bookings  
  **Notes:** Added separate declined badge color to distinguish it from cancelled.

- [status:story] **File:** `packages/api/src/controllers/bookingController.ts:10-209`
  **Issue:** Newly added artist list/detail/accept/decline/cancel endpoints and mobile artist booking screens lack automated tests
  **Fix:** Add API tests covering authZ, allowed transitions, payment side-effects, and React Native component/query tests for the artist list/detail flows  
  **Story:** [test-coverage-for-artist-booking-flows](../stories/test-coverage-for-artist-booking-flows.md)

### Enhancement
- [status:done] **File:** `packages/api/src/repositories/bookingRepository.ts:18-23`
  **Issue:** Status history building logic is duplicated in multiple methods
  **Fix:** Extract `buildStatusHistory` helper to a shared utility module for better maintainability  
  **Notes:** Moved status history builder into `repositories/statusHistory.ts` and reused in repository methods.

- [status:story] **File:** `packages/mobile/src/screens/ArtistBookingsListScreen.tsx:35`
  **Issue:** Default filter shows only 'pending' bookings, potentially hiding important historical context
  **Fix:** Consider defaulting to 'all' status or adding a visual indicator for pending bookings requiring attention  
  **Story:** [adjust-artist-booking-list-default-filter](../stories/adjust-artist-booking-list-default-filter.md)

- [status:done] **File:** `packages/mobile/src/api/client.ts:31-38`
  **Issue:** API client methods lack consistent error handling patterns
  **Fix:** Standardize error response handling across all booking API methods  
  **Notes:** Introduced ApiError with status/body and normalized network/error parsing for consistent client handling.

## Highlights

- **Excellent Component Reusability**: The new `BookingCard`, `BookingStatusBadge`, and `BookingStatusHistory` components demonstrate strong design system thinking, eliminating code duplication and ensuring consistent UI patterns across customer and artist booking screens.

- **Comprehensive Authorization**: The backend implementation includes thorough role-based access controls with proper error handling for unauthorized access attempts, maintaining security while providing appropriate access for different user types.

- **Robust Error Handling**: Both API and mobile implementations include comprehensive error states with user-friendly messages and retry mechanisms, improving overall user experience during network issues or server errors.

- **Type Safety**: The implementation maintains strong TypeScript typing throughout, with proper interfaces and type guards ensuring compile-time safety for the booking domain logic.

- **Performance Considerations**: The mobile app implements efficient list rendering with proper sorting logic and React Query integration for optimal data fetching and caching behavior.