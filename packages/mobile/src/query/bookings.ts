import type { BookingStatus, BookingSummary } from '@524/shared';
import { useQuery } from '@tanstack/react-query';

import { getBookingDetail, getBookings } from '../api/client';

const bookingListKey = (status?: BookingStatus) => ['bookings', 'list', status ?? 'all'];
const bookingDetailKey = (bookingId?: string) => ['bookings', 'detail', bookingId ?? 'unknown'];

export function useCustomerBookings(status?: BookingStatus) {
  return useQuery<BookingSummary[]>({
    queryKey: bookingListKey(status),
    queryFn: () => getBookings({ status }),
  });
}

export function useBookingDetail(bookingId?: string) {
  return useQuery<BookingSummary>({
    queryKey: bookingDetailKey(bookingId),
    queryFn: () => getBookingDetail(bookingId ?? ''),
    enabled: Boolean(bookingId),
  });
}
