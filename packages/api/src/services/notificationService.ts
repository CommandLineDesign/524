import type { BookingSummary } from '@524/shared/bookings';

import { NotificationRepository } from '../repositories/notificationRepository.js';
import { createLogger } from '../utils/logger.js';
import { NotificationPreferenceService } from './notificationPreferenceService.js';
import { PushNotificationService } from './pushNotificationService.js';

const logger = createLogger('notifications');

export class NotificationService {
  private pushService: PushNotificationService;
  private preferenceService: NotificationPreferenceService;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.pushService = new PushNotificationService();
    this.preferenceService = new NotificationPreferenceService();
    this.notificationRepository = new NotificationRepository();
  }

  private async persistNotification(params: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    try {
      await this.notificationRepository.create({
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data,
      });
    } catch (error) {
      // Don't fail the notification send if persistence fails
      logger.error(
        { error, userId: params.userId, type: params.type },
        'Failed to persist notification'
      );
    }
  }

  async notifyBookingCreated(booking: BookingSummary): Promise<void> {
    logger.info({ bookingId: booking.id }, 'Booking created notification');

    const type = 'booking_created';
    const title = '새 예약 요청';
    const body = '새로운 예약 요청이 도착했습니다. 확인해 주세요.';
    const data = {
      type,
      bookingId: booking.id,
    };

    // Check if artist has this notification type enabled
    const isEnabled = await this.preferenceService.isNotificationEnabled(booking.artistId, type);
    if (!isEnabled) {
      logger.info(
        { bookingId: booking.id, artistId: booking.artistId },
        'Notification disabled by user preference'
      );
      return;
    }

    // Persist notification to inbox
    await this.persistNotification({
      userId: booking.artistId,
      type,
      title,
      body,
      data,
    });

    // Send push notification
    await this.pushService.sendToUser(booking.artistId, { title, body, data });
  }

  async notifyBookingStatusChanged(booking: BookingSummary): Promise<void> {
    logger.info(
      { bookingId: booking.id, status: booking.status },
      'Booking status update notification'
    );

    const { userId, title, body } = this.getStatusChangeNotification(booking);
    const type = `booking_${booking.status}`;
    const data = {
      type: 'booking_status_changed',
      bookingId: booking.id,
      status: booking.status,
    };

    // Check if user has this notification type enabled
    const isEnabled = await this.preferenceService.isNotificationEnabled(userId, type);
    if (!isEnabled) {
      logger.info(
        { bookingId: booking.id, userId, status: booking.status },
        'Notification disabled by user preference'
      );
      return;
    }

    // Persist notification to inbox
    await this.persistNotification({
      userId,
      type,
      title,
      body,
      data,
    });

    // Send push notification
    await this.pushService.sendToUser(userId, { title, body, data });
  }

  async sendNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, string>;
  }): Promise<void> {
    logger.info({ userId: notification.userId, type: notification.type }, 'Sending notification');

    // Check if user has this notification type enabled
    const isEnabled = await this.preferenceService.isNotificationEnabled(
      notification.userId,
      notification.type
    );
    if (!isEnabled) {
      logger.info(
        { userId: notification.userId, type: notification.type },
        'Notification disabled by user preference'
      );
      return;
    }

    // Persist notification to inbox
    await this.persistNotification({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });

    // Send push notification
    await this.pushService.sendToUser(notification.userId, {
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });
  }

  private getStatusChangeNotification(booking: BookingSummary): {
    userId: string;
    title: string;
    body: string;
  } {
    const statusMessages: Record<
      string,
      {
        forCustomer: { title: string; body: string };
        forArtist?: { title: string; body: string };
      }
    > = {
      confirmed: {
        forCustomer: {
          title: '예약이 확정되었습니다',
          body: '아티스트가 예약을 수락했습니다.',
        },
      },
      declined: {
        forCustomer: {
          title: '예약이 거절되었습니다',
          body: '아티스트가 예약을 거절했습니다. 다른 아티스트를 찾아보세요.',
        },
      },
      cancelled: {
        forCustomer: {
          title: '예약이 취소되었습니다',
          body: '예약이 취소되었습니다.',
        },
        forArtist: {
          title: '예약이 취소되었습니다',
          body: '고객이 예약을 취소했습니다.',
        },
      },
      in_progress: {
        forCustomer: {
          title: '서비스가 시작되었습니다',
          body: '아티스트가 서비스를 시작했습니다.',
        },
      },
      completed: {
        forCustomer: {
          title: '서비스가 완료되었습니다',
          body: '리뷰를 남겨주세요!',
        },
      },
    };

    const messages = statusMessages[booking.status];
    if (!messages) {
      return {
        userId: booking.customerId,
        title: '예약 상태가 업데이트됐어요',
        body: `현재 상태: ${booking.status}`,
      };
    }

    return {
      userId: booking.customerId,
      title: messages.forCustomer.title,
      body: messages.forCustomer.body,
    };
  }
}
