import crypto from 'node:crypto';

import { and, desc, eq } from 'drizzle-orm';

import { bookings, reviews, users } from '@524/database';
import type {
  BookedService,
  BookingSummary,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from '@524/shared/bookings';

import { db } from '../db/client.js';
import { buildStatusHistory } from './statusHistory.js';

type BookingRow = typeof bookings.$inferSelect & {
  artistName?: string | null;
  completedAt?: Date | null;
  completedBy?: string | null;
  review?: {
    id: string;
    overallRating: number;
    qualityRating: number;
    professionalismRating: number;
    timelinessRating: number;
    reviewText: string | null;
    reviewImages: unknown;
    createdAt: Date;
  } | null;
};

function mapRowToSummary(row: BookingRow): BookingSummary {
  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    customerId: row.customerId,
    artistId: row.artistId,
    artistName: row.artistName ?? undefined,
    occasion: row.occasion,
    services: (row.services as BookingSummary['services']) ?? [],
    scheduledDate: row.scheduledDate.toISOString(),
    scheduledStartTime: row.scheduledStartTime.toISOString(),
    scheduledEndTime: row.scheduledEndTime.toISOString(),
    totalAmount: Number(row.totalAmount),
    status: row.status as BookingSummary['status'],
    timezone: row.timezone ?? undefined,
    location: (row.address as BookingSummary['location']) ?? undefined,
    createdAt: row.createdAt?.toISOString(),
    paymentStatus: row.paymentStatus as BookingSummary['paymentStatus'],
    statusHistory: row.statusHistory as BookingSummary['statusHistory'],
    completedAt: row.completedAt?.toISOString() ?? undefined,
    completedBy: row.completedBy ?? undefined,
    review: row.review
      ? {
          id: row.review.id,
          overallRating: row.review.overallRating,
          qualityRating: row.review.qualityRating,
          professionalismRating: row.review.professionalismRating,
          timelinessRating: row.review.timelinessRating,
          reviewText: row.review.reviewText ?? undefined,
          reviewImages: row.review.reviewImages as string[] | undefined,
          createdAt: row.review.createdAt.toISOString(),
        }
      : undefined,
  };
}

