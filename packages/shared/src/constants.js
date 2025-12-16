export const projectName = '524';
export const USER_ROLES = ['customer', 'artist', 'admin'];
export const SERVICE_TYPES = ['hair', 'makeup', 'combo'];
export const BOOKING_STATUS = [
  'pending',
  'confirmed',
  'paid',
  'in_progress',
  'completed',
  'cancelled',
];

export const BOOKING_SYSTEM_MESSAGES = {
  ko: {
    pending: '예약이 생성되었습니다. 예약 번호: {bookingNumber}, 일정: {scheduledDate}',
    confirmed: '예약이 확정되었습니다. 예약 번호: {bookingNumber}, 일정: {scheduledDate}',
    in_progress: '서비스가 시작되었습니다. 예약 번호: {bookingNumber}',
    completed: '서비스가 완료되었습니다. 예약 번호: {bookingNumber}',
    cancelled: '예약이 취소되었습니다. 예약 번호: {bookingNumber}',
    no_show: '고객이 나타나지 않았습니다. 예약 번호: {bookingNumber}',
  },
  en: {
    pending: 'Booking has been created. Booking number: {bookingNumber}, Schedule: {scheduledDate}',
    confirmed:
      'Booking has been confirmed. Booking number: {bookingNumber}, Schedule: {scheduledDate}',
    in_progress: 'Service has started. Booking number: {bookingNumber}',
    completed: 'Service has been completed. Booking number: {bookingNumber}',
    cancelled: 'Booking has been cancelled. Booking number: {bookingNumber}',
    no_show: 'Customer did not show up. Booking number: {bookingNumber}',
  },
};
//# sourceMappingURL=constants.js.map
