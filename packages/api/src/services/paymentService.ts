import type { PaymentAuthorizationResult, PaymentVoidResult } from '@524/shared';
import type { BookingSummary } from '@524/shared/bookings';

import { KakaoPayProvider } from '../payments/providers/kakaoPayProvider.js';

export class PaymentService {
  constructor(private readonly provider = new KakaoPayProvider()) {}

  authorizePayment(booking: BookingSummary): Promise<PaymentAuthorizationResult> {
    return this.provider.authorize(booking);
  }

  voidAuthorization(booking: BookingSummary): Promise<PaymentVoidResult> {
    return this.provider.voidAuthorization(booking);
  }
}
