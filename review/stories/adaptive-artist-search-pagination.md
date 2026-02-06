# Adaptive Artist Search Pagination

**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** to implement adaptive limits or cursor-based pagination for artist search
**So that** the search service handles varying artist density efficiently without arbitrary limits

## Detailed Description

The current artist search implementation in `searchService.ts` uses a hardcoded `.limit(100)` for the initial database fetch. This approach has two issues:

1. **Insufficient in dense areas**: Areas with many artists (e.g., major cities) may have more than 100 artists within the search radius, causing valid results to be excluded
2. **Wasteful in sparse areas**: Areas with few artists fetch unnecessary data and perform unneeded filtering

The search service should adapt to the actual artist density in the requested area, either through:
- Cursor-based pagination that allows the client to request more results
- Adaptive limits based on the search radius or historical density data
- A combination of both approaches

## Acceptance Criteria

### Functional Requirements

- **Given** a search area with >100 artists - **When** search is performed - **Then** all matching artists within the radius are returned (via pagination or adaptive limits)
- **Given** a search area with <20 artists - **When** search is performed - **Then** only the necessary data is fetched from the database
- **Given** pagination is implemented - **When** client requests next page - **Then** results are consistent and don't duplicate or skip artists

### Non-Functional Requirements

- **Performance**: Response time should not regress for typical searches (95th percentile)
- **Usability**: API should remain simple for clients that don't need pagination
- **Scalability**: Solution should handle growth in artist count without code changes

## User Experience Flow

1. Client requests artist search with location, radius, and filters
2. System determines appropriate fetch strategy based on request parameters
3. System returns results with pagination metadata (if applicable)
4. Client can request additional pages if more results are available
5. System maintains cursor state for consistent pagination

## Technical Context

- **Epic Integration**: Part of the home booking flow feature set
- **System Components**: `searchService.ts`, artist search API endpoint, mobile client
- **Data Requirements**: May require caching of cursor state or density metadata
- **Integration Points**: `artistController.ts` endpoint, mobile `useHomeArtistSearch` hook

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] API documentation updated with pagination parameters
- [ ] Mobile client updated to handle pagination (if breaking change)
- [ ] Load testing completed for dense-area scenarios
- [ ] Code reviewed and approved

## Notes

This enhancement was identified during code review of the home booking flow. The current hardcoded limit is functional but not optimal for production scale. Consider implementing this before launching in high-density metropolitan areas.

**Source**: Code review `bug-analysis-1.md` - Enhancement issue at `packages/api/src/services/searchService.ts:98`
