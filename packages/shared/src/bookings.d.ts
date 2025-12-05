import type { BookingStatus, ServiceType } from './constants';
export interface ServiceLocation {
  latitude: number;
  longitude: number;
  addressLine: string;
}
export interface BookedService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}
export interface CreateBookingPayload {
  customerId: string;
  artistId: string;
  serviceType: ServiceType;
  occasion: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  totalAmount: number;
  services: BookedService[];
  location: ServiceLocation;
  notes?: string;
}
export interface BookingSummary {
  id: string;
  bookingNumber: string;
  customerId: string;
  artistId: string;
  occasion: string;
  services: BookedService[];
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  totalAmount: number;
  status: BookingStatus;
}
export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}
//# sourceMappingURL=bookings.d.ts.map
