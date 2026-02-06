# Bug Analysis Report

**Date**: 2026-02-07
**Base Ref**: `origin/main`
**Feature Ref**: `jl/home-booking-flow`
**Analyzer**: Bugbot

---

## High-Level Summary

**Risk Assessment**: This change introduces a new home screen booking flow with geospatial artist search and availability checking. The most critical risk is a logic bug in the availability service that fails to filter by requested artist IDs, which could cause incorrect availability results and performance degradation. Additionally, there are error handling gaps that could lead to silent failures in the user-facing components.

**Analysis Scope**: API services (artist search, availability checking), mobile home screen components (carousels, location picker, time picker), booking flow navigation, and the booking flow store. Cross-file analysis focused on type consistency at API boundaries and consistency of patterns within files.

---

## Prioritized Issues

### Critical

- [status:done] File: `packages/api/src/services/artistAvailabilityService.ts:80-94` — Fix already applied: `inArray(bookings.artistId, artistIds)` is present in query at line 94.
  - Issue: `checkMultipleArtistsAvailability` does not filter by the provided `artistIds` array in the database query. It fetches ALL conflicting bookings across the entire system, then filters in JavaScript. This causes incorrect results when artists not in the requested list have conflicts (they're incorrectly excluded from results) and significant performance issues at scale.
  - Fix: Add an `inArray(bookings.artistId, artistIds)` condition to the WHERE clause:
    ```typescript
    .where(
      and(
        inArray(bookings.artistId, artistIds), // ADD THIS
        or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
        lte(bookings.scheduledStartTime, requestedEnd),
        gte(bookings.scheduledEndTime, requestedStart)
      )
    )
    ```

### Major

- [status:done] File: `packages/mobile/src/screens/HomeScreen.tsx:90-105` — Added `locationError` state, error message in catch block, and error display in UI.
  - Issue: GPS location initialization silently swallows errors with an empty catch block. If `getCurrentLocation()` fails or `reverseGeocodeLocation()` throws, the user sees no feedback about why location-based carousels aren't working.
  - Fix: Add error state handling and display a user-friendly message when location initialization fails:
    ```typescript
    } catch (error) {
      setLocationError('위치를 가져올 수 없습니다. 수동으로 선택해주세요.');
    } finally {
    ```

- [status:done] File: `packages/mobile/src/screens/HomeScreen.tsx:111-120` — Added `error` prop to ArtistCarousel component and passed error states from useHomeArtistSearch.
  - Issue: Error states from `useHomeArtistSearch` (e.g., `comboArtists.error`, `hairArtists.error`, `makeupArtists.error`) are returned but never displayed to the user. Network failures result in empty carousels with no indication of the actual problem.
  - Fix: Add error display logic in the carousel section or show a retry prompt when errors occur.

- [status:done] File: `packages/mobile/src/screens/booking/BookingFlowScreen.tsx:41-53` — Removed redundant `setEntryPath` and `setStep` calls for homeEntry path; relies on atomic `initializeFromHome` action.
  - Issue: The useEffect has potential state inconsistency. For `homeEntry` path, it calls `setEntryPath` then `setStep` as separate operations, but these could theoretically interleave with other state updates. The flow works because Zustand batches synchronous updates, but this implicit dependency is fragile.
  - Fix: Use the existing `initializeFromHome` action which already sets both `entryPath` and `currentStep` atomically, rather than calling them separately in the useEffect.

### Minor

- [status:done] File: `packages/mobile/src/components/home/LocationPickerModal.tsx:2` — Already fixed: import does not contain `Pressable`.
  - Issue: `Pressable` is imported from `react-native` but never used in the component (only `TouchableOpacity` is used).
  - Fix: Remove unused import: `import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';`

- [status:done] File: `packages/api/src/services/searchService.ts:102-105` — Added runtime type validation before accessing coordinates.
  - Issue: Type assertion `row.primaryLocation as { latitude: number; longitude: number } | null` assumes the JSON column structure without runtime validation. If the database contains malformed data, this could cause runtime errors.
  - Fix: Add a type guard or validation before accessing `location.latitude` and `location.longitude`:
    ```typescript
    const location = row.primaryLocation;
    if (!location || typeof location !== 'object' ||
        typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return false;
    }
    ```

- [status:ignored] File: `packages/api/src/services/artistAvailabilityService.ts:31` — Debug logging is disabled in production by environment configuration; no code change needed.
  - Issue: `logger.debug` logs include potentially sensitive booking check details (artistId, requestedStart, requestedEnd). While debug-level, this could log user activity patterns.
  - Fix: Consider whether this level of logging detail is necessary in production, or ensure debug logging is disabled in production environments.

- [status:done] File: `packages/api/src/services/searchService.ts:67,147-154` — Changed line 67 to `logger.debug` for detailed params; lines 147-154 remain `logger.info` as they only log summary counts.
  - Issue: `logger.info` calls log detailed search parameters including user coordinates. This is operational logging, but the verbosity level may be inappropriate for production.
  - Fix: Consider changing to `logger.debug` for the detailed parameter logging, keeping only summary info at `logger.info` level.

### Enhancement

- [status:done] File: `packages/api/src/controllers/artistController.ts:181` — Already fixed: Cache-Control is set to `private, max-age=60`.
  - Issue: `Cache-Control: public, max-age=60` is set for the filtered search endpoint. While the 60-second cache helps reduce load, marking it as `public` means CDNs/proxies could cache responses. Since the response varies by location, time, and service type (all in query params), this should work correctly, but verify CDN configuration respects query string variations.
  - Fix: Consider using `private` if CDN behavior is uncertain, or ensure the CDN is configured to include query parameters in cache keys.

- [status:done] File: `packages/mobile/src/components/home/ArtistCarousel.tsx:27` — Added `testID` prop to interface, function params, and container View.
  - Issue: `keyExtractor` uses `item.id` which is correct, but the component lacks a `testID` prop for automated testing.
  - Fix: Add `testID` prop to the component for better testability.

- [status:story] File: `packages/api/src/services/searchService.ts:98` → [adaptive-artist-search-pagination.md](../stories/adaptive-artist-search-pagination.md)
  - Issue: The hardcoded `.limit(100)` for the initial fetch could be insufficient in areas with many artists, or wasteful in sparse areas. Consider making this configurable or using cursor-based pagination.
  - Fix: Future enhancement - implement adaptive limits or pagination based on density.

---

## Highlights

- **Good input validation in controller**: `artistController.ts:130-168` validates all required parameters (serviceType, lat, lng, dateTime) with appropriate error messages and type checking before passing to the service layer.

- **Proper date validation**: The controller validates that `dateTime` is a valid ISO string by parsing it and checking for `NaN`, preventing invalid date processing.

- **Service type validation with whitelist**: Using a whitelist (`validServiceTypes`) to validate `serviceType` is a secure pattern that prevents injection of arbitrary values.

- **Haversine formula implementation**: `calculateDistanceKm` correctly implements the Haversine formula for geospatial distance calculations.

- **Proper use of TypeScript discriminated unions**: The `EntryPath` type in `bookingFlowStore.ts` is correctly extended with `'homeEntry'` and the code handles all cases appropriately.

- **Atomic state initialization**: The `initializeFromHome` action in the booking store correctly resets to initial state before setting new values, preventing state pollution from previous flows.

- **Query key structure**: The `useHomeArtistSearch` hook uses well-structured query keys that include all relevant parameters for proper cache invalidation.

- **Accessibility support**: Components consistently include `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` props for screen reader support.

---

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency
- [x] Checked for debug statements (console.log, console.error, debugger) - none found
- [x] Verified that repository mapping functions convert types correctly
- [x] Searched for sensitive data being logged - found coordinate logging (noted as Minor)
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed - endpoint is intentionally public
- [x] Confirmed error handling is present and doesn't leak sensitive info
- [x] Looked for type mismatches at serialization boundaries - found JSON type assertion (noted as Minor)
