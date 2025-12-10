Date: 2025-12-09
Base Ref: origin/main
Feature Ref: jl/view-bookings-screen

## High-Level Summary
Customer-facing bookings now have a GET endpoint that supports optional status filtering and is surfaced through the mobile app with new list/detail screens and navigation entry points. The API repository joins artist data and enriches booking summaries, while the mobile client leverages React Query to fetch bookings with status chips and detail UI for schedule, artist, and service information.

## Prioritized Issues
### Critical
- [status:ignored] File: (none)  
  - Issue: No critical issues identified in this diff.  
  - Fix: No action needed.

### Major
- [status:ignored] File: (none)  
  - Issue: No major issues identified in this diff.  
  - Fix: No action needed.

### Minor
- [status:done] File: packages/api/src/repositories/bookingRepository.ts:119-150  
  - Issue: Customer bookings query returns the full history without pagination or explicit sort on start time, which can lead to slow responses and heavy payloads for long-tenured users.  
  - Fix: Accept `limit`/`offset` (or cursor) and sort by scheduled start time descending; enforce an upper bound to keep responses lightweight.  
  - Note: Added limit/offset with default 20, max 50, ordered by scheduled start desc.
- [status:done] File: packages/mobile/src/screens/BookingsListScreen.tsx:31-38  
  - Issue: The status filter chips omit the `paid` state that exists in `BookingStatus`, so users cannot narrow to paid bookings.  
  - Fix: Add a `paid` chip and ensure it maps through to the status query param.  
  - Note: Added a `paid` filter chip that forwards the status to the query.
- [status:done] File: packages/mobile/src/screens/BookingDetailScreen.tsx:121-122  
  - Issue: The detail screen defaults the timezone label to `Asia/Seoul` when the backend does not supply one, which can mislead users in other regions.  
  - Fix: Show the backend-supplied timezone when present; otherwise display an “미지정”/“Unknown” indicator instead of a hardcoded zone.  
  - Note: Timezone now uses backend value or falls back to “미지정”.

### Enhancement
- [status:done] File: packages/mobile/src/screens/BookingDetailScreen.tsx:153-166  
  - Issue: Status history and payment status are now provided by the API but not surfaced, missing an opportunity to give users clarity on booking progress and payments.  
  - Fix: Render a timeline or simple list for `statusHistory` and display `paymentStatus` when available.  
  - Note: Payment status and chronological status history are now shown in detail view.

## Highlights
- Status-aware booking list endpoint validates the `status` query against shared constants before querying.
- Repository now joins artist data, enriching booking summaries with artist names for display.
- Mobile screens handle loading and error states with retry affordances and accessible touch targets.
