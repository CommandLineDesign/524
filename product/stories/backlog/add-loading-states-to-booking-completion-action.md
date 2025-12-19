# Add Loading States to Booking Completion Action

**Role**: Artist
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Artist  
**I want** loading states displayed during booking completion  
**So that** I receive immediate feedback and the interface feels responsive

## Detailed Description

When artists mark bookings as completed in the mobile app, they currently see no visual feedback during the API call, which can make the interface feel unresponsive and cause uncertainty about whether the action was registered. Adding loading states such as a spinner or skeleton loader during the completion process will improve perceived performance and provide clear feedback that the system is processing the request.

## Acceptance Criteria

### Functional Requirements

- **Given** artist taps "Mark Complete" button - **When** API call is in progress - **Then** button shows loading spinner and becomes disabled
- **Given** booking completion API call succeeds - **When** response received - **Then** loading state is removed and success feedback is shown
- **Given** booking completion API call fails - **When** error response received - **Then** loading state is removed and error message is displayed

### Non-Functional Requirements

- **Performance**: Loading state appears within 100ms of button tap
- **Usability**: Loading state clearly indicates the action is in progress
- **Reliability**: Loading state is properly cleared on both success and error scenarios

## User Experience Flow

1. Artist navigates to booking detail screen and views an in-progress booking
2. Artist taps the "Mark Complete" button to finish the booking
3. System immediately shows loading spinner on button and disables it
4. System makes API call to complete the booking
5. System receives response and removes loading state
6. If successful, system shows brief success message and updates booking status
7. If failed, system shows error message and re-enables the button

## Technical Context

- **Epic Integration**: Part of the Review System epic's booking completion flow
- **System Components**: Mobile React Native app, booking completion API endpoint
- **Data Requirements**: No additional data needed, uses existing booking completion flow
- **Integration Points**: Integrates with existing booking completion API and state management

## Definition of Done

- [ ] Loading spinner appears immediately on button tap
- [ ] Button is disabled during API call to prevent double-submission
- [ ] Loading state is cleared on both success and error responses
- [ ] Success/error feedback is displayed appropriately
- [ ] Component handles network errors gracefully
- [ ] UI tests verify loading states work correctly
- [ ] Code follows existing mobile app patterns for loading states

## Notes

This is a UX enhancement that improves perceived performance during the critical booking completion action. The loading states should follow existing mobile app patterns for consistency.

