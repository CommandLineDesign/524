# Code Review: Artist Booking View Implementation

**Date:** Wednesday Dec 17, 2025
**Base Branch:** origin/main
**Feature Branch:** origin/jl/artist-booking-view

## High-Level Summary

This change implements a comprehensive artist booking management system that enables artists to view, accept, and decline booking requests through dedicated mobile screens. The implementation delivers significant product value by giving artists full control over their booking workflow, improving response times and user experience. From an engineering perspective, it follows solid architectural patterns with proper separation of concerns, role-based access control, and a well-defined state machine for booking status transitions across API, mobile, and admin layers.

## Prioritized Issues

### Critical

### Major
- [status:done] packages/api/src/controllers/bookingController.ts:69-136
  - Issue: Authorization logic is duplicated across controller methods (getBookingById, updateBookingStatus, acceptBooking, declineBooking, cancelPendingBooking)
  - Fix: Extract role-checking logic into a reusable middleware function or service method to reduce duplication and improve maintainability
  - Applied: Extracted `getUserRoles()` and `canAccessBooking()` utility functions to eliminate duplication

- [status:done] packages/api/src/controllers/bookingController.test.ts:1-68
  - Issue: Test coverage is minimal - only covers authentication failures for new methods, missing success paths, error scenarios, and business logic validation
  - Fix: Add comprehensive test cases covering all booking operations, status transitions, authorization scenarios, and error conditions
  - Applied: Added comprehensive test suite with authentication, authorization, success paths, error scenarios, and business logic validation

### Minor
- [status:done] packages/mobile/src/screens/ArtistBookingDetailScreen.tsx:74-84
  - Issue: Error messages are generic ("승인에 실패했습니다") without specific context about what went wrong
  - Fix: Use more descriptive error messages based on the actual error response from the API
  - Applied: Added getBookingErrorMessage helper function that maps API errors to user-friendly Korean messages

- [status:done] packages/mobile/src/navigation/AppNavigator.tsx:81-105
  - Issue: Navigation logic has become complex with multiple conditions for artist access control and profile validation
  - Fix: Extract the artist access logic into a custom hook or utility function to improve readability
  - Applied: Created useInitialRoute custom hook to encapsulate navigation logic and determine initial route

### Enhancement
- [status:done] packages/mobile/src/screens/ArtistBookingsListScreen.tsx:34-60
  - Issue: No loading states shown during filter changes, only during initial load
  - Fix: Add loading indicators when switching between status filters to improve perceived performance
  - Applied: Used isFetching instead of isLoading to show loading indicators during filter changes with appropriate messages

- [status:done] packages/api/src/services/bookingService.ts:54-96
  - Issue: Status transition validation is hardcoded in the service layer
  - Fix: Consider moving the allowed transitions configuration to a shared constants file for better maintainability
  - Applied: Created BOOKING_STATUS_TRANSITIONS constants file and isValidStatusTransition utility function in shared package

## Highlights

- **Well-architected state machine**: The booking status transition logic is robust with clear validation of allowed state changes, preventing invalid transitions
- **Comprehensive role-based access**: Clean separation of customer, artist, and admin permissions with proper authorization checks throughout the API
- **Mobile-first UX**: The artist booking screens provide an intuitive interface with status filtering, detailed booking views, and clear action buttons
- **Proper error handling**: API endpoints return appropriate HTTP status codes and structured error responses
- **Performance considerations**: Database queries include proper pagination and selective column fetching for scalability
- **Accessibility**: Mobile components use proper semantic elements and ARIA attributes where applicable