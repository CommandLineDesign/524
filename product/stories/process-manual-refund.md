# Process Manual Refund

**Epic**: [Admin Dashboard](../epics/admin-dashboard.md)
**Role**: Admin
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- [View All Bookings](./view-all-bookings.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Admin  
**I want** to manually trigger a refund for a booking  
**So that** I can resolve customer disputes and complaints

## Detailed Description

When customers have legitimate complaints about bookings (artist no-show, service not as described, etc.), admins need to process refunds. For the MVP/pilot phase, refunds are processed manually through the payment provider's dashboard, but this story tracks the refund in our system.

The admin should be able to specify full or partial refund amounts, require a reason for the refund, and the refund should be recorded in the booking history for audit purposes.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin is viewing a booking detail - **When** they click "Process Refund" - **Then** a refund form modal appears
- **Given** the refund modal is shown - **When** the admin enters an amount and reason - **Then** they can submit the refund
- **Given** a refund is submitted - **When** the action completes - **Then** the refund is recorded in booking history
- **Given** a refund was processed - **When** viewing the booking - **Then** the refund details are visible

### Non-Functional Requirements

- **Performance**: Refund recording completes within 1 second
- **Security**: Only authenticated admins can process refunds
- **Audit**: All refunds logged with admin ID, amount, reason, and timestamp
- **Validation**: Refund amount cannot exceed original payment amount

## User Experience Flow

1. Admin views a booking from a customer dispute
2. Admin clicks "Process Refund" button
3. System displays refund modal with original amount shown
4. Admin enters refund amount (defaults to full amount)
5. Admin selects reason from dropdown or enters custom reason
6. Admin clicks "Process Refund"
7. System records refund and displays confirmation
8. Admin manually processes refund in payment provider dashboard
9. Booking shows "Refunded" or "Partially Refunded" status

## Technical Context

- **Epic Integration**: Dispute resolution capability for booking oversight
- **System Components**: React-Admin custom action, API `POST /admin/bookings/:id/refund`
- **Data Requirements**: Write access to refunds table, update booking status
- **Integration Points**: Depends on View All Bookings for navigation to booking detail

## Definition of Done

- [ ] Refund button visible on booking detail page
- [ ] Refund modal shows original payment amount
- [ ] Refund amount field validates against original amount
- [ ] Reason field is required
- [ ] Refund recorded in database with all details
- [ ] Booking status updated appropriately
- [ ] Refund history visible in booking detail
- [ ] Confirmation message displayed after processing

## Notes

- For MVP, actual payment refund is done manually in Stripe/payment dashboard
- This story focuses on recording the refund in our system for tracking
- Future: Integrate with payment API for automated refunds
- Common refund reasons: Artist no-show, Service quality, Customer request, Error
