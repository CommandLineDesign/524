# Geocode Cache Statistics Monitoring

**Role**: Developer
**Priority**: Low
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: XS (1-2 hours)

## Story Statement

**As a** Developer
**I want** geocode cache statistics to be periodically logged or exposed via a health endpoint
**So that** I can monitor cache effectiveness and tune configuration based on real usage patterns

## Detailed Description

The `geocodeCache.ts` module has a `logCacheStats` function that logs cache hit rates, miss rates, and size metrics. However, this function is never called automatically on any schedule. Without periodic logging or endpoint exposure, there's no visibility into cache effectiveness in production.

Adding cache statistics monitoring would enable:
- Understanding cache hit rates to evaluate caching strategy
- Identifying potential memory issues from cache size growth
- Tuning TTL and max size settings based on real-world data
- Early detection of cache-related performance issues

## Acceptance Criteria

### Functional Requirements

- **Given** the cache is active - **When** a configurable time interval elapses - **Then** cache statistics are logged at INFO level
- **Given** a health/metrics endpoint exists - **When** accessed - **Then** cache statistics are included in the response
- **Given** cache stats logging is enabled - **When** the service starts - **Then** logging interval is configurable via environment variable

### Non-Functional Requirements

- **Performance**: Stats collection should not impact request latency
- **Observability**: Stats should be compatible with standard logging/metrics aggregators
- **Configuration**: Logging interval should be configurable (default: 5 minutes)

## User Experience Flow

1. Service starts and initializes cache
2. Cache handles geocoding requests (hits and misses recorded)
3. At configured interval, stats are logged (hit rate, miss rate, size)
4. Developer reviews logs or metrics dashboard
5. Developer adjusts cache configuration if needed

## Technical Context

- **Epic Integration**: Infrastructure observability and monitoring
- **System Components**: `packages/api/src/services/geocodeCache.ts`
- **Data Requirements**: Cache hit/miss counters, size metrics
- **Integration Points**: Logger infrastructure, potential health endpoint

## Definition of Done

- [x] Cache stats logged periodically at configurable interval
- [x] OR cache stats exposed via health/metrics endpoint
- [x] Logging interval configurable via environment variable
- [x] Stats include: hit rate, miss rate, cache size, eviction count
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

- The `logCacheStats` function already exists in `geocodeCache.ts` - this story is about calling it appropriately
- Consider integrating with existing health check infrastructure if available
- For production, consider exposing as Prometheus metrics if metrics infrastructure exists

---

**Source**: Created from bug-analysis-1.md review issue [status:story] for geocodeCache.ts monitoring
