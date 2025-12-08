import type { OnboardingResponseInput, OnboardingState } from '@524/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeOnboarding, getOnboardingState, submitOnboardingResponse } from '../api/client';

const ONBOARDING_STATE_KEY = ['onboarding', 'state'];

export function useOnboardingState(enabled: boolean) {
  return useQuery<OnboardingState>({
    queryKey: ONBOARDING_STATE_KEY,
    queryFn: getOnboardingState,
    enabled,
  });
}

export function useSaveOnboardingResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OnboardingResponseInput) => submitOnboardingResponse(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_STATE_KEY, data);
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_STATE_KEY, data);
    },
  });
}
