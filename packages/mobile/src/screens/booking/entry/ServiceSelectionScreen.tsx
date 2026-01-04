import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { SelectionItem } from '../../../components/common';
import {
  type ExtendedServiceType,
  serviceOptions,
  serviceSelectionStrings,
} from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface ServiceSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

export function ServiceSelectionScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
}: ServiceSelectionScreenProps) {
  const { serviceType, setServiceType } = useBookingFlowStore();
  const [selectedService, setSelectedService] = useState<ExtendedServiceType | null>(
    serviceType || null
  );

  const handleContinue = () => {
    if (selectedService) {
      setServiceType(selectedService);
      onContinue();
    }
  };

  return (
    <BookingLayout
      title={serviceSelectionStrings.title}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={
        <ContinueButton
          label={serviceSelectionStrings.continueButton}
          onPress={handleContinue}
          disabled={!selectedService}
        />
      }
      testID="service-selection-screen"
    >
      <View style={styles.content}>
        <FlatList
          data={serviceOptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SelectionItem
              label={item.label}
              selected={selectedService === item.id}
              onPress={() => setSelectedService(item.id)}
              accessibilityLabel={`${item.label} 선택`}
              accessibilityHint={`${item.label} 서비스를 선택합니다`}
              testID={`service-option-${item.id}`}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  list: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
});
