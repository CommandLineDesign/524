import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type SubmitReviewPayload, submitReview } from '../api/client';

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: SubmitReviewPayload }) =>
      submitReview(bookingId, payload),
    onSuccess: () => {
      // Invalidate booking queries to refresh booking status/details
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
