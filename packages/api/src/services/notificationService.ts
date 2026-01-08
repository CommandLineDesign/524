import type { BookingSummary } from '@524/shared/bookings';

import { createLogger } from '../utils/logger.js';
import { PushNotificationService, type PushPayload } from './pushNotificationService.js';

const logger = createLogger('notifications');

export class NotificationService {
  private pushService: PushNotificationService;

  constructor() {
    this.pushService = new PushNotificationService();
  }

  async notifyBookingCreated(booking: BookingSummary): Promise<void> {
    logger.info({ bookingId: booking.id }, 'Booking created notification');

    // Notify artist about new booking request
    await this.pushService.sendToUser(booking.artistId, {
      title: '새 예약 요청',
      body: '새로운 예약 요청이 도착했습니다. 확인해 주세요.',
      data: {
        type: 'booking_created',
        bookingId: booking.id,
      },
    });
  }

  async notifyBookingStatusChanged(booking: BookingSummary): Promise<void> {
    logger.info(
      { bookingId: booking.id, status: booking.status },
      'Booking status update notification'
    );

    const { userId, title, body } = this.getStatusChangeNotification(booking);

    await this.pushService.sendToUser(userId, {
      title,
      body,
      data: {
        type: 'booking_status_changed',
        bookingId: booking.id,
        status: booking.status,
      },
    });
  }

  async sendNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, string>;
  }): Promise<void> {
    logger.info({ userId: notification.userId, type: notification.type }, 'Sending notification');

    await this.pushService.sendToUser(notification.userId, {
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });
  }

  async sendToTopic(topic: string, payload: PushPayload): Promise<boolean> {
    return this.pushService.sendToTopic(topic, payload);
  }

  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    await this.pushService.subscribeToTopic(userId, topic);
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    await this.pushService.unsubscribeFromTopic(userId, topic);
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
