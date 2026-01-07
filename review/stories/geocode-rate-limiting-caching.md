# Implement Rate Limiting and Caching for Geocode Service

**Role**: Developer
**Priority**: Medium
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer
**I want** to implement rate limiting and caching for Kakao API geocoding calls
**So that** we avoid quota exhaustion and improve response times for repeated lookups

## Detailed Description

The current `geocodeService.ts` makes direct calls to the Kakao API without any rate limiting or caching. This presents two risks:

1. **Quota Exhaustion**: High traffic or repeated requests could exhaust the Kakao API quota
2. **Unnecessary Latency**: Repeated geocoding for the same addresses adds unnecessary API round-trips

Implementing an LRU cache for recent geocode lookups and rate limiting would:
- Protect against quota exhaustion
- Improve response times for cached results
- Reduce load on Kakao API
- Provide better error handling for rate-limited requests

## Acceptance Criteria

### Functional Requirements

- **Given** a cached address - **When** geocodeAddress is called - **Then** cached result is returned without API call
- **Given** cache miss - **When** geocodeAddress is called - **Then** API is called and result is cached
- **Given** rate limit exceeded - **When** API call is attempted - **Then** request is queued or gracefully degraded
- **Given** stale cache entry - **When** TTL expires - **Then** next request refreshes from API

### Non-Functional Requirements

- **Performance**: Cached responses return in < 5ms
- **Reliability**: Rate limiting prevents API quota exhaustion
- **Memory**: Cache size limited to prevent memory bloat (e.g., 1000 entries max)

## User Experience Flow

1. User triggers geocoding operation (search, reverse geocode)
2. Service checks LRU cache for existing result
3. If cached: return immediately
4. If not cached: check rate limit
5. If within rate limit: call API, cache result, return
6. If rate limited: queue request or return error with retry guidance

## Technical Context

- **Epic Integration**: Infrastructure reliability and performance
- **System Components**: `packages/api/src/services/geocodeService.ts`
- **Data Requirements**: In-memory cache (consider Redis for distributed deployments)
- **Integration Points**: All geocode route handlers

## Definition of Done

- [x] LRU cache implemented for geocodeAddress
- [x] LRU cache implemented for reverseGeocode
- [x] Cache TTL configurable (default: 1 hour)
- [x] Rate limiting implemented with configurable limits (using existing rate limiter middleware)
- [x] Graceful degradation when rate limited
- [x] Cache hit/miss metrics logged
- [ ] Unit tests for caching behavior (blocked by Jest config issues)

## Notes

Originated from code review of Kakao Maps integration (code-review-1.md). The current implementation works but could be problematic under high load. Consider using a library like `lru-cache` for the implementation.

Potential libraries:
- `lru-cache` for in-memory caching
- `p-ratelimit` or `bottleneck` for rate limiting

## Related Stories

- [Kakao Maps Integration](../reviews/code-review-1.md): Source review identifying this issue
