import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { BookingRepository } from '../repositories/bookingRepository.js';
import type { NotificationService } from '../services/notificationService.js';
import type { PaymentService } from '../services/paymentService.js';
import { TEST_USERS, createTestBooking } from '../test/fixtures.js';
import { BookingService } from './bookingService.js';

// Create mock functions
function createMock() {
  const calls: unknown[][] = [];
  const mockFn = (...args: unknown[]) => {
    calls.push(args);
    return Promise.resolve({ id: 'mock-booking', status: 'confirmed' });
  };
  mockFn.calls = calls;
  mockFn.callCount = () => calls.length;
  return mockFn;
}

// Mock the repository, notification service, and payment service
const mockRepository = {
  acceptBooking: createMock(),
  declineBooking: createMock(),
  cancelPendingBooking: createMock(),
  findById: createMock(),
  create: createMock(),
};

const mockNotificationService = {
  notifyBookingStatusChanged: createMock(),
  notifyBookingCreated: createMock(),
};

const mockPaymentService = {
  authorizePayment: createMock(),
};

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    // Reset mock call counts
    for (const mock of Object.values(mockRepository)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockNotificationService)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockPaymentService)) {
      mock.calls.length = 0;
    }

    // Create service with mocked dependencies
    service = new BookingService(
      mockRepository as unknown as BookingRepository,
      mockNotificationService as unknown as NotificationService,
      mockPaymentService as unknown as PaymentService
    );
  });

  describe('acceptBooking', () => {
    it('should call repository.acceptBooking with correct params', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;

      const result = await service.acceptBooking(bookingId, artistId);

      assert.equal(mockRepository.acceptBooking.callCount(), 1);
      assert.deepEqual(mockRepository.acceptBooking.calls[0], [bookingId, artistId]);
      assert.deepEqual(result, { id: 'mock-booking', status: 'confirmed' });
    });

    it('should notify booking status changed after accepting', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;

      await service.acceptBooking(bookingId, artistId);

      assert.equal(mockNotificationService.notifyBookingStatusChanged.callCount(), 1);
      assert.deepEqual(mockNotificationService.notifyBookingStatusChanged.calls[0][0], {
        id: 'mock-booking',
        status: 'confirmed',
      });
    });
  });

  describe('declineBooking', () => {
    it('should call repository.declineBooking with bookingId, artistId, and reason', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;
      const reason = 'Schedule conflict';

      const result = await service.declineBooking(bookingId, artistId, reason);

      assert.equal(mockRepository.declineBooking.callCount(), 1);
      assert.deepEqual(mockRepository.declineBooking.calls[0], [bookingId, artistId, reason]);
      assert.deepEqual(result, { id: 'mock-booking', status: 'confirmed' });
    });

    it('should call repository.declineBooking with undefined reason when not provided', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;

      const result = await service.declineBooking(bookingId, artistId);

      assert.equal(mockRepository.declineBooking.callCount(), 1);
      assert.deepEqual(mockRepository.declineBooking.calls[0], [bookingId, artistId, undefined]);
    });

    it('should notify booking status changed after declining', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;

      await service.declineBooking(bookingId, artistId);

      assert.equal(mockNotificationService.notifyBookingStatusChanged.callCount(), 1);
    });
  });

  describe('cancelPendingBooking', () => {
    it('should call repository.cancelPendingBooking with correct params', async () => {
      const bookingId = 'test-booking-id';
      const customerId = TEST_USERS.customer1;

      const result = await service.cancelPendingBooking(bookingId, customerId);

      assert.equal(mockRepository.cancelPendingBooking.callCount(), 1);
      assert.deepEqual(mockRepository.cancelPendingBooking.calls[0], [bookingId, customerId]);
    });

    it('should notify booking status changed after cancelling', async () => {
      const bookingId = 'test-booking-id';
      const customerId = TEST_USERS.customer1;

      await service.cancelPendingBooking(bookingId, customerId);

      assert.equal(mockNotificationService.notifyBookingStatusChanged.callCount(), 1);
    });
  });

  describe('createBooking', () => {
    it('should create booking via repository and authorize payment', async () => {
      const payload = createTestBooking({
        customerId: TEST_USERS.customer1,
        artistId: TEST_USERS.artist1,
      });

      const result = await service.createBooking(payload);

      assert.equal(mockRepository.create.callCount(), 1);
      assert.equal(mockRepository.create.calls[0][0], payload);
      assert.equal(mockPaymentService.authorizePayment.callCount(), 1);
      assert.equal(mockNotificationService.notifyBookingCreated.callCount(), 1);
    });
  });
});
