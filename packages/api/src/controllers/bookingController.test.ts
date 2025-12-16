import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { BookingSummary } from '@524/shared/bookings';
import type { Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import {
  TEST_USERS,
  createTestBookingInDB,
  createTestNext,
  createTestRequest,
  createTestResponse,
  generateTestToken,
} from '../test/fixtures.js';
import { BookingController } from './bookingController.js';

describe('BookingController', () => {
  let testBookingId: string;

  before(async () => {
    // Create a test booking for use in tests
    const booking = await createTestBookingInDB({
      customerId: TEST_USERS.customer1,
      artistId: TEST_USERS.artist1,
      status: 'pending',
    });
    testBookingId = booking.id;
  });

  describe('getBookingById', () => {
    it('should return booking for authenticated customer who owns it', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: {
          id: TEST_USERS.customer1,
          roles: ['customer'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.getBookingById(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
      const responseData = (res as { _jsonData?: unknown })._jsonData as BookingSummary;
      assert.equal(responseData.id, testBookingId);
      assert.equal(responseData.customerId, TEST_USERS.customer1);
    });

    it('should return booking for authenticated artist who owns it', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: {
          id: TEST_USERS.artist1,
          roles: ['artist'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.getBookingById(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
      const responseData = (res as { _jsonData?: unknown })._jsonData as BookingSummary;
      assert.equal(responseData.id, testBookingId);
      assert.equal(responseData.artistId, TEST_USERS.artist1);
    });

    it('should return booking for admin user', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: {
          id: TEST_USERS.admin,
          roles: ['admin'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.getBookingById(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
    });

    it("should return 403 for customer trying to access another customer's booking", async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: {
          id: TEST_USERS.customer2, // Different customer
          roles: ['customer'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.getBookingById(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 403);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'Access denied',
      });
    });

    it('should return 404 for non-existent booking', async () => {
      const req = createTestRequest({
        params: { bookingId: 'non-existent-id' },
        user: {
          id: TEST_USERS.admin,
          roles: ['admin'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.getBookingById(req, res, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 404);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'Booking not found',
      });
    });
  });

  describe('acceptBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: undefined,
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.acceptBooking(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });

    it('should accept booking for authenticated artist', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: {
          id: TEST_USERS.artist1,
          roles: ['artist'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.acceptBooking(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
      const responseData = (res as { _jsonData?: unknown })._jsonData as BookingSummary;
      assert.equal(responseData.status, 'confirmed');
    });
  });

  describe('declineBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: undefined,
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.declineBooking(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });

    it('should decline booking for authenticated artist with reason', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        body: { reason: 'schedule_conflict' },
        user: {
          id: TEST_USERS.artist1,
          roles: ['artist'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.declineBooking(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
      const responseData = (res as { _jsonData?: unknown })._jsonData as BookingSummary;
      assert.equal(responseData.status, 'declined');
    });
  });

  describe('cancelPendingBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        user: undefined,
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.cancelPendingBooking(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 401);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'User not authenticated',
      });
    });
  });

  describe('updateBookingStatus', () => {
    it('should return 400 when status is missing', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        body: {},
        user: {
          id: TEST_USERS.artist1,
          roles: ['artist'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.updateBookingStatus(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 400);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'status is required',
      });
    });

    it('should handle accept/decline actions for artists', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        body: { status: 'confirmed' },
        user: {
          id: TEST_USERS.artist1,
          roles: ['artist'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.updateBookingStatus(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 200);
      const responseData = (res as { _jsonData?: unknown })._jsonData as BookingSummary;
      assert.equal(responseData.status, 'confirmed');
    });

    it('should return 403 when non-artist tries to accept/decline', async () => {
      const req = createTestRequest({
        params: { bookingId: testBookingId },
        body: { status: 'confirmed' },
        user: {
          id: TEST_USERS.customer1,
          roles: ['customer'],
        },
      });
      const res = createTestResponse();
      const next = createTestNext();

      await BookingController.updateBookingStatus(req as AuthRequest, res as Response, next);

      assert.equal((res as { _statusCode?: number })._statusCode, 403);
      assert.deepEqual((res as { _jsonData?: unknown })._jsonData, {
        error: 'Only artists can accept or decline bookings',
      });
    });
  });
});
