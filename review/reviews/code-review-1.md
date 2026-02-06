# Code Review: Home Screen Booking Flow

**Date:** 2026-02-07
**Base Ref:** `origin/main` (9a583d3)
**Feature Ref:** `jl/home-booking-flow` (28b8a4c)

---

## High-Level Summary

**Product impact:** This change introduces a redesigned home screen experience that allows customers to discover nearby, available artists by selecting their location and desired appointment time. Users can browse artist carousels filtered by service type (hair, makeup, or combo), tap an artist to view their profile, and seamlessly initiate a booking with pre-populated context.

**Engineering approach:** The implementation follows a clean vertical slice pattern—new API endpoint with input validation and caching, a dedicated availability service, React Native components with proper accessibility attributes, React Query for data fetching with appropriate stale/cache times, and a new Zustand store entry path (`homeEntry`) to carry pre-selected booking context through the flow.

---

## Prioritized Issues

### Critical

_None identified._

### Major

- [status:done] File: `packages/api/src/services/artistAvailabilityService.ts:85-99`
  - Issue: `checkMultipleArtistsAvailability` fetches **all** overlapping bookings globally, then filters by `artistIds` in JavaScript. This can load unnecessary rows and causes O(n) filtering where n = total conflicting bookings system-wide.
  - Fix: Add an `inArray(bookings.artistId, artistIds)` condition to the SQL WHERE clause to limit results at the database level.
  - Resolution: Added `inArray(bookings.artistId, artistIds)` to WHERE clause; filtering now happens at DB level.

- [status:done] File: `packages/api/src/services/searchService.ts:60-81`
  - Issue: `searchArtistsFiltered` loads up to 100 verified artists into memory and filters by service type and location in JavaScript. As the artist pool grows, this will degrade performance.
  - Fix: Push service-type filtering into the SQL query using a JSON containment operator or indexed column, and consider bounding-box pre-filtering for location before Haversine calculation.
  - Resolution: Pushed service-type filtering to SQL using PostgreSQL JSONB `?` operator; location filtering remains in JS (see PostGIS enhancement story).

### Minor

- [status:done] File: `packages/mobile/src/components/home/LocationPickerModal.tsx:2`
  - Issue: `Pressable` is imported but never used.
  - Fix: Remove the unused import.
  - Resolution: Already resolved - `Pressable` import no longer present in current code.

- [status:done] File: `packages/mobile/src/components/home/TimePickerModal.tsx:84`
  - Issue: The `onShow` prop on React Native `Modal` is iOS-only; on Android, `handleModalShow` will never execute, leaving temp state potentially stale when re-opening.
  - Fix: Use `useEffect` keyed to `visible` to reset state when the modal opens, ensuring cross-platform consistency.
  - Resolution: Replaced `onShow` callback with `useEffect` keyed to `visible` prop for cross-platform state reset.

- [status:done] File: `packages/api/src/controllers/artistController.ts:179-180`
  - Issue: Cache-Control header marks the response as `public`, but results are personalized (based on user-specified lat/lng/dateTime). Intermediate caches (CDNs, proxies) could serve the wrong data to other users.
  - Fix: Change to `private, max-age=60` or include `Vary: *` to prevent shared-cache misuse.
  - Resolution: Changed to `private, max-age=60` to prevent shared-cache misuse.

- [status:done] File: `packages/mobile/src/screens/booking/BookingFlowScreen.tsx:45-55`
  - Issue: For `homeEntry`, the code relies on `initializeFromHome` having been called externally before navigation. If a deep-link or race condition skips that call, the store may be uninitialized.
  - Fix: Add a guard that checks required fields (`selectedArtistId`, `locationCoordinates`) and falls back to the regular flow with a warning if data is missing.
  - Resolution: Added guard to verify `selectedArtistId` and `locationCoordinates` exist; falls back to celebrity flow with console warning if missing.

### Enhancement

- [status:story] File: `packages/api/src/services/searchService.ts`
  - Issue: Location filtering uses the Haversine formula in JS for every artist. This works for small datasets but does not scale.
  - Fix: Consider a PostGIS `ST_DWithin` query or a bounding-box index to offload geospatial filtering to the database.
  - Story: [postgis-geospatial-filtering.md](../stories/postgis-geospatial-filtering.md)

- [status:story] File: `packages/mobile/src/screens/booking/artist/ArtistDetailScreen.tsx:72-81`
  - Issue: When navigating from home without complete pre-selection data, the fallback silently enters the regular booking flow. Users may be confused why their selections were lost.
  - Fix: Show a toast or inline message explaining the fallback, or prevent the book button from being active until all required data is present.
  - Story: [home-booking-fallback-ux-feedback.md](../stories/home-booking-fallback-ux-feedback.md)

- [status:story] File: `packages/mobile/src/store/bookingFlowStore.ts:458-468`
  - Issue: The `location` string is passed directly from `preselectedLocation`, which may be empty if reverse geocoding failed, while `locationCoordinates` is set. This can create UI inconsistency.
  - Fix: Derive a fallback display string (e.g., "현재 위치") when `location` is empty but coordinates exist.
  - Story: [location-display-fallback-string.md](../stories/location-display-fallback-string.md)

---

## Highlights

- **Thorough input validation** in `artistController.searchArtistsFiltered`: required params, type coercion, and ISO date validation before touching the DB.
- **Accessibility done right**: All new touchable components include `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint`.
- **Separation of concerns**: Availability logic is isolated in `ArtistAvailabilityService`, making it unit-testable and reusable.
- **React Query best practices**: `staleTime` and `gcTime` are set sensibly; queries are disabled until prerequisites are met.
- **Localized strings**: Korean UI copy is centralized in `newHomeStrings.ts`, following the project's existing i18n pattern.
- **Safe route ordering**: `/search/filtered` route is declared before `/:artistId` to avoid param collision—documented with a clear comment.
