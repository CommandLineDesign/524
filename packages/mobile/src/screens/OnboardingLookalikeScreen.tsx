import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Button, View } from 'react-native';

import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { SelectableCard } from '../components/onboarding/SelectableCard';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSaveOnboardingResponse } from '../query/onboarding';

const KPOP_STARS = [
  {
    id: 'iu',
    name: 'IU',
    imageUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'jennie',
    name: 'Jennie (Blackpink)',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'wonyoung',
    name: 'Jang Wonyoung (IVE)',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sinb',
    name: 'SinB (GFriend/VIVIZ)',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'karina',
    name: 'Karina (aespa)',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
];

export function OnboardingLookalikeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { mutateAsync, isPending } = useSaveOnboardingResponse();

  const selectedStar = useMemo(
    () => KPOP_STARS.find((star) => star.id === selectedId),
    [selectedId]
  );

  const handleContinue = async () => {
    if (!selectedStar) {
      Alert.alert('Pick one', 'Please pick the closest match to continue.');
      return;
    }

    try {
      await mutateAsync({
        step: 'kpop_lookalike',
        selection: {
          starId: selectedStar.id,
          starName: selectedStar.name,
          imageUrl: selectedStar.imageUrl,
        },
      });
      navigation.navigate('OnboardingServices');
    } catch (error) {
      Alert.alert('Save failed', (error as Error)?.message ?? 'Could not save selection');
    }
  };

  return (
    <OnboardingLayout
      title="Which K-pop star do you resemble most?"
      subtitle="We will use this to personalize recommendations."
      step={1}
      totalSteps={2}
      footer={
        <Button
          title={isPending ? 'Saving...' : 'Continue'}
          onPress={handleContinue}
          disabled={isPending}
        />
      }
    >
      <View>
        {KPOP_STARS.map((star) => (
          <SelectableCard
            key={star.id}
            title={star.name}
            imageUrl={star.imageUrl}
            selected={selectedId === star.id}
            onPress={() => setSelectedId(star.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}
