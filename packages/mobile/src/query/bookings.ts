import type { BookingStatus, BookingSummary } from '@524/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  declineBooking,
  getArtistBookings,
  getBookingDetail,
  getBookings,
} from '../api/client';

const bookingListKey = (status?: BookingStatus) => ['bookings', 'list', status ?? 'all'];
const bookingDetailKey = (bookingId?: string) => ['bookings', 'detail', bookingId ?? 'unknown'];
const artistBookingListKey = (status?: BookingStatus) => [
  'artist',
  'bookings',
  'list',
  status ?? 'all',
];

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

export function useArtistBookings(status?: BookingStatus) {
  return useQuery<BookingSummary[]>({
    queryKey: artistBookingListKey(status),
    queryFn: () => getArtistBookings({ status }),
  });
}

export function useAcceptBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => acceptBooking(bookingId),
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
    },
  });
}

export function useDeclineBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { bookingId: string; reason?: string }) =>
      declineBooking(variables.bookingId, variables.reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(variables.bookingId) });
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
    },
  });
}

export function useCompleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => completeBooking(bookingId),
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: bookingDetailKey(bookingId) });
    },
  });
}
