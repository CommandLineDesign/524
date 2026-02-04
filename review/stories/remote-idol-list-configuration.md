# Remote Idol List Configuration

**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** to configure the idol list via remote config or API endpoint
**So that** content updates can be made without requiring app releases

## Detailed Description

The current onboarding flow uses a hardcoded list of ~80 Korean celebrity/idol names in `packages/mobile/src/constants/idols.ts`. While this works for the initial implementation, any additions, removals, or corrections to the list require a code change and app release cycle.

This creates operational friction when:
- New celebrities need to be added based on user feedback
- Names need corrections (e.g., romanization, group affiliations)
- Seasonal or trending celebrities should be prioritized
- Regional variations are needed for different markets

Moving to a remote configuration would enable content teams to manage this list independently of the development release cycle.

## Acceptance Criteria

### Functional Requirements

- **Given** the app starts - **When** the idol list is requested - **Then** it fetches from a remote endpoint with local fallback
- **Given** network is unavailable - **When** the idol list is requested - **Then** the cached/bundled list is used seamlessly
- **Given** the remote list is updated - **When** a user reopens the app - **Then** they see the updated list within a reasonable cache window

### Non-Functional Requirements

- **Performance**: Idol list should load within 200ms (including cache hits)
- **Reliability**: App must function with stale/cached data if remote is unavailable
- **Caching**: Implement appropriate cache TTL (e.g., 24 hours) to balance freshness vs. network calls

## User Experience Flow

1. User opens the app and navigates to onboarding
2. System loads idol list from cache or fetches from remote (transparent to user)
3. User sees the typeahead populated with current idol list
4. System caches the response for future sessions

## Technical Context

- **Epic Integration**: Part of the customer onboarding experience improvements
- **System Components**: Mobile app constants, remote config service or API endpoint
- **Data Requirements**: JSON list of idol names with optional metadata (group, popularity rank)
- **Integration Points**: Could integrate with existing remote config system if available, or require new API endpoint

## Definition of Done

- [ ] Remote config endpoint or API created and deployed
- [ ] Mobile app fetches idol list with fallback to bundled data
- [ ] Caching strategy implemented with appropriate TTL
- [ ] Offline functionality verified
- [ ] Performance benchmarks met (<200ms load time)
- [ ] Documentation updated for content management workflow
- [ ] Code reviewed and approved

## Notes

- Consider using Firebase Remote Config, LaunchDarkly, or a custom API endpoint
- The bundled fallback list should be kept as a safety net
- May want to include additional metadata per idol (e.g., group name, search aliases) in future iterations
- Consider analytics to track which idols are most frequently selected to inform list curation

---

**Source**: Code Review Issue from [code-review-1.md](../reviews/code-review-1.md)
