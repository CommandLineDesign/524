import type { BookingSummary } from '@524/shared/bookings';
import type { PaymentAuthorizationResult } from '@524/shared/payments';

import { createLogger } from '../../utils/logger.js';

const logger = createLogger('payments:kakao');

export interface PaymentProvider {
  authorize(booking: BookingSummary): Promise<PaymentAuthorizationResult>;
}

export class KakaoPayProvider implements PaymentProvider {
  async authorize(booking: BookingSummary): Promise<PaymentAuthorizationResult> {
    logger.info({ bookingId: booking.id }, 'Authorizing payment via Kakao Pay');

    return {
      bookingId: booking.id,
      status: 'authorized',
      provider: 'kakao_pay',
      transactionId: `KP-${Date.now()}`,
    };
  }
}
