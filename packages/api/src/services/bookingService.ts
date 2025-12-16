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
import { NotificationService } from './notificationService.js';
import { PaymentService } from './paymentService.js';

type Actor = { id: string; roles?: string[] };

export class BookingService {
  constructor(
    private readonly repository = new BookingRepository(),
    private readonly notificationService = new NotificationService(),
    private readonly paymentService = new PaymentService()
  ) {}

  async createBooking(payload: CreateBookingPayload): Promise<BookingSummary> {
    const booking = await this.repository.create(payload);
    // Payment is still authorized immediately on booking request creation.
    // This keeps parity with the existing flow until deferred payments are introduced.
    await this.paymentService.authorizePayment(booking);
    await this.notificationService.notifyBookingCreated(booking);
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
    return booking;
  }

  async cancelPendingBooking(bookingId: string, customerId: string): Promise<BookingSummary> {
    const booking = await this.repository.cancelPendingBooking(bookingId, customerId);
    await this.notificationService.notifyBookingStatusChanged(booking);
    return booking;
  }
}
