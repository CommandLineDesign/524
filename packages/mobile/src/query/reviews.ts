import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type GetReviewsParams,
  type GetReviewsResponse,
  type SubmitReviewPayload,
  getArtistReviewStats,
  getArtistReviews,
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

function useReviewsInfiniteQuery(
  role: 'customer' | 'artist',
  params: Omit<GetReviewsParams, 'offset'> = {}
) {
  return useInfiniteQuery<GetReviewsResponse>({
    queryKey: ['reviews', role, params],
    queryFn: ({ pageParam }) => getReviews({ ...params, role, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetReviewsResponse) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    staleTime: 30000, // 30 seconds - balance between performance and freshness for user content
  });
}

export function useCustomerReviews(params: Omit<GetReviewsParams, 'offset'> = {}) {
  return useReviewsInfiniteQuery('customer', params);
}

export function useArtistReviews(params: Omit<GetReviewsParams, 'offset'> = {}) {
  return useReviewsInfiniteQuery('artist', params);
}

export function useArtistReviewStats() {
  return useQuery({
    queryKey: ['reviews', 'stats'],
    queryFn: () => getReviewStats(),
    staleTime: 300000, // 5 minutes - stats change infrequently
  });
}

/**
 * Hook to fetch reviews for a specific artist profile (public endpoint)
 * Used on artist profile screens to display reviews to customers
 */
export function useArtistProfileReviews(
  artistId: string,
  params: Omit<GetReviewsParams, 'offset'> = {}
) {
  return useInfiniteQuery<GetReviewsResponse>({
    queryKey: ['artists', artistId, 'reviews', params],
    queryFn: ({ pageParam }) =>
      getArtistReviews(artistId, { ...params, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetReviewsResponse) =>
      lastPage?.pagination?.hasMore === true
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    staleTime: 60000, // 1 minute - public reviews can be cached longer
  });
}

/**
 * Hook to fetch review statistics for a specific artist profile (public endpoint)
 * Used to display aggregate ratings on artist profiles
 */
export function useArtistProfileReviewStats(artistId: string) {
  return useQuery({
    queryKey: ['artists', artistId, 'reviews', 'stats'],
    queryFn: () => getArtistReviewStats(artistId),
    staleTime: 300000, // 5 minutes - stats change infrequently
  });
}
