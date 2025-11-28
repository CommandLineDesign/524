import crypto from 'crypto';

import { eq } from 'drizzle-orm';

import { bookings } from '@524/database';
import type { BookingSummary, CreateBookingPayload, UpdateBookingStatusPayload } from '@524/shared/bookings';

import { db } from '../db/client';

type BookingRow = typeof bookings.$inferSelect;

function mapRowToSummary(row: BookingRow): BookingSummary {
  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    customerId: row.customerId,
    artistId: row.artistId,
    occasion: row.occasion,
    services: (row.services as BookingSummary['services']) ?? [],
    scheduledDate: row.scheduledDate.toISOString(),
    scheduledStartTime: row.scheduledStartTime.toISOString(),
    scheduledEndTime: row.scheduledEndTime.toISOString(),
    totalAmount: Number(row.totalAmount),
    status: row.status as BookingSummary['status']
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
        totalDurationMinutes: payload.services.reduce((sum, item) => sum + item.durationMinutes, 0),
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
          total: totalAmount
        }
      })
      .returning();

    return mapRowToSummary(record);
  }

  async findById(bookingId: string): Promise<BookingSummary | null> {
    const [record] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    return record ? mapRowToSummary(record) : null;
  }

  async updateStatus(bookingId: string, status: UpdateBookingStatusPayload['status']): Promise<BookingSummary> {
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
      (historyResult[0]?.statusHistory as Array<{ status: string; timestamp: string }> | null) ?? [];
    const updatedHistory = [...normalizedHistory, { status, timestamp: new Date().toISOString() }];

    const [record] = await db
      .update(bookings)
      .set({
        status,
        statusHistory: updatedHistory
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return mapRowToSummary(record);
  }

  private generateBookingNumber() {
    const datePart = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 12);
    return `BK-${datePart}`;
  }
}

