# PostGIS Geospatial Filtering

**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** to offload geospatial filtering to the database using PostGIS
**So that** artist location searches scale efficiently as the artist pool grows

## Detailed Description

The current implementation of `searchArtistsFiltered` in `searchService.ts` calculates distances using the Haversine formula in JavaScript for each artist after fetching them from the database. While this works for small datasets, it has several limitations:

1. All qualifying artists must be loaded into memory before filtering
2. CPU-intensive trigonometric calculations happen in Node.js rather than the optimized database engine
3. Cannot leverage database indexes for geospatial queries
4. Performance degrades linearly with artist count

PostGIS is a spatial database extension for PostgreSQL that provides:
- Native geospatial data types (geography, geometry)
- Spatial indexing (GiST indexes)
- Optimized functions like `ST_DWithin` for distance queries
- Server-side computation that scales better

## Acceptance Criteria

### Functional Requirements

- **Given** artists have location data stored - **When** searching for artists within a radius - **Then** the query uses PostGIS `ST_DWithin` for filtering
- **Given** the database has a spatial index on artist locations - **When** executing a geospatial query - **Then** the index is used (verified via EXPLAIN ANALYZE)
- **Given** the existing API contract - **When** migrating to PostGIS - **Then** the response format remains unchanged

### Non-Functional Requirements

- **Performance**: Geospatial queries should complete in < 100ms for 10,000 artists
- **Scalability**: Solution should scale to 100,000+ artists without significant degradation
- **Compatibility**: Must work with existing Drizzle ORM setup

## User Experience Flow

1. User selects location and search radius on home screen
2. Frontend calls `/api/v1/artists/search/filtered` endpoint
3. Backend executes PostGIS-optimized query filtering by distance
4. Results returned with same format as current implementation

## Technical Context

- **Epic Integration**: Part of the Home Screen Booking Flow performance optimization
- **System Components**: `searchService.ts`, PostgreSQL database, potentially new migration for spatial column
- **Data Requirements**: Convert `primaryLocation` JSONB to PostGIS geography type or add computed column
- **Integration Points**: `artistProfiles` table, Drizzle ORM configuration

## Definition of Done

- [ ] PostGIS extension enabled in PostgreSQL
- [ ] Migration adds geography column or spatial index
- [ ] `searchArtistsFiltered` uses `ST_DWithin` for filtering
- [ ] Spatial index created and verified
- [ ] Benchmark shows improvement over JS Haversine
- [ ] Existing tests pass
- [ ] Documentation updated

## Notes

- Consider using a bounding-box pre-filter as an intermediate step before full PostGIS migration
- May need to add `postgis` to database dependencies
- Drizzle ORM has limited native PostGIS support; may need raw SQL for spatial queries
- This story originated from code review feedback on the home booking flow PR
