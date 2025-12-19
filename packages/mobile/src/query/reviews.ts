import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type GetReviewsParams,
  type SubmitReviewPayload,
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

export function useCustomerReviews(params: GetReviewsParams = {}) {
  return useQuery({
    queryKey: ['reviews', 'customer', params],
    queryFn: () => getReviews({ ...params, role: 'customer' }),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
