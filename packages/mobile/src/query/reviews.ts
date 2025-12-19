import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type GetReviewsParams,
  type GetReviewsResponse,
  type SubmitReviewPayload,
  getReviewStats,
  getReviews,
  submitReview,
} from '../api/client';

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: SubmitReviewPayload }) =>
      submitReview(bookingId, payload),
    onSuccess: () => {
      // Invalidate booking and review queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useCustomerReviews(params: Omit<GetReviewsParams, 'offset'> = {}) {
  return useInfiniteQuery<GetReviewsResponse>({
    queryKey: ['reviews', 'customer', params],
    queryFn: ({ pageParam }) =>
      getReviews({ ...params, role: 'customer', offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetReviewsResponse) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    staleTime: 30000, // 30 seconds - balance between performance and freshness for user content
  });
}

export function useArtistReviews(params: Omit<GetReviewsParams, 'offset'> = {}) {
  return useInfiniteQuery<GetReviewsResponse>({
    queryKey: ['reviews', 'artist', params],
    queryFn: ({ pageParam }) =>
      getReviews({ ...params, role: 'artist', offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetReviewsResponse) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    staleTime: 30000, // 30 seconds - balance between performance and freshness for user content
  });
}

export function useArtistReviewStats() {
  return useQuery({
    queryKey: ['reviews', 'stats'],
    queryFn: () => getReviewStats(),
    staleTime: 60000, // 60 seconds - stats don't change frequently
  });
}
