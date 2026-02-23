import type { PaymentAuthorizationResult, PaymentVoidResult } from '@524/shared';
import type { BookingSummary } from '@524/shared/bookings';

import { createLogger } from '../../utils/logger.js';

const logger = createLogger('payments:kakao');

export interface PaymentProvider {
  authorize(booking: BookingSummary): Promise<PaymentAuthorizationResult>;
  voidAuthorization(booking: BookingSummary): Promise<PaymentVoidResult>;
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

  async voidAuthorization(booking: BookingSummary): Promise<PaymentVoidResult> {
    logger.info({ bookingId: booking.id }, 'Voiding payment authorization via Kakao Pay');

    return {
      bookingId: booking.id,
      status: 'voided',
      provider: 'kakao_pay',
    };
  }
}
