import { sendPushNotification } from '@524/notifications';
import type { BookingSummary } from '@524/shared/bookings';

import { createLogger } from '../utils/logger.js';

const logger = createLogger('notifications');

// Notification retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second
const MAX_RETRY_DELAY_MS = 30000; // 30 seconds

// In-memory queue for failed notifications (in production, this should be a proper queue)
const failedNotifications: Array<{
  id: string;
  token: string;
  payload: Parameters<typeof sendPushNotification>[1];
  attempt: number;
  nextRetryAt: Date;
  createdAt: Date;
}> = [];

export class NotificationService {
  async notifyBookingCreated(booking: BookingSummary): Promise<void> {
    logger.info({ bookingId: booking.id }, 'Booking created notification');
    await this.dispatch(`booking:${booking.id}`, {
      title: '예약이 생성되었습니다',
      body: '아티스트가 곧 예약을 확인할 거예요.',
      data: { bookingId: booking.id },
    });
  }

  async notifyBookingStatusChanged(booking: BookingSummary): Promise<void> {
    logger.info(
      { bookingId: booking.id, status: booking.status },
      'Booking status update notification'
    );
    await this.dispatch(`booking:${booking.id}`, {
      title: '예약 상태가 업데이트됐어요',
      body: `현재 상태: ${booking.status}`,
      data: { bookingId: booking.id, status: booking.status },
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
    await this.dispatch(`user:${notification.userId}`, {
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });
  }

  private async dispatch(token: string, payload: Parameters<typeof sendPushNotification>[1]) {
    await this.sendWithRetry(token, payload);
  }

  private async sendWithRetry(
    token: string,
    payload: Parameters<typeof sendPushNotification>[1],
    attempt = 1
  ): Promise<void> {
    try {
      await sendPushNotification(token, payload);
      logger.debug({ token, attempt }, 'Notification sent successfully');
    } catch (error) {
      logger.warn(
        { error, token, attempt },
        `Failed to send push notification (attempt ${attempt})`
      );

      if (attempt < MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = Math.min(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
        const nextRetryAt = new Date(Date.now() + delay);

        // Queue for retry
        const notificationId = `${token}-${Date.now()}-${attempt}`;
        failedNotifications.push({
          id: notificationId,
          token,
          payload,
          attempt,
          nextRetryAt,
          createdAt: new Date(),
        });

        logger.info({ notificationId, nextRetryAt }, 'Notification queued for retry');

        // Schedule retry (in production, use a proper job queue)
        setTimeout(() => {
          this.processRetry(notificationId);
        }, delay);
      } else {
        logger.error({ error, token }, 'Notification failed permanently after all retries');
        // In production, this would go to a dead letter queue
        this.handleDeadLetter(token, payload, error);
      }
    }
  }

  private async processRetry(notificationId: string): Promise<void> {
    const index = failedNotifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return;

    const notification = failedNotifications[index];
    failedNotifications.splice(index, 1); // Remove from queue

    await this.sendWithRetry(notification.token, notification.payload, notification.attempt + 1);
  }

  private handleDeadLetter(
    token: string,
    payload: Parameters<typeof sendPushNotification>[1],
    error: unknown
  ): void {
    logger.error(
      {
        token,
        payload,
        error,
        timestamp: new Date().toISOString(),
      },
      'Notification moved to dead letter queue'
    );

    // In production, persist to database or send to monitoring system
    // For now, just log the dead letter
  }

  /**
   * Process any pending retry notifications (call this periodically)
   */
  async processPendingRetries(): Promise<void> {
    const now = new Date();
    const pendingRetries = failedNotifications.filter((n) => n.nextRetryAt <= now);

    logger.debug({ count: pendingRetries.length }, 'Processing pending notification retries');

    for (const notification of pendingRetries) {
      await this.processRetry(notification.id);
    }
  }

  /**
   * Get statistics about failed notifications
   */
  getNotificationStats() {
    const now = new Date();
    const pending = failedNotifications.filter((n) => n.nextRetryAt > now).length;
    const expired = failedNotifications.filter((n) => n.nextRetryAt <= now).length;

    return {
      pendingRetries: pending,
      expiredRetries: expired,
      totalQueued: failedNotifications.length,
    };
  }
}
