# Location Display Fallback String

**Role**: Shopper
**Priority**: Low
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: XS (1-2 hours)

## Story Statement

**As a** Shopper
**I want** to see a meaningful location label even when reverse geocoding fails
**So that** I know my location was captured and can proceed with booking

## Detailed Description

When a user's GPS coordinates are captured but the reverse geocoding service fails to return an address, the `location` string in the booking flow store may be empty while `locationCoordinates` contains valid data. This creates a UI inconsistency where the user sees an empty or placeholder location label despite having provided their location.

The system should derive a fallback display string (e.g., "현재 위치" or "GPS 위치") when the address is unavailable but coordinates exist. This ensures the user always sees confirmation that their location was captured.

## Acceptance Criteria

### Functional Requirements

- **Given** `locationCoordinates` is set with valid lat/lng - **When** `location` string is empty or null - **Then** the UI displays "현재 위치" as the fallback label
- **Given** both `location` and `locationCoordinates` are set - **When** rendering the location display - **Then** the actual address string is shown (no fallback needed)
- **Given** `locationCoordinates` is null/undefined - **When** rendering the location display - **Then** the standard "위치 선택" placeholder is shown

### Non-Functional Requirements

- **Usability**: Fallback text should be clearly distinguishable but not alarming to users
- **Consistency**: Fallback behavior should apply across all screens that display the selected location

## User Experience Flow

1. User opens app and allows location access
2. System captures GPS coordinates successfully
3. Reverse geocoding fails (network error, API limit, etc.)
4. User sees "현재 위치" instead of blank or "위치 선택"
5. User can still tap to change location or proceed with booking

## Technical Context

- **Epic Integration**: Part of the Home Screen Booking Flow feature
- **System Components**: `bookingFlowStore.ts`, `HomeScreen.tsx`, any component displaying location
- **Data Requirements**: `location: string`, `locationCoordinates: { lat: number; lng: number }`
- **Integration Points**: `initializeFromHome` action, location selector components

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] Integration with related stories validated
- [ ] Code reviewed and approved

## Notes

- The fix should be applied in `initializeFromHome` to set a default location string if one is not provided
- Also consider adding this fallback logic in `HomeScreen.tsx` where the location state is managed
- This story originated from code review feedback on the home booking flow PR
