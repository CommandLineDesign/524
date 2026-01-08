import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { Notification } from '@524/database';
import type { BookingSummary } from '@524/shared/bookings';

import type { NotificationRepository } from '../repositories/notificationRepository.js';
import { TEST_USERS } from '../test/fixtures.js';
import type { NotificationPreferenceService } from './notificationPreferenceService.js';
import { NotificationService } from './notificationService.js';
import type { PushNotificationService } from './pushNotificationService.js';

// Create mock functions
interface MockFn<T = unknown> {
  (...args: unknown[]): Promise<T>;
  calls: unknown[][];
  callCount(): number;
  reset(): void;
}

function createMock<T>(defaultReturn: T): MockFn<T> {
  const calls: unknown[][] = [];
  const mockFn = Object.assign(
    (...args: unknown[]) => {
      calls.push(args);
      return Promise.resolve(defaultReturn);
    },
    {
      calls,
      callCount: () => calls.length,
      reset: () => {
        calls.length = 0;
      },
    }
  );
  return mockFn;
}

// Mock notification
const mockNotification: Notification = {
  id: 'notification-id',
  userId: TEST_USERS.customer1,
  type: 'booking_created',
  title: 'Test',
  body: 'Test body',
  data: null,
  readAt: null,
  createdAt: new Date(),
};

// Mock push result
const mockPushResult = { successCount: 1, failureCount: 0, invalidTokens: [] };

// Mock booking
function createMockBooking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    id: 'booking-id',
    bookingNumber: 'BK-12345678',
    customerId: TEST_USERS.customer1,
    artistId: TEST_USERS.artist1,
    status: 'pending',
    occasion: 'Test occasion',
    services: [],
    scheduledDate: '2025-01-15',
    scheduledStartTime: '2025-01-15T10:00:00.000Z',
    scheduledEndTime: '2025-01-15T11:00:00.000Z',
    totalAmount: 100000,
    paymentStatus: 'pending',
    statusHistory: [],
    timezone: 'Asia/Seoul',
    ...overrides,
  };
}

