// @ts-nocheck - Test utilities file, types are not critical
import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import type { BookingStatus } from '@524/shared';
import type { BookedService, BookingSummary, CreateBookingPayload } from '@524/shared/bookings';

// Local type definition for test purposes
interface BookingStatusHistoryEntry {
  status: BookingStatus | string;
  timestamp: string;
}

import { bookings } from '@524/database';
import { env } from '../config/env.js';
import { db } from '../db/client.js';

// Test user IDs from seed data
export const TEST_USERS = {
  customer1: '11111111-1111-1111-1111-111111111111',
  artist1: '22222222-2222-2222-2222-222222222222',
  customer2: '0eddd84a-a6ee-457b-820d-fcb92df01364',
  artist2: '8300b21f-5604-4425-9587-52988df72584',
  admin: '2c51dea4-49f1-4abe-8838-7f469a01fc1e',
} as const;

export const TEST_USER_ROLES = {
  [TEST_USERS.customer1]: 'customer',
  [TEST_USERS.artist1]: 'artist',
  [TEST_USERS.customer2]: 'customer',
  [TEST_USERS.artist2]: 'artist',
  [TEST_USERS.admin]: 'admin',
} as const;

/**
 * Generate mock JWT token for testing
 */
export function generateTestToken(userId: string): string {
  const role = TEST_USER_ROLES[userId as keyof typeof TEST_USER_ROLES];
  if (!role) {
    throw new Error(`Unknown test user: ${userId}`);
  }

  return jwt.sign(
    {
      user_id: userId,
      role,
      phone_number: '010-0000-0000',
      mock: true,
    },
    env.JWT_SECRET || 'dev-secret',
    { expiresIn: '24h' }
  );
}

/**
 * Create test booking data
 */
export function createTestBooking(
  overrides: Partial<CreateBookingPayload> = {}
): CreateBookingPayload {
  const defaultServices: BookedService[] = [
    {
      id: 'service-1',
      name: '메이크업',
      durationMinutes: 60,
      price: 100000,
    },
  ];

  return {
    customerId: TEST_USERS.customer1,
    artistId: TEST_USERS.artist1,
    serviceType: 'makeup',
    occasion: '생일 파티',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    scheduledStartTime: new Date(
      Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
    ).toISOString(), // Tomorrow 10 AM
    scheduledEndTime: new Date(
      Date.now() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000
    ).toISOString(), // Tomorrow 11 AM
    totalAmount: 100000,
    services: defaultServices,
    location: {
      latitude: 37.5665,
      longitude: 126.978,
      addressLine: '서울시 중구 명동',
    },
    ...overrides,
  };
}

/**
 * Insert test booking into database and return booking summary
 */
export async function createTestBookingInDB(
  overrides: Partial<CreateBookingPayload> = {}
): Promise<BookingSummary> {
  const bookingData = createTestBooking(overrides);
  const bookingNumber = `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const scheduleStart = new Date(bookingData.scheduledStartTime);
  const scheduleEnd = new Date(bookingData.scheduledEndTime);
  const subtotal = bookingData.totalAmount;
  const platformFee = Math.round(subtotal * 0.15);
  const tax = Math.round((subtotal + platformFee) * 0.1);
  const totalAmount = subtotal + platformFee + tax;
  const historyEntry = { status: 'pending', timestamp: new Date().toISOString() };

  const [record] = await db
    .insert(bookings)
    .values({
      id: crypto.randomUUID(),
      bookingNumber,
      customerId: bookingData.customerId,
      artistId: bookingData.artistId,
      serviceType: bookingData.serviceType,
      occasion: bookingData.occasion,
      services: bookingData.services,
      totalDurationMinutes: bookingData.services.reduce(
        (sum, item) => sum + item.durationMinutes,
        0
      ),
      scheduledDate: new Date(bookingData.scheduledDate),
      scheduledStartTime: scheduleStart,
      scheduledEndTime: scheduleEnd,
      serviceLocation: bookingData.location,
      locationType: 'customer_location',
      address: bookingData.location.addressLine,
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

  return {
    id: record.id,
    bookingNumber: record.bookingNumber,
    customerId: record.customerId,
    artistId: record.artistId,
    occasion: record.occasion,
    services: record.services as BookedService[],
    scheduledDate: record.scheduledDate.toISOString().split('T')[0],
    scheduledStartTime: record.scheduledStartTime.toISOString(),
    scheduledEndTime: record.scheduledEndTime.toISOString(),
    totalAmount: Number.parseFloat(record.totalAmount),
    status: record.status as BookingStatus,
    paymentStatus: record.paymentStatus,
    statusHistory: record.statusHistory as BookingStatusHistoryEntry[],
    timezone: 'Asia/Seoul',
    createdAt: record.createdAt?.toISOString(),
  };
}

/**
 * Create test booking with specific status by updating after creation
 */
export async function createTestBookingWithStatus(
  status: BookingStatus,
  overrides: Partial<CreateBookingPayload> = {}
): Promise<BookingSummary> {
  const booking = await createTestBookingInDB(overrides);

  if (status === 'pending') {
    return booking; // Already pending
  }

  // Update status using repository method to ensure proper history
  const { BookingRepository } = await import('../repositories/bookingRepository.js');
  const repository = new BookingRepository();

  if (status === 'confirmed') {
    return repository.acceptBooking(booking.id, booking.artistId);
  }

  if (status === 'declined') {
    return repository.declineBooking(booking.id, booking.artistId);
  }

  // For other statuses, use the generic update method
  return repository.updateStatus(booking.id, status);
}

/**
 * Clean up test bookings from database
 */
export async function cleanupTestBookings(): Promise<void> {
  await db.delete(bookings).where(sql`booking_number LIKE 'BK-%'`);
}

/**
 * Clean up all test data
 */
export async function cleanupTestData(): Promise<void> {
  await cleanupTestBookings();
}

/**
 * Test request factory for Express middleware testing
 */
export function createTestRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

/**
 * Test response factory for Express middleware testing
 */
interface MockResponse {
  status: (code: number) => MockResponse;
  json: (data: unknown) => MockResponse;
  send: (data: unknown) => MockResponse;
  _statusCode?: number;
  _jsonData?: unknown;
  _sendData?: unknown;
}

export function createTestResponse(): MockResponse {
  const response = {
    status: function (code: number) {
      this._statusCode = code;
      return this;
    },
    json: function (data: unknown) {
      this._jsonData = data;
      return this;
    },
    send: function (data: unknown) {
      this._sendData = data;
      return this;
    },
  };
  return response;
}

/**
 * Test next function factory for Express middleware testing
 */
export function createTestNext(): (this: { _error?: unknown }, error?: unknown) => void {
  return function (this: { _error?: unknown }, error?: unknown) {
    // Store the error for testing
    this._error = error;
  };
}
