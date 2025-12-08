import type { OnboardingStepKey, OnboardingStepMeta } from './onboarding.js';

export interface OnboardingStepDefinition extends OnboardingStepMeta {
  key: OnboardingStepKey;
  analyticsTag?: string;
}

export interface OnboardingVariant {
  id: string;
  weight: number;
  steps: OnboardingStepDefinition[];
}

export interface OnboardingFlow {
  id: string;
  version: string;
  variants: OnboardingVariant[];
  defaultVariantId: string;
}

export interface ActiveOnboardingConfig {
  flows: OnboardingFlow[];
  defaultFlowId: string;
}

export const onboardingConfig: ActiveOnboardingConfig = {
  defaultFlowId: 'default',
  flows: [
    {
      id: 'default',
      version: 'v1',
      defaultVariantId: 'variant-a',
      variants: [
        {
          id: 'variant-a',
          weight: 1,
          steps: [
            {
              key: 'kpop_lookalike',
              title: 'Which K-pop star do you resemble most?',
              subtitle: 'We will use this to personalize recommendations.',
              required: true,
              shareWithStylist: true,
              analyticsTag: 'kpop_lookalike_v1',
            },
            {
              key: 'service_interests',
              title: 'Which services are you interested in?',
              subtitle: 'Select all that apply. You can change these later.',
              required: true,
              shareWithStylist: true,
              analyticsTag: 'service_interests_v1',
            },
          ],
        },
      ],
    },
  ],
};
