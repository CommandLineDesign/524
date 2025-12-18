import type { BookingSummary } from '@524/shared';
import { addDays, isAfter } from 'date-fns';
import type { AuthUser } from '../api/client';

const REVIEW_WINDOW_DAYS = 30;

/**
 * Determines if a customer can leave a review for a booking
 * @param booking The booking to check
 * @param user The authenticated user
 * @returns true if the user can leave a review for this booking
 */
export function canLeaveReview(booking: BookingSummary, user: AuthUser | null): boolean {
  // Must be a customer
  const isCustomer = user?.roles?.includes('customer');
  if (!isCustomer) {
    return false;
  }

  // Booking must be completed
  const isBookingCompleted = booking.status === 'completed';
  if (!isBookingCompleted) {
    return false;
  }

  // Require completedAt - don't allow reviews based on scheduled end time
  const completionDate = booking.completedAt;
  if (!completionDate) {
    return false;
  }

  // Must be within the review window (30 days from completion)
  // Match backend logic: check if current time is NOT after 30 days from completion
  const thirtyDaysAfterCompletion = addDays(new Date(completionDate), REVIEW_WINDOW_DAYS);
  const isWithinReviewWindow = !isAfter(new Date(), thirtyDaysAfterCompletion);
  return isWithinReviewWindow;
}