function roundTo(value: number, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export class BookingRepository {
  async create(payload: CreateBookingPayload): Promise<BookingSummary> {
    const bookingNumber = this.generateBookingNumber();
    const scheduleStart = new Date(payload.scheduledStartTime ?? payload.scheduledDate);
    const scheduleEnd = new Date(payload.scheduledEndTime ?? scheduleStart);
    const subtotal = payload.totalAmount;
    const platformFee = roundTo(subtotal * 0.15);
    const tax = roundTo((subtotal + platformFee) * 0.1);
    const totalAmount = subtotal + platformFee + tax;
    const historyEntry = { status: 'pending', timestamp: new Date().toISOString() };

    const [record] = await db
      .insert(bookings)
      .values({
        id: crypto.randomUUID(),
        bookingNumber,
        customerId: payload.customerId,
        artistId: payload.artistId,
        serviceType: payload.serviceType,
        occasion: payload.occasion,
        services: payload.services,
        totalDurationMinutes: payload.services.reduce(
          (sum: number, item: BookedService) => sum + item.durationMinutes,
          0
        ),
        scheduledDate: new Date(payload.scheduledDate),
        scheduledStartTime: scheduleStart,
        scheduledEndTime: scheduleEnd,
        timezone: 'Asia/Seoul',
        serviceLocation: payload.location,
        locationType: 'customer_location',
        address: payload.location,
        specialRequests: payload.notes ?? null,
        status: 'pending',
        statusHistory: [historyEntry],
        paymentStatus: 'pending',
        totalAmount: totalAmount.toFixed(2),
        breakdown: {
          subtotal,
          platformFee,
          tax,
          total: totalAmount,
        },
      })
      .returning();

    return mapRowToSummary(record);
  }

  async findById(bookingId: string): Promise<BookingSummary | null> {
    const [record] = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        customerId: bookings.customerId,
        artistId: bookings.artistId,
        artistName: users.name,
        occasion: bookings.occasion,
        services: bookings.services,
        scheduledDate: bookings.scheduledDate,
        scheduledStartTime: bookings.scheduledStartTime,
        scheduledEndTime: bookings.scheduledEndTime,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        timezone: bookings.timezone,
        paymentStatus: bookings.paymentStatus,
        statusHistory: bookings.statusHistory,
        address: bookings.address,
        createdAt: bookings.createdAt,
        completedAt: bookings.completedAt,
        completedBy: bookings.completedBy,
        review: {
          id: reviews.id,
          overallRating: reviews.overallRating,
          qualityRating: reviews.qualityRating,
          professionalismRating: reviews.professionalismRating,
          timelinessRating: reviews.timelinessRating,
          reviewText: reviews.reviewText,
          reviewImages: reviews.reviewImages,
          createdAt: reviews.createdAt,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.artistId))
      .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);
    return record ? mapRowToSummary(record as BookingRow) : null;
  }

  async findByArtistId(
    artistId: string,
    status?: BookingSummary['status'],
    options?: { limit?: number; offset?: number }
  ): Promise<BookingSummary[]> {
    const filters = [eq(bookings.artistId, artistId)];
    if (status) {
      filters.push(eq(bookings.status, status));
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters);
    const MAX_LIMIT = 50;
    const DEFAULT_LIMIT = 20;
    const requestedLimit = options?.limit ?? DEFAULT_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
    const offset = Math.max(options?.offset ?? 0, 0);

    const rows = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        customerId: bookings.customerId,
        artistId: bookings.artistId,
        artistName: users.name,
        occasion: bookings.occasion,
        services: bookings.services,
        scheduledDate: bookings.scheduledDate,
        scheduledStartTime: bookings.scheduledStartTime,
        scheduledEndTime: bookings.scheduledEndTime,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        timezone: bookings.timezone,
        paymentStatus: bookings.paymentStatus,
        statusHistory: bookings.statusHistory,
        address: bookings.address,
        createdAt: bookings.createdAt,
        completedAt: bookings.completedAt,
        completedBy: bookings.completedBy,
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.artistId))
      .where(whereClause)
      .orderBy(desc(bookings.scheduledDate), desc(bookings.scheduledStartTime))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => mapRowToSummary(row as BookingRow));
  }

  async updateStatus(
    bookingId: string,
    status: UpdateBookingStatusPayload['status']
  ): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }

    return this.setStatusWithHistory(bookingId, status);
  }

  async findByCustomerId(
    customerId: string,
    status?: BookingSummary['status'],
    options?: { limit?: number; offset?: number }
  ): Promise<BookingSummary[]> {
    const filters = [eq(bookings.customerId, customerId)];
    if (status) {
      filters.push(eq(bookings.status, status));
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters);
    const MAX_LIMIT = 50;
    const DEFAULT_LIMIT = 20;
    const requestedLimit = options?.limit ?? DEFAULT_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
    const offset = Math.max(options?.offset ?? 0, 0);

    const rows = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        customerId: bookings.customerId,
        artistId: bookings.artistId,
        artistName: users.name,
        occasion: bookings.occasion,
        services: bookings.services,
        scheduledDate: bookings.scheduledDate,
        scheduledStartTime: bookings.scheduledStartTime,
        scheduledEndTime: bookings.scheduledEndTime,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        timezone: bookings.timezone,
        paymentStatus: bookings.paymentStatus,
        statusHistory: bookings.statusHistory,
        address: bookings.address,
        createdAt: bookings.createdAt,
        completedAt: bookings.completedAt,
        completedBy: bookings.completedBy,
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.artistId))
      .where(whereClause)
      .orderBy(desc(bookings.scheduledDate), desc(bookings.scheduledStartTime))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => mapRowToSummary(row as BookingRow));
  }

  async acceptBooking(bookingId: string, artistId: string): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }
    if (existing.artistId !== artistId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (existing.status !== 'pending') {
      throw Object.assign(new Error('Only pending bookings can be accepted'), { status: 409 });
    }

    const [record] = await db
      .update(bookings)
      .set({
        status: 'confirmed',
        statusHistory: buildStatusHistory(
          existing.statusHistory as Array<{ status: string; timestamp: string }> | null,
          'confirmed'
        ),
        confirmedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  async declineBooking(
    bookingId: string,
    artistId: string,
    reason = 'artist_declined'
  ): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }
    if (existing.artistId !== artistId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (existing.status !== 'pending') {
      throw Object.assign(new Error('Only pending bookings can be declined'), { status: 409 });
    }

    const [record] = await db
      .update(bookings)
      .set({
        status: 'declined',
        cancelledBy: 'artist',
        cancellationReason: reason,
        cancelledAt: new Date(),
        statusHistory: buildStatusHistory(
          existing.statusHistory as Array<{ status: string; timestamp: string }> | null,
          'declined'
        ),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  async cancelPendingBooking(bookingId: string, customerId: string): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }
    if (existing.customerId !== customerId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (existing.status !== 'pending') {
      throw Object.assign(new Error('Only pending bookings can be cancelled by the customer'), {
        status: 409,
      });
    }

    const [record] = await db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledBy: 'customer',
        cancellationReason: 'customer_cancelled_pending',
        cancelledAt: new Date(),
        statusHistory: buildStatusHistory(
          existing.statusHistory as Array<{ status: string; timestamp: string }> | null,
          'cancelled'
        ),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  async completeBooking(bookingId: string, artistId: string): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }
    if (existing.artistId !== artistId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (existing.status !== 'in_progress' || existing.paymentStatus !== 'paid') {
      throw Object.assign(new Error('Only paid bookings in progress can be completed'), {
        status: 409,
      });
    }

    const [record] = await db
      .update(bookings)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completedBy: artistId,
        statusHistory: buildStatusHistory(
          existing.statusHistory as Array<{ status: string; timestamp: string }> | null,
          'completed'
        ),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  private async setStatusWithHistory(
    bookingId: string,
    status: UpdateBookingStatusPayload['status']
  ): Promise<BookingSummary> {
    const historyResult = await db
      .select({ statusHistory: bookings.statusHistory })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    const updatedHistory = buildStatusHistory(
      historyResult[0]?.statusHistory as Array<{ status: string; timestamp: string }> | null,
      status
    );

    const [record] = await db
      .update(bookings)
      .set({
        status,
        statusHistory: updatedHistory,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  private generateBookingNumber() {
    const datePart = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 12);
    return `BK-${datePart}`;
  }
}
