import {
  type OnboardingResponseInput,
  type OnboardingStepKey,
  type ServiceType,
} from '@524/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { MultiSelectButtons } from '../components/onboarding/MultiSelectButtons';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { SelectableCard } from '../components/onboarding/SelectableCard';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  useCompleteOnboarding,
  useOnboardingState,
  useSaveOnboardingResponse,
} from '../query/onboarding';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Temporary internal-testing images from Wikimedia Commons (CC BY / CC BY-SA).
// For production, replace with licensed/hosted assets.
// Temporary demo images (Unsplash) for reliability in Expo/React Native.

const KPOP_STARS = [
  {
    id: 'iu',
    name: 'IU',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/IU_singer.jpg',
  },
  {
    id: 'jennie',
    name: 'Jennie (Blackpink)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Jennie_Kim_2023.jpg',
  },
  {
    id: 'wonyoung',
    name: 'Jang Wonyoung (IVE)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Jang_Won-young_IVE_Marie_Claire_Korea.jpg/640px-Jang_Won-young_IVE_Marie_Claire_Korea.jpg',
  },
  {
    id: 'sinb',
    name: 'SinB (GFriend/VIVIZ)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/SinB_August_2024_%283x4_cropped%29.jpg/640px-SinB_August_2024_%283x4_cropped%29.jpg',
  },
  {
    id: 'karina',
    name: 'Karina (aespa)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Aespa_Karina_%EC%B9%B4%EB%A6%AC%EB%82%98_20240618_04_%28cropped%29.png/640px-Aespa_Karina_%EC%B9%B4%EB%A6%AC%EB%82%98_20240618_04_%28cropped%29.png',
  },
];

type StepRendererProps = {
  onSubmit: (payload: OnboardingResponseInput) => Promise<void>;
  stepTitle: string;
  stepSubtitle?: string;
  totalSteps: number;
  stepIndex: number;
  initialResponse?: OnboardingResponseInput;
  submitting: boolean;
};

function KpopLookalikeStep({
  onSubmit,
  stepTitle,
  stepSubtitle,
  totalSteps,
  stepIndex,
  initialResponse,
  submitting,
}: StepRendererProps) {
  const screenWidth = Dimensions.get('window').width;
  // Keep the card fully visible within common device widths and layout padding
  const cardWidth = Math.min(320, screenWidth - 32);
  const itemSpacing = 0; // hide neighboring cards; spacing handled inside card padding
  const interval = cardWidth + itemSpacing;

  const initialSelectionId =
    initialResponse?.step === 'kpop_lookalike'
      ? initialResponse.selection.starId
      : KPOP_STARS[0].id;
  const initialIndex = Math.max(
    0,
    KPOP_STARS.findIndex((s) => s.id === initialSelectionId)
  );

  // Create loop data with duplicates for seamless wrapping
  const loopData = useMemo(
    () => [
      KPOP_STARS[KPOP_STARS.length - 1], // Last item duplicated at start
      ...KPOP_STARS, // Original items
      KPOP_STARS[0], // First item duplicated at end
    ],
    []
  );

  const [loopIndex, setLoopIndex] = useState(initialIndex + 1); // Start at +1 due to duplicate at start
  const loopIndexRef = useRef(loopIndex); // Ref to track current index for PanResponder

  // Sync ref with state
  useEffect(() => {
    loopIndexRef.current = loopIndex;
  }, [loopIndex]);

  // Calculate offset to center the current card; container width is cardWidth
  const centerOffset = (cardWidth - interval) / 2;
  const initialTranslate = -(initialIndex + 1) * interval + centerOffset;

  const animatedValue = useRef(new Animated.Value(initialTranslate)).current;
  const isAnimating = useRef(false);

  // Get the actual data index from loop index
  const getActualIndex = (index: number) => {
    if (index === 0) return KPOP_STARS.length - 1; // Last item
    if (index === loopData.length - 1) return 0; // First item
    return index - 1; // Normal items
  };

  const currentIndex = getActualIndex(loopIndex);

  const handleContinue = async () => {
    const selectedStar = KPOP_STARS[currentIndex];
    if (!selectedStar) return;
    await onSubmit({
      step: 'kpop_lookalike',
      selection: {
        starId: selectedStar.id,
        starName: selectedStar.name,
        imageUrl: selectedStar.imageUrl,
      },
    });
  };

  const animateToIndex = (targetLoopIndex: number, instantReset = false) => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    loopIndexRef.current = targetLoopIndex; // keep gesture logic in sync immediately
    setLoopIndex(targetLoopIndex);

    if (instantReset) {
      // Instant reset to real position (no animation)
      animatedValue.setValue(-targetLoopIndex * interval + centerOffset);
      isAnimating.current = false;
    } else {
      // Animated transition
      Animated.spring(animatedValue, {
        toValue: -targetLoopIndex * interval + centerOffset,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start(() => {
        isAnimating.current = false;
        // Check if we need to reset position after animation (when at duplicated items)
        if (targetLoopIndex === 0) {
          // At start duplicate, reset to real last item
          animateToIndex(KPOP_STARS.length, true);
        } else if (targetLoopIndex === loopData.length - 1) {
          // At end duplicate, reset to real first item
          animateToIndex(1, true);
        }
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      // Capture immediately; allow interrupting current animation by stopping it
      onStartShouldSetPanResponder: () => {
        animatedValue.stopAnimation();
        isAnimating.current = false;
        return true;
      },
      onStartShouldSetPanResponderCapture: () => {
        animatedValue.stopAnimation();
        isAnimating.current = false;
        return true;
      },
      // Keep ownership on any horizontal intent (very low threshold)
      onMoveShouldSetPanResponder: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy);
        return isHorizontal && Math.abs(g.dx) > 1;
      },
      onMoveShouldSetPanResponderCapture: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy);
        return isHorizontal && Math.abs(g.dx) > 1;
      },
      onPanResponderTerminationRequest: () => false, // Don't let parent ScrollView steal gesture
      onPanResponderRelease: (_, g) => {
        const currentLoopIndex = loopIndexRef.current;
        const dx = g.dx;
        const vx = g.vx;
        // Allow tiny flicks or slight velocity
        const goNext = dx < -2 || vx < -0.03;
        const goPrev = dx > 2 || vx > 0.03;

        if (goNext && !goPrev) {
          animateToIndex(currentLoopIndex + 1);
        } else if (goPrev && !goNext) {
          animateToIndex(currentLoopIndex - 1);
        }
      },
    })
  ).current;

  return (
    <OnboardingLayout
      title={stepTitle}
      subtitle={stepSubtitle}
      step={stepIndex + 1}
      totalSteps={totalSteps}
      footer={
        <Text
          onPress={handleContinue}
          style={{
            textAlign: 'center',
            backgroundColor: submitting ? colors.border : colors.accent,
            padding: spacing.md,
            borderRadius: 12,
            color: '#fff',
            fontWeight: '700',
          }}
        >
          {submitting ? 'Saving...' : 'Continue'}
        </Text>
      }
    >
      <View
        {...panResponder.panHandlers}
        style={{
          width: cardWidth,
          height: 450,
          justifyContent: 'center',
          overflow: 'hidden',
          alignSelf: 'center',
        }}
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateX: animatedValue }],
          }}
        >
          {loopData.map((item, index) => {
            const isSelected = getActualIndex(index) === currentIndex;
            const actualIndex = getActualIndex(index);
            return (
              <View
                key={`${item.id}-${index}`}
                style={{
                  width: cardWidth,
                  marginHorizontal: itemSpacing / 2,
                  alignItems: 'center',
                }}
              >
                <SelectableCard
                  imageUrl={item.imageUrl}
                  selected={isSelected}
                  onPress={() => animateToIndex(index)}
                />
              </View>
            );
          })}
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

