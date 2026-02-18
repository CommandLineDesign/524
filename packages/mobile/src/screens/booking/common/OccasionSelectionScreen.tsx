/**
 * @deprecated This screen is no longer used in the booking flow.
 * Occasion selection has been moved to PaymentConfirmationScreen as a typeahead.
 * Kept for potential future use.
 * See: OccasionTypeahead component in components/booking/
 */
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { SelectionItem } from '../../../components/common';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { spacing } from '../../../theme';

interface OccasionSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

// Simple flat list of occasions matching Figma design
const OCCASIONS = ['결혼식', '상견례', '소개팅', '텍스트', '텍스트'];

export function OccasionSelectionScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
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
    <BookingLayout
      title="어디서 예뻐지실 건가요?"
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={<ContinueButton label="다음" onPress={handleContinue} disabled={!selectedOccasion} />}
      testID="occasion-selection-screen"
    >
      <View style={styles.content}>
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
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    gap: spacing.md,
  },
});
