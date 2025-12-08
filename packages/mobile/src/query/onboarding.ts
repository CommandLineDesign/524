import type { OnboardingResponseInput, OnboardingState } from '@524/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeOnboarding, getOnboardingState, submitOnboardingResponse } from '../api/client';

const onboardingStateKey = (userId?: string) => ['onboarding', 'state', userId ?? 'anonymous'];

export function useOnboardingState(userId?: string) {
  return useQuery<OnboardingState>({
    queryKey: onboardingStateKey(userId),
    queryFn: getOnboardingState,
    enabled: Boolean(userId),
  });
}

export function useSaveOnboardingResponse(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OnboardingResponseInput) => submitOnboardingResponse(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingStateKey(userId), data);
    },
  });
}

export function useCompleteOnboarding(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: (data) => {
      queryClient.setQueryData(onboardingStateKey(userId), data);
    },
  });
}
