# Release Payment Holds on Booking Declines

**Role**: System  
**Priority**: High  
**Status**: ⏳ Not Started  
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** System  
**I want** to void or refund payment authorizations when bookings are declined or canceled  
**So that** customers are not left with pending holds after a rejected request

## Detailed Description

When artists decline or customers cancel pending bookings, the platform currently updates booking status and history but leaves the original payment authorization untouched. This can leave funds on hold and misalign paymentStatus with the booking lifecycle. The system should ensure payment holds are released (voided) or refunded promptly, and the resulting paymentStatus and timestamps are persisted alongside the booking status change for accurate financial state tracking.

## Acceptance Criteria

### Functional Requirements

- **Given** a pending booking is declined by the artist - **When** the decline is processed - **Then** the payment authorization is voided or refunded and paymentStatus is updated to match the outcome.
- **Given** a pending booking is canceled by the customer - **When** the cancellation is processed - **Then** the payment authorization is voided or refunded and paymentStatus is stored with corresponding timestamps.
- **Given** a payment void/refund fails - **When** the system receives an error - **Then** the booking status change is rolled back or flagged with an error response so no inconsistent state is persisted.

### Non-Functional Requirements

- **Performance**: Payment void/refund calls complete within service SLAs; retries use backoff on transient errors.
- **Usability**: Error responses clearly indicate payment release failures to client callers.
- **Security**: Payment operations use least-privilege credentials and avoid logging sensitive payment data.
- **Reliability**: Operations are idempotent; repeated requests do not double-void or double-refund.

## User Experience Flow

1. User triggers decline or cancel on a pending booking.
2. System calls PaymentService to void or refund the authorization.
3. System updates booking status, paymentStatus, and timestamps atomically.
4. System emits notifications reflecting both booking and payment outcomes.

## Technical Context

- **Epic Integration**: Fits into artist booking management and payment lifecycle handling.
- **System Components**: BookingService, PaymentService, booking repository, notifications.
- **Data Requirements**: Persist paymentStatus updates with timestamps tied to decline/cancel events.
- **Integration Points**: Payment gateway APIs, notification flows to customers and artists.

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] User experience flows tested with real users
- [ ] Integration with related stories validated
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

- Align paymentStatus transitions with booking status history to keep financial and booking states consistent.


