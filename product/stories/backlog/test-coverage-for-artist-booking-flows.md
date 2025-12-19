# Test Coverage for Artist Booking Flows

**Role**: Developer  
**Priority**: Medium  
**Status**: 📋 Backlog  
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer  
**I want** automated tests for artist booking endpoints and mobile screens  
**So that** regressions in artist booking workflows are caught before release

## Detailed Description

New artist booking list/detail/accept/decline/cancel endpoints and corresponding mobile screens were added without automated coverage. We need API tests to validate authorization, allowed state transitions, and payment side-effects, plus React Native tests to cover list and detail flows, ensuring correct rendering, status changes, and error handling.

## Acceptance Criteria

### Functional Requirements

- **Given** an artist user - **When** invoking accept/decline/cancel endpoints - **Then** tests verify authZ, allowed transitions, and expected payloads including payment side-effects.
- **Given** an unauthenticated or unauthorized user - **When** calling artist booking endpoints - **Then** tests assert 401/403 responses and no side-effects occur.
- **Given** the mobile artist list/detail screens - **When** data loads, errors, and actions occur - **Then** tests assert correct rendering, status badges, and action outcomes.

### Non-Functional Requirements

- **Performance**: Test suites run within acceptable CI time budget.
- **Usability**: Test failures surface actionable messages for debugging.
- **Security**: Tests avoid real payment actions; use mocks/fakes for gateways.
- **Reliability**: Tests are deterministic and independent.

## User Experience Flow

1. API tests set up bookings with varied states and roles.
2. Tests call artist endpoints for accept/decline/cancel and assert responses and side-effects.
3. Mobile tests render list/detail screens, simulate user actions, and verify UI updates.
4. CI reports clear pass/fail status with artifacts as needed.

## Technical Context

- **Epic Integration**: Supports artist booking management feature stability.
- **System Components**: API controllers/services, mobile screens/components, React Query hooks.
- **Data Requirements**: Seeded or factory bookings across statuses and roles.
- **Integration Points**: Payment side-effects mocked; notification side-effects validated where applicable.

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] User experience flows tested with real users
- [ ] Integration with related stories validated
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

- Prioritize authZ transition tests and UI status rendering to prevent regressions in artist flows.


