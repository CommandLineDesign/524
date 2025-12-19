# Implement Caching for Artist Review Statistics

**Epic**: [Review System](../epics/review-system.md)
**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer  
**I want** to implement caching for artist review statistics  
**So that** repeated requests for the same artist's statistics are served faster without recalculating aggregates

## Detailed Description

Currently, the artist review statistics (average ratings for overall, quality, professionalism, and timeliness) are calculated in-memory using JavaScript's reduce function on every API request. This approach loads all visible reviews for an artist into memory and performs manual sum calculations, which is inefficient for artists with many reviews. A caching layer with a short TTL keyed by artist ID would prevent unnecessary recalculations while maintaining data freshness.

## Acceptance Criteria

### Functional Requirements

- **Given** artist statistics are requested - **When** cache is empty - **Then** statistics are calculated from database and stored in cache with TTL
- **Given** artist statistics are requested - **When** cache contains valid data - **Then** cached statistics are returned without database calculation
- **Given** review is submitted or deleted - **When** artist statistics change - **Then** relevant cache entries are invalidated
- **Given** cached statistics are stale - **When** TTL expires - **Then** statistics are recalculated on next request

### Non-Functional Requirements

- **Performance**: Cache hit response time <50ms (vs ~200ms for database calculation)
- **Freshness**: Cache TTL of 5-10 minutes to balance performance with data accuracy
- **Memory**: Cache size limited to prevent excessive memory usage
- **Reliability**: Cache failures fall back to direct database calculation

## User Experience Flow

1. Artist views their reviews dashboard
2. System checks cache for artist's statistics
3. If cache hit: Return cached statistics immediately
4. If cache miss: Calculate from database, store in cache, return results
5. When artist receives new review: Invalidate cache for that artist
6. Next dashboard view recalculates and caches fresh statistics

## Technical Context

- **Epic Integration**: Performance optimization for the "View Artist Reviews" story within the Review System epic
- **System Components**: API layer caching, database aggregation queries
- **Data Requirements**: Artist review statistics (averages, counts) with cache invalidation on changes
- **Integration Points**: Review submission/deletion endpoints must trigger cache invalidation

## Definition of Done

- [ ] Cache implementation added to artist statistics endpoint
- [ ] Cache invalidation integrated with review create/delete operations
- [ ] Performance benchmarks show significant improvement for cache hits
- [ ] Cache miss fallback maintains existing functionality
- [ ] Unit tests cover cache hit/miss scenarios and invalidation
- [ ] Documentation updated with caching behavior and TTL settings

## Notes

Cache implementation should use Redis or similar in-memory store for production, with in-memory fallback for development. Cache keys should follow pattern `artist:stats:{artistId}`. Consider implementing cache warming for frequently accessed artists.