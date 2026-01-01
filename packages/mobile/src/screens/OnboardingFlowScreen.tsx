import { type OnboardingResponseInput, type OnboardingStepKey } from '@524/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  useCompleteOnboarding,
  useOnboardingState,
  useSaveOnboardingResponse,
} from '../query/onboarding';
import { useAuthStore } from '../store/authStore';
import { useBookingFlowStore } from '../store/bookingFlowStore';
import { colors, spacing } from '../theme';
import { CelebrityInputScreen, CelebrityResultScreen } from './booking/entry';

type StepRendererProps = {
  onSubmit: (payload: OnboardingResponseInput) => Promise<void>;
  stepTitle: string;
  stepSubtitle?: string;
  totalSteps: number;
  stepIndex: number;
  initialResponse?: OnboardingResponseInput;
  submitting: boolean;
};

// Wrapper components that adapt booking screens to onboarding interface
// CelebrityInputScreen manages its own state via useBookingFlowStore
function CelebrityLookalikeStepRenderer({ onSubmit }: StepRendererProps) {
  const handleContinue = async () => {
    // Get the value that CelebrityInputScreen stored
    const { celebrities } = useBookingFlowStore.getState();
    await onSubmit({
      step: 'celebrity_lookalike',
      celebrityName: celebrities.lookalike,
    });
  };

  const handleSkip = async () => {
    await onSubmit({
      step: 'celebrity_lookalike',
      celebrityName: null,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CelebrityInputScreen step={1} onContinue={handleContinue} onSkip={handleSkip} progress={0} />
    </View>
  );
}

function CelebritySimilarImageStepRenderer({ onSubmit }: StepRendererProps) {
  const handleContinue = async () => {
    const { celebrities } = useBookingFlowStore.getState();
    await onSubmit({
      step: 'celebrity_similar_image',
      celebrityName: celebrities.similarImage,
    });
  };

  const handleSkip = async () => {
    await onSubmit({
      step: 'celebrity_similar_image',
      celebrityName: null,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CelebrityInputScreen step={2} onContinue={handleContinue} onSkip={handleSkip} progress={0} />
    </View>
  );
}

function CelebrityAdmireStepRenderer({ onSubmit }: StepRendererProps) {
  const handleContinue = async () => {
    const { celebrities } = useBookingFlowStore.getState();
    await onSubmit({
      step: 'celebrity_admire',
      celebrityName: celebrities.admire,
    });
  };

  const handleSkip = async () => {
    await onSubmit({
      step: 'celebrity_admire',
      celebrityName: null,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CelebrityInputScreen step={3} onContinue={handleContinue} onSkip={handleSkip} progress={0} />
    </View>
  );
}

function CelebrityResultStepRenderer({ onSubmit }: StepRendererProps) {
  // Access parent component's responses via context or derive from initialResponse
  // The CelebrityResultScreen reads from bookingFlowStore internally
  const handleContinue = async () => {
    // Get the result celebrity from the store (set by CelebrityResultScreen)
    const { resultCelebrity, celebrities } = useBookingFlowStore.getState();

    // Derive the result celebrity from inputs, with fallback to default
    const derivedCelebrity =
      resultCelebrity ||
      celebrities.lookalike ||
      celebrities.similarImage ||
      celebrities.admire ||
      '아이유'; // Default fallback when no input provided

    await onSubmit({
      step: 'celebrity_result',
      resultCelebrity: derivedCelebrity,
      lookalike: celebrities.lookalike,
      similarImage: celebrities.similarImage,
      admire: celebrities.admire,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CelebrityResultScreen onContinue={handleContinue} progress={0} />
    </View>
  );
}

const STEP_RENDERERS: Partial<Record<OnboardingStepKey, React.FC<StepRendererProps>>> = {
  celebrity_lookalike: CelebrityLookalikeStepRenderer,
  celebrity_similar_image: CelebritySimilarImageStepRenderer,
  celebrity_admire: CelebrityAdmireStepRenderer,
  celebrity_result: CelebrityResultStepRenderer,
};

export function OnboardingFlowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loadSession } = useAuthStore();
  const { data, isLoading, refetch } = useOnboardingState(user?.id);
  const { mutateAsync: saveResponse, isPending: saving } = useSaveOnboardingResponse(user?.id);
  const { mutateAsync: completeOnboarding, isPending: completing } = useCompleteOnboarding(
    user?.id
  );
  const { setUserOnboardingComplete } = useAuthStore();

  const steps = data?.steps ?? [];
  const responses = data?.responses ?? {};

  const activeStepKey: OnboardingStepKey | null = useMemo(() => {
    if (!steps.length) return null;
    const pending = data?.pendingSteps ?? [];
    if (pending.length) return pending[0];
    // fallback: first step not in responses
    const firstOpen = steps.find((s) => !responses[s.key]);
    return firstOpen?.key ?? steps[0].key;
  }, [steps, responses, data?.pendingSteps]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (data?.completed) {
      setUserOnboardingComplete(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [data?.completed, navigation, setUserOnboardingComplete]);

  const handleSubmit = async (payload: OnboardingResponseInput) => {
    const updatedState = await saveResponse(payload);

    if (updatedState.completed) {
      await completeOnboarding();
      await setUserOnboardingComplete(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    }

    await refetch();
  };

  if (isLoading || !data || !activeStepKey) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#d4a574" />
      </View>
    );
  }

  const StepComponent = STEP_RENDERERS[activeStepKey];
  const stepMeta = steps.find((s) => s.key === activeStepKey);
  const initialResponse = responses[activeStepKey]?.data;

  if (!StepComponent || !stepMeta) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}>
          Onboarding step not supported. Please try again later.
        </Text>
      </ScrollView>
    );
  }

  return (
    <StepComponent
      onSubmit={handleSubmit}
      stepTitle={stepMeta.title}
      stepSubtitle={stepMeta.subtitle}
      totalSteps={steps.length}
      stepIndex={steps.findIndex((s) => s.key === activeStepKey)}
      initialResponse={initialResponse as OnboardingResponseInput | undefined}
      submitting={saving || completing}
    />
  );
}
