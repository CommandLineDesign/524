import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SelectionItem } from '../components/common';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingStore } from '../store/bookingStore';
import { borderRadius } from '../theme/borderRadius';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

// Simple flat list of occasions matching Figma design
const OCCASIONS = ['결혼식', '상견례', '소개팅', '데이트', '면접'];

type OccasionSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OccasionSelection'
>;

export function OccasionSelectionScreen() {
  const navigation = useNavigation<OccasionSelectionNavigationProp>();
  const setOccasion = useBookingStore((state) => state.setOccasion);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedOccasion) {
      setOccasion(selectedOccasion);
      navigation.navigate('BookingSummary');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Text style={styles.title}>어디서 예뻐지실 건가요?</Text>

      <FlatList
        data={OCCASIONS}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SelectionItem
            label={item}
            selected={selectedOccasion === item}
            onPress={() => setSelectedOccasion(item)}
            accessibilityLabel={`${item} 선택`}
          />
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="다음"
          style={[styles.continueButton, !selectedOccasion && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedOccasion}
        >
          <Text style={styles.continueButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.text,
    marginTop: 212,
    marginBottom: 72,
  },
  listContent: {
    gap: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  continueButton: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
    color: colors.background,
    letterSpacing: -0.408,
    textAlign: 'center',
  },
});
