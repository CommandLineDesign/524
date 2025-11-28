import type { BookingSummary } from '@524/shared/bookings';
import type { PaymentAuthorizationResult } from '@524/shared/payments';

import { KakaoPayProvider } from '../payments/providers/kakaoPayProvider';

export class PaymentService {
  constructor(private readonly provider = new KakaoPayProvider()) {}

  authorizePayment(booking: BookingSummary): Promise<PaymentAuthorizationResult> {
    return this.provider.authorize(booking);
  }
}

