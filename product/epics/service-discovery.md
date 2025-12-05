# Service Discovery

**Category**: Widget Platform

**Priority**: High

**Status**: ⏳ Not Started

**Dependencies**:

- [Artist Onboarding](./artist-onboarding.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

This epic covers how customers find and select artists. For the Pilot MVP with ~50 artists, we will use a simplified search mechanism based on direct database queries. The goal is to match customers with the perfect artist for their specific occasion and location without the complexity of a dedicated search engine.

## Key Components

- **Home Screen**: Curated lists of artists (e.g., "Top Rated", "New").
- **Basic Filtering**: Filter by Category (Hair/Makeup) and Location (Region).
- **Map View**: Simple visualization of artist service areas.
- **Artist Detail View**: Comprehensive view of artist profile, portfolio, reviews, and services.

## Acceptance Criteria

- [ ] Customers can see a list of all available artists.
- [ ] Customers can filter artists by service type (Hair, Makeup).
- [ ] Customers can filter artists by region (e.g., Gangnam-gu, Mapo-gu).
- [ ] Search results load within 500ms.
- [ ] "Near Me" functionality uses basic PostGIS distance queries.

## Technical Requirements

- **Database**: PostgreSQL with PostGIS extension.
- **Querying**: Use standard SQL `ILIKE` for text search and `ST_DWithin` for location.
- **No Elasticsearch**: Full-text search engine is NOT required for MVP.

## User Stories (Examples)

- As a customer, I want to see all makeup artists in Gangnam.
- As a customer, I want to see photos of "Natural" makeup styles.

## Risks and Assumptions

- **Risk**: Performance may degrade if artist count grows significantly beyond 50 (unlikely for pilot).
- **Assumption**: Simple SQL queries are sufficient for the dataset size.

## Notes

- Search ranking can be random or alphabetical for now to give equal exposure.
