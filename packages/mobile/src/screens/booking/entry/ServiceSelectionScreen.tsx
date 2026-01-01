import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ContinueButton } from '../../../components/booking';
import { SelectionItem } from '../../../components/common';
import {
  type ExtendedServiceType,
  serviceOptions,
  serviceSelectionStrings,
} from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing, typography } from '../../../theme';

interface ServiceSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  progress: number;
}

export function ServiceSelectionScreen({
  onContinue,
  onBack,
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
    <View style={styles.container}>
      {/* Close button */}
      {onBack && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{serviceSelectionStrings.title}</Text>

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

      {/* Footer with Continue Button */}
      <View style={styles.footer}>
        <ContinueButton
          label={serviceSelectionStrings.continueButton}
          onPress={handleContinue}
          disabled={!selectedService}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginTop: 180,
    marginBottom: 50,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
