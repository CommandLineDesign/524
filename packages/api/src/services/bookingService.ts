import {
  BOOKING_STATUS_TRANSITIONS,
  isValidStatusTransition,
} from '@524/shared/booking-status-transitions';
import type {
  BookingSummary,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from '@524/shared/bookings';

import { BookingRepository } from '../repositories/bookingRepository.js';
import { createLogger } from '../utils/logger.js';
import { ConversationService } from './conversationService.js';
import { MessageService } from './messageService.js';
import { MessageTemplateService } from './messageTemplateService.js';
import { NotificationService } from './notificationService.js';
import { PaymentService } from './paymentService.js';

type Actor = { id: string; roles?: string[] };

const logger = createLogger('booking-service');

export class BookingService {
  constructor(
    private readonly repository = new BookingRepository(),
    private readonly notificationService = new NotificationService(),
    private readonly paymentService = new PaymentService(),
    private readonly messageService = new MessageService(),
    private readonly conversationService = new ConversationService(),
    private readonly messageTemplateService = new MessageTemplateService()
  ) {}

  async createBooking(payload: CreateBookingPayload): Promise<BookingSummary> {
    const booking = await this.repository.create(payload);
    // Payment is still authorized immediately on booking request creation.
    // This keeps parity with the existing flow until deferred payments are introduced.
    await this.paymentService.authorizePayment(booking);
    await this.notificationService.notifyBookingCreated(booking);

    // Send system message for new booking (fire-and-forget)
    this.sendBookingStatusSystemMessage(booking, 'pending');

    return booking;
  }

  getBookingById(bookingId: string): Promise<BookingSummary | null> {
    return this.repository.findById(bookingId);
  }

  listCustomerBookings(
    customerId: string,
    status?: BookingSummary['status'],
    options?: { limit?: number; offset?: number }
  ): Promise<BookingSummary[]> {
    return this.repository.findByCustomerId(customerId, status, options);
  }

  listArtistBookings(
    artistId: string,
    status?: BookingSummary['status'],
    options?: { limit?: number; offset?: number }
  ): Promise<BookingSummary[]> {
    return this.repository.findByArtistId(artistId, status, options);
  }

  async updateBookingStatus(
    bookingId: string,
    status: UpdateBookingStatusPayload['status']
  ): Promise<BookingSummary> {
    const booking = await this.repository.updateStatus(bookingId, status);
    await this.notificationService.notifyBookingStatusChanged(booking);
    return booking;
  }

  async updateBookingStatusValidated(
    bookingId: string,
    status: UpdateBookingStatusPayload['status'],
    actor: Actor
  ): Promise<BookingSummary> {
    const booking = await this.repository.findById(bookingId);
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }

    const normalizedStatus = status.trim() as BookingSummary['status'];
    if (!isValidStatusTransition(booking.status, normalizedStatus)) {
      throw Object.assign(new Error('Invalid status transition'), { status: 409 });
    }

    if (normalizedStatus === 'cancelled' && booking.status === 'pending') {
      const isCustomer = actor.id === booking.customerId;
      const isAdmin = actor.roles?.includes('admin');
      if (!isCustomer && !isAdmin) {
        throw Object.assign(new Error('Forbidden'), { status: 403 });
      }
      if (isCustomer) {
        return this.cancelPendingBooking(bookingId, actor.id);
      }
    }

    const updated = await this.repository.updateStatus(bookingId, normalizedStatus);
    await this.notificationService.notifyBookingStatusChanged(updated);

    // Send system message to conversation (fire-and-forget)
    this.sendBookingStatusSystemMessage(updated, normalizedStatus);

    return updated;
  }

  async acceptBooking(bookingId: string, artistId: string): Promise<BookingSummary> {
    const booking = await this.repository.acceptBooking(bookingId, artistId);
    await this.notificationService.notifyBookingStatusChanged(booking);
    return booking;
  }

  async declineBooking(
    bookingId: string,
    artistId: string,
    reason?: string
  ): Promise<BookingSummary> {
    const booking = await this.repository.declineBooking(bookingId, artistId, reason);
    await this.notificationService.notifyBookingStatusChanged(booking);

    // Send system message for decline (fire-and-forget)
    this.sendBookingStatusSystemMessage(booking, 'cancelled');

    return booking;
  }

  async cancelPendingBooking(bookingId: string, customerId: string): Promise<BookingSummary> {
    const booking = await this.repository.cancelPendingBooking(bookingId, customerId);
    await this.notificationService.notifyBookingStatusChanged(booking);

    // Send system message for cancellation (fire-and-forget)
    this.sendBookingStatusSystemMessage(booking, 'cancelled');

    return booking;
  }

  /**
   * Send a system message to the conversation when booking status changes (fire-and-forget with retry)
   */
  private sendBookingStatusSystemMessage(
    booking: BookingSummary,
    status: BookingSummary['status']
  ): void {
    // Fire-and-forget: don't await to avoid blocking booking operations
    // Uses retry mechanism for better reliability
    (async () => {
      const maxRetries = 3;
      const retryDelayMs = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Get or create conversation between customer and artist
          const conversation = await this.conversationService.getOrCreateConversation(
            booking.customerId,
            booking.artistId,
            booking.id
          );

          // Generate appropriate system message based on status
          const systemMessage = this.messageTemplateService.generateBookingStatusMessage(
            booking,
            status
          );

          if (systemMessage) {
            await this.messageService.sendSystemMessage(conversation.id, systemMessage, booking.id);
          }

          // Success - exit retry loop
          return;
        } catch (error) {
          const isLastAttempt = attempt === maxRetries;

          logger.error(
            {
              error,
              bookingId: booking.id,
              customerId: booking.customerId,
              artistId: booking.artistId,
              status,
              attempt,
              maxRetries,
              operation: 'sendBookingStatusSystemMessage',
            },
            isLastAttempt
              ? 'Failed to send booking status system message after all retries'
              : `Failed to send booking status system message (attempt ${attempt}/${maxRetries})`
          );

          // If not the last attempt, wait before retrying
          if (!isLastAttempt) {
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
          }
        }
      }
    })();
  }

  /**
   * Generate appropriate system message for booking status changes
   */
}
