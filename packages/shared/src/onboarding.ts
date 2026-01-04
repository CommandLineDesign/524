import type { ServiceType } from './constants';

export type OnboardingStepKey =
  | 'celebrity_lookalike'
  | 'celebrity_similar_image'
  | 'celebrity_admire'
  | 'celebrity_result'
  | 'kpop_lookalike'
  | 'service_interests';

export interface OnboardingCelebrityLookalikeResponse {
  step: 'celebrity_lookalike';
  celebrityName: string | null;
}

export interface OnboardingCelebritySimilarImageResponse {
  step: 'celebrity_similar_image';
  celebrityName: string | null;
}

export interface OnboardingCelebrityAdmireResponse {
  step: 'celebrity_admire';
  celebrityName: string | null;
}

export interface OnboardingCelebrityResultResponse {
  step: 'celebrity_result';
  resultCelebrity: string;
  lookalike: string | null;
  similarImage: string | null;
  admire: string | null;
}

export interface OnboardingKpopLookalikeResponse {
  step: 'kpop_lookalike';
  selection: {
    starId: string;
    starName: string;
    imageUrl: string;
  };
}

export interface OnboardingServiceInterestsResponse {
  step: 'service_interests';
  services: ServiceType[];
}

export type OnboardingResponseInput =
  | OnboardingCelebrityLookalikeResponse
  | OnboardingCelebritySimilarImageResponse
  | OnboardingCelebrityAdmireResponse
  | OnboardingCelebrityResultResponse
  | OnboardingKpopLookalikeResponse
  | OnboardingServiceInterestsResponse;

export interface OnboardingResponseRecord {
  step: OnboardingStepKey;
  data: OnboardingResponseInput;
  version: number;
  isCompletedStep: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  completed: boolean;
  responses: Partial<Record<OnboardingStepKey, OnboardingResponseRecord>>;
  pendingSteps: OnboardingStepKey[];
  flowId: string;
  flowVersion: string;
  variantId: string;
  steps: OnboardingStepMeta[];
}

export interface OnboardingStepMeta {
  key: OnboardingStepKey;
  title: string;
  subtitle?: string;
  required: boolean;
  shareWithStylist?: boolean;
}
