import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { BookingRepository } from '../repositories/bookingRepository.js';
import type { ConversationService } from '../services/conversationService.js';
import type { MessageService } from '../services/messageService.js';
import type { MessageTemplateService } from '../services/messageTemplateService.js';
import type { NotificationService } from '../services/notificationService.js';
import type { PaymentService } from '../services/paymentService.js';
import { TEST_USERS, createTestBooking } from '../test/fixtures.js';
import { BookingService } from './bookingService.js';

// Create mock functions
interface MockFn<T = unknown> {
  (...args: unknown[]): Promise<T>;
  calls: unknown[][];
  callCount(): number;
}

function createMock<T = { id: string; status: string }>(
  defaultReturn: T = { id: 'mock-booking', status: 'confirmed' } as T
): MockFn<T> {
  const calls: unknown[][] = [];
  const mockFn = Object.assign(
    (...args: unknown[]) => {
      calls.push(args);
      return Promise.resolve(defaultReturn);
    },
    {
      calls,
      callCount: () => calls.length,
    }
  );
  return mockFn;
}

// Mock the repository, notification service, and payment service
const mockRepository = {
  acceptBooking: createMock(),
  declineBooking: createMock(),
  cancelPendingBooking: createMock(),
  completeBooking: createMock(),
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

const mockConversationService = {
  getOrCreateConversation: createMock(),
};

const mockMessageService = {
  sendSystemMessage: createMock(),
};

const mockMessageTemplateService = {
  generateBookingStatusMessage: createMock('System message'),
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
    for (const mock of Object.values(mockConversationService)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockMessageService)) {
      mock.calls.length = 0;
    }
    for (const mock of Object.values(mockMessageTemplateService)) {
      mock.calls.length = 0;
    }

    // Create service with mocked dependencies
    service = new BookingService(
      mockRepository as unknown as BookingRepository,
      mockNotificationService as unknown as NotificationService,
      mockPaymentService as unknown as PaymentService,
      mockMessageService as unknown as MessageService,
      mockConversationService as unknown as ConversationService,
      mockMessageTemplateService as unknown as MessageTemplateService
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

  describe('completeBooking', () => {
    it('should call repository.completeBooking with correct params', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;
      const mockCompletedBooking = {
        id: bookingId,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        completedBy: artistId,
      };

      // Create a fresh mock for this test
      const completeBookingMock = createMock(mockCompletedBooking);
      const originalCompleteBooking = mockRepository.completeBooking;
      mockRepository.completeBooking = completeBookingMock;

      const result = await service.completeBooking(bookingId, artistId);

      assert.equal(completeBookingMock.callCount(), 1);
      assert.deepEqual(completeBookingMock.calls[0], [bookingId, artistId]);
      assert.deepEqual(result, mockCompletedBooking);

      // Restore original mock
      mockRepository.completeBooking = originalCompleteBooking;
    });

    it('should notify booking status changed after completing', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;
      const mockCompletedBooking = {
        id: bookingId,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        completedBy: artistId,
      };

      // Create a fresh mock for this test
      const completeBookingMock = createMock(mockCompletedBooking);
      const originalCompleteBooking = mockRepository.completeBooking;
      mockRepository.completeBooking = completeBookingMock;

      await service.completeBooking(bookingId, artistId);

      assert.equal(mockNotificationService.notifyBookingStatusChanged.callCount(), 1);
      assert.deepEqual(
        mockNotificationService.notifyBookingStatusChanged.calls[0][0],
        mockCompletedBooking
      );

      // Restore original mock
      mockRepository.completeBooking = originalCompleteBooking;
    });

    it('should handle repository errors (booking not found)', async () => {
      const bookingId = 'nonexistent-booking';
      const artistId = TEST_USERS.artist1;

      // Create a mock that rejects
      const calls: unknown[][] = [];
      const completeBookingMock = Object.assign(
        (...args: unknown[]) => {
          calls.push(args);
          return Promise.reject(Object.assign(new Error('Booking not found'), { status: 404 }));
        },
        {
          calls,
          callCount: () => calls.length,
        }
      ) as MockFn;

      const originalCompleteBooking = mockRepository.completeBooking;
      mockRepository.completeBooking = completeBookingMock;

      await assert.rejects(
        () => service.completeBooking(bookingId, artistId),
        (error: Error & { status: number }) => {
          assert.equal(error.message, 'Booking not found');
          assert.equal(error.status, 404);
          return true;
        }
      );

      // Restore original mock
      mockRepository.completeBooking = originalCompleteBooking;
    });

    it('should handle repository errors (forbidden - wrong artist)', async () => {
      const bookingId = 'test-booking-id';
      const wrongArtistId = 'wrong-artist-id';

      // Create a mock that rejects
      const calls: unknown[][] = [];
      const completeBookingMock = Object.assign(
        (...args: unknown[]) => {
          calls.push(args);
          return Promise.reject(Object.assign(new Error('Forbidden'), { status: 403 }));
        },
        {
          calls,
          callCount: () => calls.length,
        }
      ) as MockFn;

      const originalCompleteBooking = mockRepository.completeBooking;
      mockRepository.completeBooking = completeBookingMock;

      await assert.rejects(
        () => service.completeBooking(bookingId, wrongArtistId),
        (error: Error & { status: number }) => {
          assert.equal(error.message, 'Forbidden');
          assert.equal(error.status, 403);
          return true;
        }
      );

      // Restore original mock
      mockRepository.completeBooking = originalCompleteBooking;
    });

    it('should handle repository errors (invalid status transition)', async () => {
      const bookingId = 'test-booking-id';
      const artistId = TEST_USERS.artist1;

      // Create a mock that rejects
      const calls: unknown[][] = [];
      const completeBookingMock = Object.assign(
        (...args: unknown[]) => {
          calls.push(args);
          return Promise.reject(
            Object.assign(new Error('Only paid bookings in progress can be completed'), {
              status: 409,
            })
          );
        },
        {
          calls,
          callCount: () => calls.length,
        }
      ) as MockFn;

      const originalCompleteBooking = mockRepository.completeBooking;
      mockRepository.completeBooking = completeBookingMock;

      await assert.rejects(
        () => service.completeBooking(bookingId, artistId),
        (error: Error & { status: number }) => {
          assert.equal(error.message, 'Only paid bookings in progress can be completed');
          assert.equal(error.status, 409);
          return true;
        }
      );

      // Restore original mock
      mockRepository.completeBooking = originalCompleteBooking;
    });
  });
});
