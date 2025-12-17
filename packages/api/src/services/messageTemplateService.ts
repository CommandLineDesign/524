import type { BookingSummary } from '@524/shared/bookings';
import { BOOKING_SYSTEM_MESSAGES, type BookingStatus, defaultLocale } from '@524/shared/constants';

export class MessageTemplateService {
  /**
   * Generate a localized system message for booking status changes
   */
  generateBookingStatusMessage(booking: BookingSummary, status: BookingStatus): string | null {
    const bookingNumber = booking.bookingNumber;
    const locale = defaultLocale; // Could be made configurable per user in future

    // Format date according to locale
    const dateOptions = {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      weekday: 'long' as const,
    };
    const scheduledDate = new Date(booking.scheduledDate).toLocaleDateString(
      locale === 'ko' ? 'ko-KR' : 'en-US',
      dateOptions
    );

    // Get the message template for the status
    let messageTemplate: string | undefined;
    if (locale === 'ko') {
      messageTemplate = BOOKING_SYSTEM_MESSAGES.ko[status];
    } else {
      messageTemplate = BOOKING_SYSTEM_MESSAGES.en[status];
    }
    if (!messageTemplate) {
      return null;
    }

    // Replace placeholders in the message
    return messageTemplate
      .replace('{bookingNumber}', bookingNumber)
      .replace('{scheduledDate}', scheduledDate);
  }
}
