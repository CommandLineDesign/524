# Activate Artist Account

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: High
**Status**: ✅ Completed
**Dependencies**:

- [Populate Artist Profile](./populate-artist-profile.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Admin  
**I want** to activate a pending artist account  
**So that** they can start accepting bookings from customers

## Detailed Description

Once an artist's profile has been populated and reviewed, the admin needs a simple way to activate the account. This changes the artist's status from "Pending" to "Active", making them visible in search results and able to receive booking requests.

The activation should require confirmation to prevent accidental activations and should provide clear feedback upon success.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is viewing a pending artist's profile - **When** they click "Activate" - **Then** a confirmation modal appears
- **Given** the confirmation modal is shown - **When** the admin confirms activation - **Then** the artist status changes to "Active"
- **Given** activation is successful - **When** the status change completes - **Then** a success notification is displayed
- **Given** the artist is now active - **When** viewing their profile - **Then** the "Activate" button is no longer shown

### Non-Functional Requirements

- **Performance**: Status change completes within 1 second
- **Usability**: Clear visual feedback for activation state
- **Security**: Only authenticated admins can activate artists
- **Reliability**: Activation is atomic and cannot leave artist in undefined state

## User Experience Flow

1. Admin views a pending artist's completed profile
2. Admin clicks the "Activate" button
3. System displays confirmation modal: "Activate [Artist Name]? They will be able to receive bookings."
4. Admin clicks "Confirm" in the modal
5. System updates artist status to "Active"
6. System displays success notification: "Artist activated successfully"
7. Profile view updates to show "Active" status badge

## Technical Context

- **Epic Integration**: Final step in the artist activation workflow
- **System Components**: React-Admin actions, API `PATCH /admin/artists/:id/activate`
- **Data Requirements**: Write access to update artist status field
- **Integration Points**: Completes workflow started by View Pending Artists and Populate Artist Profile

## Definition of Done

- [ ] Activate button visible only for pending artists
- [ ] Confirmation modal displays with artist name
- [ ] API call updates artist status correctly
- [ ] Success notification shown after activation
- [ ] Artist removed from pending queue after activation
- [ ] Cannot activate same artist twice
- [ ] Error handling for failed activation

## Notes

- Consider sending a notification to the artist when activated (future story)
- The activate endpoint should verify profile completeness before allowing activation
- For MVP, we skip automated profile completeness checks - admin judgment is sufficient
