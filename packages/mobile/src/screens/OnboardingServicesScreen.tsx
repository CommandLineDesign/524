import { type ServiceType } from '@524/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

import {
  MultiSelectButtons,
  type MultiSelectOption,
} from '../components/onboarding/MultiSelectButtons';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCompleteOnboarding, useSaveOnboardingResponse } from '../query/onboarding';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

const SERVICE_OPTIONS: MultiSelectOption[] = [
  { id: 'hair', label: 'Hair styling' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'combo', label: 'Hair + Makeup' },
];

export function OnboardingServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<ServiceType[]>([]);
  const { mutateAsync: saveResponse, isPending: saving } = useSaveOnboardingResponse();
  const { mutateAsync: complete, isPending: completing } = useCompleteOnboarding();
  const { setUserOnboardingComplete } = useAuthStore();

  const canSubmit = useMemo(() => selected.length > 0, [selected]);

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id as ServiceType)
        ? prev.filter((item) => item !== id)
        : [...prev, id as ServiceType]
    );
  };

  const handleFinish = async () => {
    if (!canSubmit) {
      Alert.alert('Pick at least one', 'Tell us which services you are interested in.');
      return;
    }

    try {
      await saveResponse({
        step: 'service_interests',
        services: selected,
      });
      await complete();
      await setUserOnboardingComplete(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Could not save', (error as Error)?.message ?? 'Please try again.');
    }
  };

  return (
    <OnboardingLayout
      title="Which services are you interested in?"
      subtitle="Select all that apply. You can change these later."
      step={2}
      totalSteps={2}
      footer={
        <Button
          title={saving || completing ? 'Saving...' : 'Finish'}
          onPress={handleFinish}
          disabled={!canSubmit || saving || completing}
        />
      }
    >
      <View style={{ marginBottom: 12 }}>
        <MultiSelectButtons options={SERVICE_OPTIONS} selected={selected} onToggle={toggleOption} />
      </View>
      <Text style={{ color: colors.muted }}>
        We will use this to tailor offers, artists, and content to your preferences.
      </Text>
    </OnboardingLayout>
  );
}
