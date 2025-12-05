# Booking System

**Category**: Backend Services

**Priority**: Critical

**Status**: ⏳ Not Started

**Dependencies**:

- [Service Discovery](./service-discovery.md)
- [Auth System](./auth-system.md)

**Estimated Effort**: Large (6+ sprints)

## Description

This epic covers the core transaction engine of the platform: the booking system. It manages the lifecycle of a service request from initiation to completion. It handles complex logic around scheduling, double-booking prevention, status transitions, and cancellation policies. It is the heart of the marketplace.

## Key Components

- **Booking Workflow**: Step-by-step flow to select services, time, and location.
- **Schedule Management**: Real-time availability checking to prevent conflicts.
- **Status Machine**: Finite state machine for booking statuses (Pending, Confirmed, In Progress, Completed, Cancelled).
- **Rescheduling**: Logic for modifying existing bookings.
- **Cancellation Policy**: Automated calculation of cancellation fees based on timing.

## Acceptance Criteria

- [ ] Customers can book a service for a specific date and time.
- [ ] System prevents double-booking for the same artist.
- [ ] Artists receive immediate notification of new booking requests.
- [ ] Artists can accept or decline "Pending" bookings.
- [ ] Bookings automatically transition to "Completed" after service time (with manual confirmation).
- [ ] Cancellations within X hours incur a penalty fee.

## Technical Requirements

- **Concurrency**: Use database transactions and row-level locking to prevent race conditions.
- **Timezones**: All times stored in UTC, displayed in Asia/Seoul.
- **Reliability**: Booking state changes must be idempotent.
- **Background Jobs**: Bull queues for handling timeout events (e.g., auto-cancel if not accepted).

## User Stories (Examples)

- As a customer, I want to book a hair appointment for next Friday at 2 PM.
- As an artist, I want to see my schedule for the week so I can plan my time.
- As a customer, I want to cancel my booking easily if my plans change.

## Risks and Assumptions

- **Risk**: Complex logic around "buffer times" and travel time between appointments.
- **Assumption**: Artists will keep their calendar availability up to date.

## Notes

- Consider "Instant Book" vs "Request to Book" models.
- Need to handle "No Show" scenarios.
