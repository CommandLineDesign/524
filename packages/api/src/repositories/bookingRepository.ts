import crypto from 'node:crypto';

import { and, desc, eq } from 'drizzle-orm';

import { bookings, users } from '@524/database';
import type {
  BookedService,
  BookingSummary,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from '@524/shared/bookings';

import { db } from '../db/client.js';

type BookingRow = typeof bookings.$inferSelect & {
  artistName?: string | null;
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
        serviceLocation: payload.location,
        locationType: 'customer_location',
        address: payload.location,
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
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.artistId))
      .where(eq(bookings.id, bookingId))
      .limit(1);
    return record ? mapRowToSummary(record as BookingRow) : null;
  }

  async updateStatus(
    bookingId: string,
    status: UpdateBookingStatusPayload['status']
  ): Promise<BookingSummary> {
    const existing = await this.findById(bookingId);
    if (!existing) {
      throw Object.assign(new Error('Booking not found'), { status: 404 });
    }

    const historyResult = await db
      .select({ statusHistory: bookings.statusHistory })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    const normalizedHistory =
      (historyResult[0]?.statusHistory as Array<{ status: string; timestamp: string }> | null) ??
      [];
    const updatedHistory = [...normalizedHistory, { status, timestamp: new Date().toISOString() }];

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
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.artistId))
      .where(whereClause)
      .orderBy(desc(bookings.scheduledDate), desc(bookings.scheduledStartTime))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => mapRowToSummary(row as BookingRow));
  }

  private generateBookingNumber() {
    const datePart = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 12);
    return `BK-${datePart}`;
  }
}
