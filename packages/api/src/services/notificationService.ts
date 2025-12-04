import { sendPushNotification } from '@524/notifications';
import type { BookingSummary } from '@524/shared/bookings';

import { createLogger } from '../utils/logger.js';

const logger = createLogger('notifications');

export class NotificationService {
  async notifyBookingCreated(booking: BookingSummary): Promise<void> {
    logger.info({ bookingId: booking.id }, 'Booking created notification');
    await this.dispatch(`booking:${booking.id}`, {
      title: '예약이 생성되었습니다',
      body: '아티스트가 곧 예약을 확인할 거예요.',
      data: { bookingId: booking.id }
    });
  }

  async notifyBookingStatusChanged(booking: BookingSummary): Promise<void> {
    logger.info({ bookingId: booking.id, status: booking.status }, 'Booking status update notification');
    await this.dispatch(`booking:${booking.id}`, {
      title: '예약 상태가 업데이트됐어요',
      body: `현재 상태: ${booking.status}`,
      data: { bookingId: booking.id, status: booking.status }
    });
  }

  private async dispatch(token: string, payload: Parameters<typeof sendPushNotification>[1]) {
    try {
      await sendPushNotification(token, payload);
    } catch (error) {
      logger.error({ error, token }, 'Failed to send push notification');
    }
  }
}

