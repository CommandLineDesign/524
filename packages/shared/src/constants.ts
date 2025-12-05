export const projectName = '524';

export const USER_ROLES = ['customer', 'artist', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SERVICE_TYPES = ['hair', 'makeup', 'combo'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const BOOKING_STATUS = [
  'pending',
  'confirmed',
  'paid',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
