# Bug Analysis Report

**Date:** 2026-01-08
**Base Ref:** origin/main
**Feature Ref:** jl/add-kakao-maps
**Analyzed by:** Bugbot

---

## High-Level Summary

**Risk Assessment:** This feature introduces Kakao Maps integration for location services across the mobile app and API. The primary risks include potential API key exposure in logs, missing rate limiting on geocoding endpoints, and minor type consistency issues between mobile and shared packages. The core logic is sound with good error handling patterns.

**Analysis Scope:** Focus on geocoding API endpoints, mobile location components (LocationPicker, MapAddressPicker, AddressSearchBar), Kakao service integrations, and type definitions. Cross-file analysis performed between `@524/shared` types and mobile/API implementations.

---

## Prioritized Issues

### Critical

*No critical issues identified.*

### Major

- [status:done] File: [geocode.ts:51](packages/api/src/routes/v1/geocode.ts#L51) | Replaced console.error with structured logger
  - Issue: Debug `console.error` statement logs full error object which could include sensitive API response details in production logs
  - Fix: Use structured logger (`createLogger`) instead of console.error, and sanitize error output to avoid logging full Kakao API responses which may contain internal details

- [status:done] File: [geocode.ts:76](packages/api/src/routes/v1/geocode.ts#L76) | Replaced console.error with structured logger
  - Issue: Debug `console.error` statement logs full error object in keyword-search route
  - Fix: Replace with structured logger and sanitize error output

- [status:done] File: [geocode.ts:110](packages/api/src/routes/v1/geocode.ts#L110) | Replaced console.error with structured logger
  - Issue: Debug `console.error` statement logs full error object in reverse-geocode route
  - Fix: Replace with structured logger and sanitize error output

- [status:done] File: [geocodeService.ts:128](packages/api/src/services/geocodeService.ts#L128) | Replaced with debug-level structured logging
  - Issue: `console.log` debug statement logs cache hit with address data - could expose user search patterns in production logs
  - Fix: Remove or replace with debug-level structured logging that can be disabled in production

- [status:done] File: [geocodeService.ts:152](packages/api/src/services/geocodeService.ts#L152) | Replaced with debug-level structured logging
  - Issue: `console.warn` logs the searched address when no results found - could expose user search queries
  - Fix: Use structured logging with appropriate log levels

- [status:done] File: [geocodeService.ts:172](packages/api/src/services/geocodeService.ts#L172) | Replaced with debug-level structured logging
  - Issue: `console.log` logs cached result with address data
  - Fix: Remove or use debug-level structured logging

- [status:done] File: [geocodeService.ts:177](packages/api/src/services/geocodeService.ts#L177) | Replaced with structured logger, sanitized error details
  - Issue: `console.error` logs full Kakao API error response which could include sensitive API details
  - Fix: Use structured logger and sanitize error details

- [status:done] File: [geocodeService.ts:201](packages/api/src/services/geocodeService.ts#L201), [255](packages/api/src/services/geocodeService.ts#L255), [282](packages/api/src/services/geocodeService.ts#L282) | Replaced with structured logging
  - Issue: Multiple `console.log` debug statements in keywordSearch and reverseGeocode functions logging query/coordinate data
  - Fix: Replace all with structured logging using appropriate levels

- [status:story] File: [geocode.ts](packages/api/src/routes/v1/geocode.ts) | Story: [geocode-rate-limiting-caching.md](../stories/geocode-rate-limiting-caching.md)
  - Issue: No rate limiting on geocoding endpoints - external Kakao API has rate limits and could be exhausted by excessive client requests
  - Fix: Add rate limiting middleware to protect both the app and Kakao API quota (consider IP-based or user-based rate limiting)

### Minor

- [status:done] File: [geocodeService.ts:260-267](packages/api/src/services/geocodeService.ts#L260-L267) | Already fixed above in Major section
  - Issue: `console.error` statements log Kakao API errors with full response data
  - Fix: Use structured logger

- [status:done] File: [geocodeService.ts:309](packages/api/src/services/geocodeService.ts#L309) | Already fixed above in Major section
  - Issue: `console.warn` logs coordinates when no reverse geocode results found
  - Fix: Use structured logging

- [status:done] File: [geocodeService.ts:332-349](packages/api/src/services/geocodeService.ts#L332-L349) | Already fixed above in Major section
  - Issue: Multiple `console.error` statements logging Kakao API errors with detailed response info
  - Fix: Use structured logger and avoid logging full API responses

- [status:done] File: [kakaoService.ts:14](packages/mobile/src/services/kakaoService.ts#L14) | Removed console.error
  - Issue: `console.error` logs geocoding failures on mobile client
  - Fix: Consider removing client-side error logging or using a proper mobile logging solution

- [status:done] File: [kakaoService.ts:47](packages/mobile/src/services/kakaoService.ts#L47) | Removed console.error
  - Issue: `console.error` logs keyword search failures
  - Fix: Remove or use proper mobile logging

- [status:done] File: [kakaoService.ts:69](packages/mobile/src/services/kakaoService.ts#L69) | Removed console.error
  - Issue: `console.error` logs reverse geocoding failures
  - Fix: Remove or use proper mobile logging

- [status:done] File: [useCurrentLocation.ts:51](packages/mobile/src/hooks/useCurrentLocation.ts#L51) | Removed console.error
  - Issue: `console.error` logs location errors
  - Fix: Remove debug logging or use proper mobile logging solution

- [status:done] File: [AddressSearchBar.tsx:62](packages/mobile/src/components/location/AddressSearchBar.tsx#L62) | Removed console.error
  - Issue: `console.error` logs search errors
  - Fix: Remove debug logging

- [status:done] File: [LocationPicker.tsx:204](packages/mobile/src/components/location/LocationPicker.tsx#L204) | Removed console.error
  - Issue: `console.error` logs reverse geocode errors
  - Fix: Remove debug logging

- [status:done] File: [LocationPicker.tsx:279](packages/mobile/src/components/location/LocationPicker.tsx#L279) | Removed console.error
  - Issue: `console.error` logs GPS reverse geocode errors
  - Fix: Remove debug logging

- [status:done] File: [MapAddressPicker.tsx:175](packages/mobile/src/components/location/MapAddressPicker.tsx#L175) | Removed console.error
  - Issue: `console.error` logs reverse geocode errors
  - Fix: Remove debug logging

- [status:done] File: [MapAddressPicker.tsx:233](packages/mobile/src/components/location/MapAddressPicker.tsx#L233) | Removed console.error
  - Issue: `console.error` logs GPS reverse geocode errors
  - Fix: Remove debug logging

- [status:done] File: [DaumPostcodeSearch.tsx:79](packages/mobile/src/components/location/DaumPostcodeSearch.tsx#L79) | Removed console.error
  - Issue: `console.error` logs message parsing failures
  - Fix: Remove debug logging

- [status:done] File: [DaumPostcodeSearch.tsx:170](packages/mobile/src/components/location/DaumPostcodeSearch.tsx#L170) | Removed console.error
  - Issue: `console.error` logs message parsing failures in native component
  - Fix: Remove debug logging

### Enhancement

- [status:done] File: [geocodeCache.ts:7](packages/api/src/services/geocodeCache.ts#L7) | Story: [geocode-cache-monitoring.md](../stories/geocode-cache-monitoring.md)
  - Issue: Logger is imported but not used consistently - `logCacheStats` function exists but cache statistics are not automatically logged on any schedule
  - Fix: Added periodic cache stats logging (configurable via GEOCODE_CACHE_STATS_INTERVAL_MS env var, default 5 min) and exposed cache stats via health endpoint

- [status:ignored] File: [LocationPicker.tsx:14-18](packages/mobile/src/components/location/LocationPicker.tsx#L14-L18) vs [types/kakao.ts](packages/mobile/src/types/kakao.ts) | Deferred - existing story [consolidate-geocoding-types.md](../stories/consolidate-geocoding-types.md) covers this
  - Issue: `LocationData` and `LocationDataWithAddress` types are defined locally in LocationPicker.tsx rather than being centralized with other Kakao/geocoding types
  - Fix: Consider moving these types to `types/kakao.ts` or `@524/shared` for consistency with other location-related types

- [status:ignored] File: [DaumPostcodeSearch.tsx:217](packages/mobile/src/components/location/DaumPostcodeSearch.tsx#L217)
  - Issue: `originWhitelist={['*']}` allows all origins in WebView - this is intentional for loading the Daum postcode script from CDN
  - Fix: N/A - This is necessary for the widget to function and is contained within a controlled context

---

## Highlights

- **Good error handling pattern**: The geocoding service properly handles and caches "not found" results to prevent repeated lookups for non-existent addresses, reducing unnecessary API calls
- **Type consistency**: Shared types in `@524/shared` are properly used across both API and mobile packages through re-exports
- **Input validation**: All API endpoints use Zod schemas with appropriate constraints (address length, coordinate ranges, pagination limits)
- **Cache implementation**: Well-designed LRU cache with TTL and wrapper type to distinguish between "not cached" and "cached as not found"
- **Debounced operations**: Both AddressSearchBar and LocationPicker properly debounce user input to prevent excessive API calls
- **Platform-aware components**: InteractiveKakaoMap and DaumPostcodeSearch correctly use platform-specific implementations (web iframe vs native WebView)
- **Graceful fallbacks**: Location components provide coordinate-based fallback addresses when reverse geocoding fails
- **Keyboard handling**: AddressSearchBar implements proper blur delay to ensure touch events register before dropdown hides

---

## Pre-Submission Checklist

- [x] Read type definition files for any interfaces/types used in changed files
- [x] Compared all similar patterns within each file for consistency
- [x] Checked for debug statements (console.log, console.error, debugger) - **Multiple found, see Minor issues**
- [x] Verified that repository mapping functions convert types correctly
- [x] Searched for sensitive data being logged - **Address/coordinate logging found in debug statements**
- [x] Checked that new fields follow the same patterns as existing fields
- [x] Verified authorization checks exist where needed - Geocode routes are public (appropriate for maps)
- [x] Confirmed error handling is present and doesn't leak sensitive info - **Error logging needs attention**
- [x] Looked for type mismatches at serialization boundaries - Types are consistent
