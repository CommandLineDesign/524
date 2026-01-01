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

/**
 * Onboarding configuration for celebrity-based personalization flow.
 *
 * Note on `required` field:
 * - `required: false` means the user can skip the step without providing input
 * - `required: true` means the user must interact with the step to proceed
 * - Currently all steps are shown sequentially in the flow regardless of required status
 * - The required field affects validation, not flow navigation (all steps must be visited)
 */
export const onboardingConfig: ActiveOnboardingConfig = {
  defaultFlowId: 'default',
  flows: [
    {
      id: 'default',
      version: 'v2',
      defaultVariantId: 'variant-a',
      variants: [
        {
          id: 'variant-a',
          weight: 1,
          steps: [
            {
              key: 'celebrity_lookalike',
              title: '비슷하다고 들어본 연예인이 있나요?',
              subtitle: '주변에서 닮았다고 들어본 연예인이 있다면 알려주세요',
              required: false, // User can skip without providing a name
              shareWithStylist: true,
              analyticsTag: 'celebrity_lookalike_v2',
            },
            {
              key: 'celebrity_similar_image',
              title: '비슷한 이미지를 원하는 연예인이 있나요?',
              subtitle: '원하는 스타일의 연예인 이름을 알려주세요',
              required: false, // User can skip without providing a name
              shareWithStylist: true,
              analyticsTag: 'celebrity_similar_image_v2',
            },
            {
              key: 'celebrity_admire',
              title: '예쁘다고 생각하는 연예인이 있나요?',
              subtitle: '동경하거나 예쁘다고 생각하는 연예인을 알려주세요',
              required: false, // User can skip without providing a name
              shareWithStylist: true,
              analyticsTag: 'celebrity_admire_v2',
            },
            {
              key: 'celebrity_result',
              title: '당신만의 특별한 스타일',
              subtitle: '입력하신 정보를 바탕으로 맞춤 추천을 제공합니다',
              required: true, // User must complete this step to finish onboarding
              shareWithStylist: true,
              analyticsTag: 'celebrity_result_v2',
            },
          ],
        },
      ],
    },
  ],
};
