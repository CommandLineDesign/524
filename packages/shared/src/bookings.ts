import type { BookingStatus, ServiceType } from './constants';
import type { ChatMessage } from './messaging';

export interface ServiceLocation {
  latitude: number;
  longitude: number;
  addressLine: string;
  detailAddress?: string;
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
  occasion: string | null;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  totalAmount: number;
  services: BookedService[];
  location: ServiceLocation;
  notes?: string;
  referenceImages?: string[];
}

export interface BookingSummary {
  id: string;
  bookingNumber: string;
  customerId: string;
  artistId: string;
  artistName?: string;
  occasion: string;
  services: BookedService[];
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  totalAmount: number;
  status: BookingStatus;
  location?: ServiceLocation;
  createdAt?: string;
  paymentStatus?: string;
  statusHistory?: BookingStatusHistoryEntry[];
  timezone?: string;
  completedAt?: string;
  completedBy?: string;
  referenceImages?: string[];
  cancellationReason?: string;
  cancelledBy?: 'artist' | 'customer';
  cancelledAt?: string;
  review?: {
    id: string;
    overallRating: number;
    qualityRating: number;
    professionalismRating: number;
    timelinessRating: number;
    reviewText?: string;
    reviewImages?: string[];
    createdAt: string;
  };
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

export interface BookingParticipant {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface BookingStatusHistoryEntry {
  status: BookingStatus | string;
  timestamp: string;
}

export interface AdminBookingListItem {
  id: string;
  bookingNumber: string;
  status: BookingStatus | string;
  paymentStatus: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  totalAmount: number;
  customerId: string;
  customerName: string;
  artistId: string;
  artistName: string;
  createdAt: string;
}

export interface AdminBookingDetail extends AdminBookingListItem {
  occasion: string;
  services: BookedService[];
  statusHistory?: BookingStatusHistoryEntry[];
  breakdown?: Record<string, unknown> | null;
  location?: {
    serviceLocation?: Record<string, unknown> | null;
    address?: Record<string, unknown> | null;
    locationType?: string | null;
    notes?: string | null;
  };
  customer: BookingParticipant;
  artist: BookingParticipant;
  messages: ChatMessage[];
}
