export type PaymentProvider = 'kakao_pay' | 'naver_pay' | 'toss' | 'card';

export interface PaymentAuthorizationResult {
  bookingId: string;
  provider: PaymentProvider;
  status: 'authorized' | 'failed';
  transactionId: string;
}

export interface PaymentVoidResult {
  bookingId: string;
  provider: PaymentProvider;
  status: 'voided' | 'failed';
}
