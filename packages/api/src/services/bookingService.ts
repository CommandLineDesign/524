import type {
  BookingSummary,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from '@524/shared/bookings';

import { BookingRepository } from '../repositories/bookingRepository.js';
import { NotificationService } from './notificationService.js';
import { PaymentService } from './paymentService.js';

export class BookingService {
  constructor(
    private readonly repository = new BookingRepository(),
    private readonly notificationService = new NotificationService(),
    private readonly paymentService = new PaymentService()
  ) {}

  async createBooking(payload: CreateBookingPayload): Promise<BookingSummary> {
    const booking = await this.repository.create(payload);
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

  async updateBookingStatus(
    bookingId: string,
    status: UpdateBookingStatusPayload['status']
  ): Promise<BookingSummary> {
    const booking = await this.repository.updateStatus(bookingId, status);
    await this.notificationService.notifyBookingStatusChanged(booking);
    return booking;
  }
}
