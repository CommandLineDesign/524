import type { ServiceType } from './constants.js';

export type OnboardingStepKey = 'kpop_lookalike' | 'service_interests';

export interface KpopLookalikeSelection {
  starId: string;
  starName?: string;
  imageUrl?: string;
}

export interface OnboardingKpopLookalikeResponse {
  step: 'kpop_lookalike';
  selection: KpopLookalikeSelection;
}

export interface OnboardingServiceInterestsResponse {
  step: 'service_interests';
  services: ServiceType[];
  otherText?: string | null;
}

export type OnboardingResponseInput =
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
