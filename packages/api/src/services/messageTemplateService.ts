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
    // Note: toLocaleDateString uses server's timezone for conversion.
    // For Korea-only deployment, this is acceptable since server runs in Asia/Seoul.
    // All stored timestamps are UTC; they'll be converted to server's local time for display.
    // TODO: For multi-timezone support, use a timezone library (e.g., date-fns-tz)
    // to format in the booking's timezone (booking.timezone).
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Seoul', // Explicit timezone for consistent formatting
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