describe('NotificationService', () => {
  let service: NotificationService;
  let mockPushService: {
    sendToUser: MockFn<typeof mockPushResult>;
  };
  let mockPreferenceService: {
    isNotificationEnabled: MockFn<boolean>;
  };
  let mockNotificationRepository: {
    create: MockFn<Notification>;
  };

  beforeEach(() => {
    mockPushService = {
      sendToUser: createMock(mockPushResult),
    };

    mockPreferenceService = {
      isNotificationEnabled: createMock(true),
    };

    mockNotificationRepository = {
      create: createMock(mockNotification),
    };

    service = new NotificationService();

    // Inject mocks via property access
    (service as unknown as { pushService: typeof mockPushService }).pushService =
      mockPushService as unknown as PushNotificationService;
    (service as unknown as { preferenceService: typeof mockPreferenceService }).preferenceService =
      mockPreferenceService as unknown as NotificationPreferenceService;
    (
      service as unknown as { notificationRepository: typeof mockNotificationRepository }
    ).notificationRepository = mockNotificationRepository as unknown as NotificationRepository;
  });

  describe('notifyBookingCreated', () => {
    it('should check if artist has notifications enabled', async () => {
      const booking = createMockBooking();

      await service.notifyBookingCreated(booking);

      assert.equal(mockPreferenceService.isNotificationEnabled.callCount(), 1);
      assert.deepEqual(mockPreferenceService.isNotificationEnabled.calls[0], [
        booking.artistId,
        'booking_created',
      ]);
    });

    it('should not send when preference is disabled', async () => {
      mockPreferenceService.isNotificationEnabled = createMock(false);
      const booking = createMockBooking();

      await service.notifyBookingCreated(booking);

      assert.equal(mockNotificationRepository.create.callCount(), 0);
      assert.equal(mockPushService.sendToUser.callCount(), 0);
    });

    it('should persist notification to inbox when enabled', async () => {
      const booking = createMockBooking();

      await service.notifyBookingCreated(booking);

      assert.equal(mockNotificationRepository.create.callCount(), 1);
      const createCall = mockNotificationRepository.create.calls[0][0] as {
        userId: string;
        type: string;
        title: string;
        body: string;
        data: Record<string, string>;
      };
      assert.equal(createCall.userId, booking.artistId);
      assert.equal(createCall.type, 'booking_created');
      assert.ok(createCall.title);
      assert.ok(createCall.body);
    });

    it('should send push notification when enabled', async () => {
      const booking = createMockBooking();

      await service.notifyBookingCreated(booking);

      assert.equal(mockPushService.sendToUser.callCount(), 1);
      assert.equal(mockPushService.sendToUser.calls[0][0], booking.artistId);
    });

    it('should use correct type, title, body for booking_created', async () => {
      const booking = createMockBooking();

      await service.notifyBookingCreated(booking);

      const createCall = mockNotificationRepository.create.calls[0][0] as {
        userId: string;
        type: string;
        title: string;
        body: string;
        data: Record<string, string>;
      };
      assert.equal(createCall.type, 'booking_created');
      assert.equal(createCall.title, '새 예약 요청');
      assert.equal(createCall.body, '새로운 예약 요청이 도착했습니다. 확인해 주세요.');
    });

    it('should include bookingId in data', async () => {
      const booking = createMockBooking({ id: 'test-booking-123' });

      await service.notifyBookingCreated(booking);

      const createCall = mockNotificationRepository.create.calls[0][0] as {
        data: Record<string, string>;
      };
      assert.equal(createCall.data.bookingId, 'test-booking-123');
    });

    it('should target artistId (not customerId)', async () => {
      const booking = createMockBooking({
        customerId: TEST_USERS.customer1,
        artistId: TEST_USERS.artist1,
      });

      await service.notifyBookingCreated(booking);

      const createCall = mockNotificationRepository.create.calls[0][0] as { userId: string };
      assert.equal(createCall.userId, TEST_USERS.artist1);
      assert.equal(mockPushService.sendToUser.calls[0][0], TEST_USERS.artist1);
    });
  });

  describe('notifyBookingStatusChanged', () => {
    it('should check user preference for the status type', async () => {
      const booking = createMockBooking({ status: 'confirmed' });

      await service.notifyBookingStatusChanged(booking);

      assert.equal(mockPreferenceService.isNotificationEnabled.callCount(), 1);
      assert.deepEqual(mockPreferenceService.isNotificationEnabled.calls[0], [
        booking.customerId,
        'booking_confirmed',
      ]);
    });

    it('should not send when preference is disabled', async () => {
      mockPreferenceService.isNotificationEnabled = createMock(false);
      const booking = createMockBooking({ status: 'confirmed' });

      await service.notifyBookingStatusChanged(booking);

      assert.equal(mockNotificationRepository.create.callCount(), 0);
      assert.equal(mockPushService.sendToUser.callCount(), 0);
    });

    it('should persist notification to inbox when enabled', async () => {
      const booking = createMockBooking({ status: 'confirmed' });

      await service.notifyBookingStatusChanged(booking);

      assert.equal(mockNotificationRepository.create.callCount(), 1);
    });

    it('should send push notification when enabled', async () => {
      const booking = createMockBooking({ status: 'confirmed' });

      await service.notifyBookingStatusChanged(booking);

      assert.equal(mockPushService.sendToUser.callCount(), 1);
    });

    describe('status-specific messages', () => {
      it('should send correct message for confirmed status to customer', async () => {
        const booking = createMockBooking({ status: 'confirmed' });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          userId: string;
          title: string;
          body: string;
        };
        assert.equal(createCall.userId, booking.customerId);
        assert.equal(createCall.title, '예약이 확정되었습니다');
        assert.equal(createCall.body, '아티스트가 예약을 수락했습니다.');
      });

      it('should send correct message for declined status to customer', async () => {
        const booking = createMockBooking({ status: 'declined' });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          title: string;
          body: string;
        };
        assert.equal(createCall.title, '예약이 거절되었습니다');
        assert.ok(createCall.body.includes('거절'));
      });

      it('should send correct message for cancelled status', async () => {
        const booking = createMockBooking({ status: 'cancelled' });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          title: string;
          body: string;
        };
        assert.equal(createCall.title, '예약이 취소되었습니다');
      });

      it('should send correct message for in_progress status to customer', async () => {
        const booking = createMockBooking({ status: 'in_progress' });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          title: string;
          body: string;
        };
        assert.equal(createCall.title, '서비스가 시작되었습니다');
      });

      it('should send correct message for completed status to customer', async () => {
        const booking = createMockBooking({ status: 'completed' });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          title: string;
          body: string;
        };
        assert.equal(createCall.title, '서비스가 완료되었습니다');
        assert.ok(createCall.body.includes('리뷰'));
      });

      it('should send fallback message for unknown status', async () => {
        const booking = createMockBooking({ status: 'unknown_status' as BookingSummary['status'] });

        await service.notifyBookingStatusChanged(booking);

        const createCall = mockNotificationRepository.create.calls[0][0] as {
          title: string;
          body: string;
        };
        assert.equal(createCall.title, '예약 상태가 업데이트됐어요');
        assert.ok(createCall.body.includes('unknown_status'));
      });
    });
  });

  describe('sendNotification', () => {
    it('should check user preference for notification type', async () => {
      await service.sendNotification({
        userId: TEST_USERS.customer1,
        type: 'new_message',
        title: 'New Message',
        message: 'You have a new message',
      });

      assert.equal(mockPreferenceService.isNotificationEnabled.callCount(), 1);
      assert.deepEqual(mockPreferenceService.isNotificationEnabled.calls[0], [
        TEST_USERS.customer1,
        'new_message',
      ]);
    });

    it('should not send when preference is disabled', async () => {
      mockPreferenceService.isNotificationEnabled = createMock(false);

      await service.sendNotification({
        userId: TEST_USERS.customer1,
        type: 'marketing',
        title: 'Promo',
        message: 'Check out our deals',
      });

      assert.equal(mockNotificationRepository.create.callCount(), 0);
      assert.equal(mockPushService.sendToUser.callCount(), 0);
    });

    it('should persist notification when enabled', async () => {
      await service.sendNotification({
        userId: TEST_USERS.customer1,
        type: 'new_message',
        title: 'New Message',
        message: 'You have a new message',
      });

      assert.equal(mockNotificationRepository.create.callCount(), 1);
    });

    it('should send push notification when enabled', async () => {
      await service.sendNotification({
        userId: TEST_USERS.customer1,
        type: 'new_message',
        title: 'New Message',
        message: 'You have a new message',
      });

      assert.equal(mockPushService.sendToUser.callCount(), 1);
    });

    it('should handle custom notification types', async () => {
      await service.sendNotification({
        userId: TEST_USERS.customer1,
        type: 'custom_type',
        title: 'Custom',
        message: 'Custom message',
        data: { key: 'value' },
      });

      const createCall = mockNotificationRepository.create.calls[0][0] as {
        type: string;
        data: Record<string, string>;
      };
      assert.equal(createCall.type, 'custom_type');
      assert.deepEqual(createCall.data, { key: 'value' });
    });
  });

  describe('persistNotification error handling', () => {
    it('should not fail the send if persistence fails', async () => {
      // Make create throw an error
      const errorCalls: unknown[][] = [];
      mockNotificationRepository.create = Object.assign(
        (...args: unknown[]) => {
          errorCalls.push(args);
          return Promise.reject(new Error('Database error'));
        },
        {
          calls: errorCalls,
          callCount: () => errorCalls.length,
          reset: () => {
            errorCalls.length = 0;
          },
        }
      ) as MockFn<Notification>;

      const booking = createMockBooking();

      // Should not throw
      await assert.doesNotReject(async () => {
        await service.notifyBookingCreated(booking);
      });

      // Push should still be called
      assert.equal(mockPushService.sendToUser.callCount(), 1);
    });
  });
});
