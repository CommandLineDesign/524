export const projectName = '524';

export const USER_ROLES = ['customer', 'artist', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SERVICE_TYPES = ['hair', 'makeup', 'combo'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const BOOKING_STATUS = [
  'pending',
  'declined',
  'confirmed',
  'paid',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const BOOKING_SYSTEM_MESSAGES = {
  ko: {
    pending: '예약이 생성되었습니다. 예약 번호: {bookingNumber}, 일정: {scheduledDate}',
    declined: '예약이 거부되었습니다. 예약 번호: {bookingNumber}',
    confirmed: '예약이 확정되었습니다. 예약 번호: {bookingNumber}, 일정: {scheduledDate}',
    paid: '결제가 완료되었습니다. 예약 번호: {bookingNumber}',
    in_progress: '서비스가 시작되었습니다. 예약 번호: {bookingNumber}',
    completed: '서비스가 완료되었습니다. 예약 번호: {bookingNumber}',
    cancelled: '예약이 취소되었습니다. 예약 번호: {bookingNumber}',
    no_show: '고객이 나타나지 않았습니다. 예약 번호: {bookingNumber}',
  },
  en: {
    pending: 'Booking has been created. Booking number: {bookingNumber}, Schedule: {scheduledDate}',
    declined: 'Booking has been declined. Booking number: {bookingNumber}',
    confirmed:
      'Booking has been confirmed. Booking number: {bookingNumber}, Schedule: {scheduledDate}',
    paid: 'Payment has been completed. Booking number: {bookingNumber}',
    in_progress: 'Service has started. Booking number: {bookingNumber}',
    completed: 'Service has been completed. Booking number: {bookingNumber}',
    cancelled: 'Booking has been cancelled. Booking number: {bookingNumber}',
    no_show: 'Customer did not show up. Booking number: {bookingNumber}',
  },
} as const;

// Re-export defaultLocale from i18n
export { defaultLocale } from './i18n';
