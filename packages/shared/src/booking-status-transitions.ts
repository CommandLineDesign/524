import type { BookingSummary } from './bookings';

/**
 * Defines allowed booking status transitions for the booking state machine.
 * Each key represents a current status, and the value is an array of statuses
 * that the booking can transition to from that state.
 */
export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingSummary['status'],
  BookingSummary['status'][]
> = {
  pending: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['paid', 'cancelled', 'in_progress'],
  paid: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  declined: [],
  cancelled: [],
};

/**
 * Checks if a status transition is allowed from the current status.
 */
export function isValidStatusTransition(
  currentStatus: BookingSummary['status'],
  newStatus: BookingSummary['status']
): boolean {
  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus] ?? [];
  return allowedTransitions.includes(newStatus);
}