function ServiceInterestsStep({
  onSubmit,
  stepTitle,
  stepSubtitle,
  totalSteps,
  stepIndex,
  initialResponse,
  submitting,
}: StepRendererProps) {
  const initialServices =
    initialResponse?.step === 'service_interests' ? initialResponse.services : [];
  const [selected, setSelected] = useState<ServiceType[]>(initialServices ?? []);
  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id as ServiceType) ? prev.filter((x) => x !== id) : [...prev, id as ServiceType]
    );
  };

  const canSubmit = selected.length > 0;

  const handleFinish = async () => {
    if (!canSubmit) {
      Alert.alert('Pick at least one', 'Tell us which services you are interested in.');
      return;
    }
    await onSubmit({
      step: 'service_interests',
      services: selected,
    });
  };

  return (
    <OnboardingLayout
      title={stepTitle}
      subtitle={stepSubtitle}
      step={stepIndex + 1}
      totalSteps={totalSteps}
      footer={
        <Text
          onPress={handleFinish}
          style={{
            textAlign: 'center',
            backgroundColor: !canSubmit || submitting ? colors.border : colors.accent,
            padding: spacing.md,
            borderRadius: 12,
            color: '#fff',
            fontWeight: '700',
          }}
        >
          {submitting ? 'Saving...' : 'Finish'}
        </Text>
      }
    >
      <View style={{ marginBottom: 12 }}>
        <MultiSelectButtons
          options={[
            { id: 'hair', label: 'Hair styling' },
            { id: 'makeup', label: 'Makeup' },
            { id: 'combo', label: 'Hair + Makeup' },
          ]}
          selected={selected}
          onToggle={toggle}
        />
      </View>
      <Text style={{ color: '#6b7280' }}>
        We will use this to tailor offers, artists, and content to your preferences.
      </Text>
    </OnboardingLayout>
  );
}

const STEP_RENDERERS: Record<OnboardingStepKey, React.FC<StepRendererProps>> = {
  kpop_lookalike: KpopLookalikeStep,
  service_interests: ServiceInterestsStep,
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
        routes: [{ name: 'Welcome' }],
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
        routes: [{ name: 'Welcome' }],
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
          padding: theme.spacing.lg,
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
