export declare const projectName = '524';
export declare const USER_ROLES: readonly ['customer', 'artist', 'admin'];
export type UserRole = (typeof USER_ROLES)[number];
export declare const SERVICE_TYPES: readonly ['hair', 'makeup', 'combo'];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export declare const BOOKING_STATUS: readonly [
  'pending',
  'declined',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export declare const PAYMENT_STATUS: readonly ['pending', 'paid', 'failed', 'refunded'];
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
//# sourceMappingURL=constants.d.ts.map
