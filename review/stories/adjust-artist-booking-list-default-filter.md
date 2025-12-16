# Adjust Artist Booking List Default Filter

**Role**: Artist  
**Priority**: Low  
**Status**: ⏳ Not Started  
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Artist  
**I want** the booking list to surface all relevant bookings by default or clearly highlight pending ones  
**So that** I do not miss important context or actionable items

## Detailed Description

The artist booking list currently defaults to showing only pending bookings, which can hide historical or completed items and reduce situational awareness. The experience should either default to all statuses or prominently indicate pending items needing attention while still allowing quick filtering.

## Acceptance Criteria

### Functional Requirements

- **Given** an artist opens the booking list - **When** the screen loads - **Then** all statuses are shown by default or a clear control indicates pending-only mode with an option to switch views.
- **Given** pending bookings exist - **When** the list renders - **Then** pending items are visually distinguished or called out as requiring attention.
- **Given** the artist changes filters - **When** a new status filter is selected - **Then** the list updates accordingly and persists selection for the session.

### Non-Functional Requirements

- **Performance**: List filtering does not noticeably slow initial load.
- **Usability**: Visual treatment for pending items is accessible and clear.
- **Security**: Filtering respects existing authZ and data access rules.
- **Reliability**: Filter state updates consistently across navigation events.

## User Experience Flow

1. Artist opens booking list screen.
2. System loads bookings with default filter and highlights pending items.
3. Artist optionally switches filters; system updates list accordingly.
4. Navigation away and back retains the chosen filter for the session.

## Technical Context

- **Epic Integration**: Enhances artist booking management usability.
- **System Components**: Mobile `ArtistBookingsListScreen`, filtering/query logic, UI indicators.
- **Data Requirements**: Ability to fetch multiple statuses concurrently or lazily.
- **Integration Points**: React Query cache and navigation state persistence.

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] User experience flows tested with real users
- [ ] Integration with related stories validated
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

- Consider a badge or banner for pending items if keeping an “all statuses” default.


