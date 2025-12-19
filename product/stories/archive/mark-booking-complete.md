# Mark Booking Complete

**Epic**: [Review System](../epics/review-system.md)
**Role**: Artist
**Priority**: High
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Artist  
**I want** to mark a booking as completed  
**So that** the customer can leave a review and I can finalize the service

## Detailed Description

After an artist finishes providing a beauty service to a customer, they need to mark the booking as "Completed" in the system. This action is critical because it triggers the review submission flow, allowing customers to rate and review their experience. The completion action should only be available for bookings that are in appropriate states (e.g., "paid" or "in_progress") and should be easily accessible from the artist's booking management interface.

Marking a booking complete is the final step in the service delivery lifecycle and enables the reputation system to function by unlocking the customer's ability to provide feedback.

## Acceptance Criteria

### Functional Requirements

- **Given** an artist is viewing a booking in "paid" or "in_progress" status - **When** they click "Mark as Complete" - **Then** the booking status changes to "completed"
- **Given** a booking is marked as complete - **When** the status changes - **Then** the completion timestamp and artist ID are recorded
- **Given** a booking is completed - **When** the customer views the booking - **Then** they see the option to leave a review
- **Given** a booking is in "pending" or "cancelled" status - **When** the artist views it - **Then** the "Mark as Complete" button is not available
- **Given** a booking is already completed - **When** the artist views it - **Then** the completion status is displayed with timestamp

### Non-Functional Requirements

- **Performance**: Status update completes within 500ms
- **Usability**: Completion button is prominently displayed on booking detail screen
- **Security**: Only the assigned artist can mark their own bookings as complete
- **Reliability**: Status change is atomic and includes audit logging

## User Experience Flow

1. Artist finishes providing the beauty service to the customer
2. Artist opens the booking detail screen in their mobile app
3. System displays booking details with "Mark as Complete" button
4. Artist taps "Mark as Complete" button
5. System shows confirmation dialog: "Mark this booking as complete?"
6. Artist confirms the action
7. System updates booking status to "completed" and records timestamp
8. System displays success message: "Booking marked as complete"
9. System sends notification to customer inviting them to leave a review
10. Booking card now shows "Completed" badge with completion date

## Technical Context

- **Epic Integration**: Enables the review submission flow by transitioning bookings to completed state
- **System Components**: 
  - Mobile app: Booking detail screen with completion button
  - API: `POST /api/v1/bookings/:id/complete` endpoint
  - Database: Update bookings table status and completion timestamp
  - Notifications: Trigger review invitation notification to customer
- **Data Requirements**: 
  - Write access to bookings table
  - Record completion timestamp and artist ID
  - Update booking status to "completed"
- **Integration Points**: 
  - Triggers customer review submission flow
  - Updates booking status for display across all interfaces
  - Initiates notification to customer

## Definition of Done

- [x] "Mark as Complete" button visible on booking detail screen for eligible bookings
- [x] Button only appears for bookings in "paid" or "in_progress" status
- [x] Confirmation dialog displays before status change
- [x] Booking status updates to "completed" when confirmed
- [x] Completion timestamp and artist ID recorded in database
- [x] Notification sent to customer after completion
- [x] Completed bookings display completion badge with date
- [x] Artist cannot mark other artists' bookings as complete
- [x] API endpoint includes proper authorization and validation
- [x] Status change is logged for audit purposes

## Notes

- This is the first step in the review flow and must be implemented before review submission
- Consider adding optional completion notes field for artists in future iterations
- The 30-day review window starts from the completion timestamp
- Completion action should be irreversible to maintain data integrity
