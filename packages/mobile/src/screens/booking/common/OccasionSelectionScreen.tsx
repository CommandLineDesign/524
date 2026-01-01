import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ContinueButton } from '../../../components/booking';
import { SelectionItem } from '../../../components/common';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing, typography } from '../../../theme';

interface OccasionSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  progress: number;
}

// Simple flat list of occasions matching Figma design
const OCCASIONS = ['결혼식', '상견례', '소개팅', '텍스트', '텍스트'];

export function OccasionSelectionScreen({
  onContinue,
  onBack,
  progress,
}: OccasionSelectionScreenProps) {
  const { occasion, setOccasion } = useBookingFlowStore();
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(occasion);

  const handleContinue = () => {
    if (selectedOccasion) {
      setOccasion(selectedOccasion);
      onContinue();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>어디서 예뻐지실 건가요?</Text>

        <FlatList
          data={OCCASIONS}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SelectionItem
              label={item}
              selected={selectedOccasion === item}
              onPress={() => setSelectedOccasion(item)}
              accessibilityLabel={`${item} 선택`}
            />
          )}
        />
      </View>

      <View style={styles.footer}>
        <ContinueButton label="다음" onPress={handleContinue} disabled={!selectedOccasion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
