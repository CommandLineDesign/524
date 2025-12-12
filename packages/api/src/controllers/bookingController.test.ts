import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import {
  TEST_USERS,
  createTestNext,
  createTestRequest,
  createTestResponse,
} from '../test/fixtures.js';
import { BookingController } from './bookingController.js';

describe('BookingController', () => {
  describe('acceptBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: 'test-booking-id' },
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
  });

  describe('declineBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: 'test-booking-id' },
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
  });

  describe('cancelPendingBooking', () => {
    it('should return 401 when user not authenticated', async () => {
      const req = createTestRequest({
        params: { bookingId: 'test-booking-id' },
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
});
